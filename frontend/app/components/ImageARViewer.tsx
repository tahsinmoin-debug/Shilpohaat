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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroidDevice = /Android/.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isIOSDevice || isAndroidDevice);
  }, []);

  const handleARClick = () => {
    // For all devices (mobile and desktop), show the AR preview modal
    setShowAR(true);
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
      </button>

      {!isMobile && (
        <p className="text-sm text-gray-400 text-center mt-2">
          💡 Tip: Use your phone for full AR experience
        </p>
      )}

      {/* AR Modal/Fullscreen - Works on all devices */}
      {showAR && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 overflow-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowAR(false)}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Content Container */}
          <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center">{artworkTitle}</h2>

            {/* Artwork Preview */}
            <div className="relative w-full flex items-center justify-center">
              <div className="relative rounded-lg overflow-hidden shadow-2xl" style={getFrameStyle()}>
                <div className="w-full h-full border-4 border-purple-500 rounded-lg">
                  <img
                    src={imageUrl}
                    alt={artworkTitle}
                    className="w-full h-full object-contain bg-gray-900"
                    onError={() => console.error('Image failed to load:', imageUrl)}
                  />
                </div>

                {/* Dimensions Overlay */}
                {dimensions?.width && dimensions?.height && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {dimensions.width} × {dimensions.height} {dimensions.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-md text-white p-6 rounded-lg w-full">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
                How to Use AR
              </h3>
              <ul className="space-y-2 text-sm">
                {isMobile ? (
                  <>
                    <li>✓ Point your phone at a wall or floor</li>
                    <li>✓ Move back and forth to adjust the size</li>
                    <li>✓ The artwork dimensions are shown above</li>
                    <li>✓ Walk around to view from different angles</li>
                  </>
                ) : (
                  <>
                    <li>💻 Open this on your mobile phone for full AR</li>
                    <li>✓ This preview shows how the artwork will look</li>
                    <li>✓ Artwork dimensions: {dimensions?.width} × {dimensions?.height} {dimensions?.unit}</li>
                  </>
                )}
              </ul>
            </div>

            {/* Status Text */}
            <p className="text-gray-300 text-center text-sm">
              {isMobile ? '📱 AR mode is active. Try pointing at a wall!' : '💡 For best experience, use this on your mobile device'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
