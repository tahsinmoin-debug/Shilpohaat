'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

interface WebXRViewerProps {
  modelUrl: string;
  artworkTitle: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
  poster?: string;
  fallback?: React.ReactNode;
}

export default function WebXRViewer({ modelUrl, artworkTitle, dimensions, fallback }: WebXRViewerProps) {
  const [supported, setSupported] = useState(false);
  const [show, setShow] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);

  const scaleVec = useMemo<[number, number, number]>(() => {
    if (!dimensions?.width || !dimensions?.height) return [1, 1, 1];
    const unit = dimensions.unit || 'cm';
    const toMeters = (v: number) => (unit === 'cm' ? v / 100 : unit === 'in' ? v * 0.0254 : v);
    return [toMeters(dimensions.width), toMeters(dimensions.height), toMeters(dimensions.depth ?? 5)];
  }, [dimensions]);

  useEffect(() => {
    let mounted = true;
    async function checkSupport() {
      try {
        const hasXR = typeof navigator !== 'undefined' && 'xr' in navigator;
        if (!hasXR) { if (mounted) setSupported(false); return; }
        // @ts-ignore
        const ok = await (navigator as any).xr?.isSessionSupported?.('immersive-ar');
        if (mounted) setSupported(!!ok);
      } catch { if (mounted) setSupported(false); }
    }
    checkSupport();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!show || !mountRef.current) return;

    const container = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Reticle
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.1, 32),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa })
    );
    reticle.rotation.x = -Math.PI / 2;
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Load model
    const loader = new GLTFLoader();
    let model: THREE.Object3D | null = null;
    loader.load(modelUrl, (gltf) => {
      model = gltf.scene;
      model.scale.set(scaleVec[0], scaleVec[1], scaleVec[2]);
    });

    // AR Button
    const arBtn = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test', 'local-floor'],
      optionalFeatures: ['dom-overlay'],
      // @ts-ignore
      domOverlay: { root: container },
    });
    arBtn.style.position = 'absolute';
    arBtn.style.top = '16px';
    arBtn.style.left = '16px';
    container.appendChild(arBtn);

    let hitTestSource: XRHitTestSource | null = null;
    let localSpace: XRReferenceSpace | null = null;
    let viewerSpace: XRReferenceSpace | null = null;

    function onSessionStart() {
      const session = renderer.xr.getSession();
      if (!session) return;
      session.addEventListener('end', onSessionEnd);
      session.requestReferenceSpace('local').then((space) => { localSpace = space; });
      session.requestReferenceSpace('viewer').then((space) => {
        viewerSpace = space;
        session.requestHitTestSource({ space: viewerSpace }).then((source) => { hitTestSource = source; });
      });
      const controller = renderer.xr.getController(0);
      controller.addEventListener('select', () => {
        if (reticle.visible && model) {
          const pose = reticle.matrix;
          const position = new THREE.Vector3();
          position.setFromMatrixPosition(pose);
          model.position.copy(position);
          scene.add(model);
        }
      });
      scene.add(controller);
    }

    function onSessionEnd() {
      hitTestSource?.cancel();
      hitTestSource = null;
      localSpace = null;
      viewerSpace = null;
    }

    renderer.xr.addEventListener('sessionstart', onSessionStart);

    renderer.setAnimationLoop((time, frame) => {
      if (frame && hitTestSource && localSpace) {
        const results = frame.getHitTestResults(hitTestSource);
        if (results.length > 0) {
          const pose = results[0].getPose(localSpace);
          if (pose) {
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix as unknown as number[]);
          }
        } else {
          reticle.visible = false;
        }
      }
      renderer.render(scene, camera);
    });

    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);
      const session = renderer.xr.getSession();
      session?.end();
      container.innerHTML = '';
    };
  }, [show, modelUrl, scaleVec]);

  if (!modelUrl) return null;

  return (
    <div className="relative">
      {!show ? (
        <div className="space-y-2">
          <button
            onClick={() => setShow(true)}
            disabled={!supported}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 ${
              supported 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed opacity-60'
            } text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ${supported ? 'transform hover:scale-105' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>View in AR (WebXR)</span>
            {!supported && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded">Desktop Only</span>
            )}
          </button>
          {!supported && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 text-center">
                📱 WebXR requires Android Chrome or iOS Safari 17+
              </p>
              {fallback && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-gray-900 px-2 text-gray-400">Fallback Available</span>
                    </div>
                  </div>
                  {fallback}
                </>
              )}
            </div>
          )}
        </div>
      ) : null}

      {show && (
        <div ref={mountRef} className="fixed inset-0 z-50 bg-black" />
      )}
    </div>
  );
}
