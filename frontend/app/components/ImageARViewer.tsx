'use client';

import { useEffect, useState } from 'react';

interface ImageARViewerProps {
  imageUrl: string;
  artworkTitle: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: string;
  };
}

export default function ImageARViewer({ imageUrl, artworkTitle, dimensions }: ImageARViewerProps) {
  const [showAR, setShowAR] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsAndroid(/Android/.test(userAgent));
  }, []);

  const handleARClick = () => {
    if (isIOS) {
      // iOS uses AR Quick Look with USDZ or Reality files
      // For now, open camera and show instruction
      setShowAR(true);
    } else if (isAndroid) {
      // Android uses Scene Viewer
      const arUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(imageUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
      window.location.href = arUrl;
    } else {
      // Desktop: show modal with image
      setShowAR(true);
    }
  };

  const getFrameStyle = () => {
    if (!dimensions?.width || !dimensions?.height) {
      return { width: '80vw', maxWidth: '600px', aspectRatio: '4/3' };
    }
    const ratio = dimensions.width / dimensions.height;
    return { width: '80vw', maxWidth: '600px', aspectRatio: `${ratio}` };
  };

  return (
    <>
      {/* AR Button */}
      <button
        onClick={handleARClick}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>View on Wall (AR Camera)</span>
        {!isIOS && !isAndroid && (
          <span className="text-xs bg-white/20 px-2 py-1 rounded">Mobile Only</span>
        )}
      </button>

      {!isIOS && !isAndroid && (
        <p className="text-sm text-gray-400 text-center mt-2">
          📱 AR preview works best on mobile devices
        </p>
      )}

      {/* AR Modal/Fullscreen */}
      {showAR && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setShowAR(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Instructions */}
          <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AR Instructions
            </h3>
            <div className="space-y-2 text-sm">
              <p>1. Point your phone at a wall</p>
              <p>2. Move closer or farther to adjust size</p>
              <p>3. Tap screen to place artwork</p>
              <p>4. Walk around to see from different angles</p>
            </div>
          </div>

          {/* Artwork Preview */}
          <div className="relative" style={getFrameStyle()}>
            <div className="absolute inset-0 border-4 border-purple-500 rounded-lg shadow-2xl">
              <img
                src={imageUrl}
                alt={artworkTitle}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Frame dimensions overlay */}
            {dimensions?.width && dimensions?.height && (
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {dimensions.width} × {dimensions.height} {dimensions.unit}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-md p-4 rounded-lg">
            <p className="text-white font-semibold mb-1">{artworkTitle}</p>
            <p className="text-gray-300 text-sm">
              {isIOS || isAndroid ? '📱 AR mode active - point at a wall' : '💻 Use your phone for full AR experience'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
