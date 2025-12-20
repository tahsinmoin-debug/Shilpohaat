'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraARViewerProps {
  imageUrl: string;
  artworkTitle: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
}

export default function CameraARViewer({ imageUrl, artworkTitle, dimensions }: CameraARViewerProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    return () => {
      // Cleanup: stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setCameraError('Failed to start camera');
        });
      }

      setShowCamera(true);

      // Start rendering AR overlay
      setTimeout(() => {
        renderAROverlay();
      }, 500);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  };

  const renderAROverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || !video.videoWidth) {
      animationRef.current = requestAnimationFrame(renderAROverlay);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw artwork frame in center
    const frameWidth = canvas.width * 0.6;
    const frameHeight = frameWidth * (dimensions?.height ? dimensions.width / dimensions.height : 3 / 4);
    const frameX = (canvas.width - frameWidth) / 2;
    const frameY = (canvas.height - frameHeight) / 2;

    // Draw the artwork image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, frameX, frameY, frameWidth, frameHeight);
      
      // Draw frame border
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 4;
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

      // Draw dimensions text
      if (dimensions?.width && dimensions?.height) {
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`,
          canvas.width / 2,
          frameY + frameHeight + 30
        );
      }

      // Draw title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(artworkTitle, canvas.width / 2, frameY - 20);

      // Draw instructions
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Move your phone to adjust position and size', canvas.width / 2, canvas.height - 40);
      ctx.fillText('Pinch to zoom in/out', canvas.width / 2, canvas.height - 15);
    };
    img.src = imageUrl;

    animationRef.current = requestAnimationFrame(renderAROverlay);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Close Button */}
        <button
          onClick={stopCamera}
          className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video and Canvas */}
        <div className="relative flex-1">
          {/* Hidden video element */}
          <video
            ref={videoRef}
            className="hidden"
            playsInline
          />

          {/* Canvas showing AR overlay */}
          {cameraError ? (
            <div className="flex items-center justify-center h-full bg-black">
              <div className="bg-red-600 text-white p-6 rounded-lg max-w-sm text-center">
                <p className="font-semibold mb-2">❌ Camera Error</p>
                <p className="text-sm">{cameraError}</p>
                <button
                  onClick={stopCamera}
                  className="mt-4 bg-white text-red-600 px-4 py-2 rounded font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Bottom Info */}
        <div className="bg-black/80 backdrop-blur-md text-white p-4 text-center">
          <p className="text-sm">📱 AR mode active - Point at a wall to see the artwork</p>
        </div>
      </div>
    );
  }

  // Button to start camera
  return (
    <button
      onClick={startCamera}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>View on Wall (AR Camera)</span>
    </button>
  );
}
