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

/**
 * 2D Camera-Based AR Preview
 * 
 * IMPORTANT: This is NOT true AR - it's a 2D image overlay with camera feed.
 * It provides an AR-like visualization for accessibility and cross-device compatibility.
 * 
 * For true 3D AR, use ARViewer.tsx (requires GLB models)
 */
export default function CameraARViewer({ imageUrl, artworkTitle, dimensions }: CameraARViewerProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageLoadedRef = useRef(false);

  // Conversion factor: approximate cm to screen pixels on mobile (3.8 px/cm)
  const CM_TO_PIXELS = 3.8;

  // Pre-load the artwork image with CORS handling
  useEffect(() => {
    setImageLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      imageLoadedRef.current = true;
      setImageLoading(false);
      console.log('✅ Artwork image loaded successfully');
    };
    
    img.onerror = (err) => {
      console.error('❌ Failed to load artwork image:', imageUrl, err);
      // Try fallback URL without transformations
      if (imageUrl.includes('cloudinary')) {
        console.log('⚠️ Cloudinary CORS issue detected. Retrying...');
      }
      setImageLoading(false);
      setCameraError('Unable to load artwork image. CORS or URL issue.');
    };
    
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    return () => {
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
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight,
          });
          videoRef.current?.play().catch(err => {
            console.error('❌ Error playing video:', err);
            setCameraError('Failed to start video playback');
          });
          setShowCamera(true);
          setTimeout(() => renderAROverlay(), 300);
        };

        videoRef.current.onerror = (err) => {
          console.error('❌ Video error:', err);
          setCameraError('Video stream error');
        };
      }
    } catch (err: any) {
      console.error('❌ Camera access error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  };

  const calculateRealWorldDimensions = (): { width: number; height: number } => {
    // Convert cm to approximate screen pixels
    if (dimensions?.width && dimensions?.height) {
      return {
        width: dimensions.width * CM_TO_PIXELS,
        height: dimensions.height * CM_TO_PIXELS,
      };
    }
    return { width: 0, height: 0 };
  };

  const renderAROverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      animationRef.current = requestAnimationFrame(renderAROverlay);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationRef.current = requestAnimationFrame(renderAROverlay);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationRef.current = requestAnimationFrame(renderAROverlay);
      return;
    }

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video feed
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error('❌ Error drawing video:', err);
    }

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions using real-world scaling
    const realDims = calculateRealWorldDimensions();
    let frameWidth: number;
    let frameHeight: number;

    if (realDims.width > 0 && realDims.height > 0) {
      // Use real-world dimensions, but cap to max 60% of screen
      frameWidth = Math.min(realDims.width, canvas.width * 0.6);
      frameHeight = (frameWidth / realDims.width) * realDims.height;
      
      // If still too large, scale down
      if (frameHeight > canvas.height * 0.6) {
        frameHeight = canvas.height * 0.6;
        frameWidth = (frameHeight / realDims.height) * realDims.width;
      }
    } else {
      // Fallback if no dimensions
      frameWidth = canvas.width * 0.6;
      frameHeight = frameWidth * 0.75;
    }

    const frameX = (canvas.width - frameWidth) / 2;
    const frameY = (canvas.height - frameHeight) / 2;

    // Draw artwork image
    if (imageLoadedRef.current && imageRef.current) {
      try {
        ctx.drawImage(imageRef.current, frameX, frameY, frameWidth, frameHeight);
      } catch (err) {
        console.error('❌ Error drawing artwork:', err);
      }
    } else {
      // Loading placeholder
      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading artwork...', canvas.width / 2, canvas.height / 2);
    }

    // Frame border
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 4;
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

    // Dimensions display
    if (dimensions?.width && dimensions?.height) {
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.fillText(
        `${dimensions.width} × ${dimensions.height} ${dimensions.unit || 'cm'}`,
        canvas.width / 2,
        frameY + frameHeight + 25
      );
      ctx.shadowColor = 'transparent';
    }

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;
    ctx.fillText(artworkTitle, canvas.width / 2, frameY - 15);
    ctx.shadowColor = 'transparent';

    // Instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 3;
    ctx.fillText('📱 Move phone to adjust position | Approx. size based on dimensions', canvas.width / 2, canvas.height - 25);
    ctx.shadowColor = 'transparent';

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
    imageLoadedRef.current = false;
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <button
          onClick={stopCamera}
          className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative flex-1 w-full h-full">
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            autoPlay
            muted
          />

          {cameraError ? (
            <div className="flex items-center justify-center h-full bg-black">
              <div className="bg-red-600 text-white p-6 rounded-lg max-w-sm text-center mx-4">
                <p className="font-semibold mb-2 text-lg">❌ Camera Error</p>
                <p className="text-sm mb-4">{cameraError}</p>
                <button
                  onClick={stopCamera}
                  className="w-full bg-white text-red-600 px-4 py-2 rounded font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />
          )}
        </div>

        <div className="bg-black/80 backdrop-blur-md text-white p-4 text-center text-xs">
          <p>🎨 2D Camera Preview - Not true AR (see docs for true 3D AR)</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startCamera}
      disabled={imageLoading}
      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{imageLoading ? 'Loading...' : 'View on Wall (Camera Preview)'}</span>
    </button>
  );
}
