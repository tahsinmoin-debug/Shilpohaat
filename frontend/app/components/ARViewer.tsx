'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface ARViewerProps {
  modelUrl: string;
  artworkTitle: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
  poster?: string; // Optional thumbnail image
}

export default function ARViewer({ modelUrl, artworkTitle, dimensions, poster }: ARViewerProps) {
  const [isARSupported, setIsARSupported] = useState(true);
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false);
  const [showARModal, setShowARModal] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);

  useEffect(() => {
    // Check if modelUrl is an image or GLB
    if (modelUrl) {
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(modelUrl);
      setIsImageMode(isImage);
    }

    // Check if AR is supported
    const checkARSupport = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isChromeAndroid = isAndroid && /Chrome/.test(navigator.userAgent);
      const isSafariIOS = isIOS && /Safari/.test(navigator.userAgent);
      
      setIsARSupported(isChromeAndroid || isSafariIOS);
    };

    checkARSupport();
  }, [modelUrl]);

  const handleARClick = () => {
    setShowARModal(true);
  };

  const closeModal = () => {
    setShowARModal(false);
  };

  // Calculate scale based on dimensions (convert to meters for AR)
  const getScale = () => {
    if (!dimensions?.width || !dimensions?.height) return '1 1 1';
    
    const unit = dimensions.unit || 'cm';
    let widthM = dimensions.width;
    let heightM = dimensions.height;
    const depthM = dimensions.depth || 0.05; // Default 5cm depth

    // Convert to meters
    if (unit === 'cm') {
      widthM = widthM / 100;
      heightM = heightM / 100;
    } else if (unit === 'in') {
      widthM = widthM * 0.0254;
      heightM = heightM * 0.0254;
    }

    return `${widthM} ${heightM} ${depthM}`;
  };

  if (!modelUrl) return null;

  return (
    <>
      {/* Load model-viewer library */}
      <Script
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        type="module"
        onLoad={() => setIsModelViewerLoaded(true)}
      />

      {/* AR Button */}
      <button
        onClick={handleARClick}
        disabled={!isModelViewerLoaded}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>View on Wall (AR)</span>
        {!isARSupported && (
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Mobile Only</span>
        )}
      </button>

      {!isARSupported && (
        <p className="text-sm text-gray-400 text-center mt-2">
          📱 AR preview works best on mobile devices (iOS Safari or Android Chrome)
        </p>
      )}

      {/* AR Modal */}
      {showARModal && isModelViewerLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-2">{artworkTitle}</h2>
              <p className="text-gray-300 text-sm">
                {isARSupported 
                  ? '📱 Tap the AR icon below to view this artwork on your wall in real size'
                  : '💻 Open on mobile for AR experience'
                }
              </p>
              {dimensions?.width && dimensions?.height && (
                <p className="text-gray-400 text-xs mt-1">
                  Size: {dimensions.width} × {dimensions.height} {dimensions.unit}
                </p>
              )}
            </div>

            {/* Model Viewer */}
            <div className="relative bg-gray-800" style={{ height: '60vh', minHeight: '400px' }}>
              <model-viewer
                src={modelUrl}
                alt={artworkTitle}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                touch-action="pan-y"
                auto-rotate
                shadow-intensity="1"
                poster={poster}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, #1f2937, #111827)',
                }}
                ar-scale="fixed"
              >
                {/* AR Button Slot */}
                <button
                  slot="ar-button"
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full shadow-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  View in Your Space
                </button>

                {/* Loading/Error Messages */}
                <div slot="progress-bar" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    <p className="text-white text-sm">Loading 3D model...</p>
                  </div>
                </div>
              </model-viewer>
            </div>

            {/* Instructions */}
            <div className="bg-gray-900 p-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Rotate & Zoom</h3>
                    <p className="text-gray-400">Drag to rotate, pinch to zoom the 3D model</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">AR View</h3>
                    <p className="text-gray-400">Click "View in Your Space" to see it on your wall</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Real Size</h3>
                    <p className="text-gray-400">Artwork appears in actual dimensions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TypeScript fix for model-viewer */}
      <style jsx global>{`
        model-viewer {
          display: block;
        }
      `}</style>
    </>
  );
}

// Type declaration for model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src: string;
          alt?: string;
          ar?: boolean;
          'ar-modes'?: string;
          'camera-controls'?: boolean;
          'touch-action'?: string;
          'auto-rotate'?: boolean;
          'shadow-intensity'?: string;
          poster?: string;
          'ar-scale'?: string;
        },
        HTMLElement
      >;
    }
  }
}
