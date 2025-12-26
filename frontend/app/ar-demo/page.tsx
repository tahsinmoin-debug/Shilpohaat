'use client';

import { useState } from 'react';
import Header from '../components/Header';
import ARViewer from '../components/ARViewer';
import WebXRViewer from '../components/WebXRViewer';

export default function ARDemoPage() {
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Sample 3D models from glTF repository for testing
  const sampleModels = [
    {
      name: 'Damaged Helmet',
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
      poster: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/screenshot/screenshot.png',
    },
    {
      name: 'Avocado',
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
      poster: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/screenshot/screenshot.png',
    },
    {
      name: 'Duck',
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
      poster: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/screenshot/screenshot.png',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading text-white mb-4">
              🎨 AR Feature Demo
            </h1>
            <p className="text-gray-300 text-lg mb-2">
              Test the AR art preview feature with sample 3D models
            </p>
            <p className="text-sm text-gray-400">
              📱 Best viewed on mobile (Android Chrome or iOS Safari)
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Use
            </h2>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Select a sample 3D model below</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Click the purple "View on Wall (AR)" button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Rotate and zoom the 3D model (desktop)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span>On mobile: Click "View in Your Space" to launch AR</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">5.</span>
                <span>Point your phone at a wall or flat surface</span>
              </li>
            </ol>
          </div>

          {/* Model Selection */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Select a Sample Model
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleModels.map((model) => (
                <button
                  key={model.name}
                  onClick={() => setSelectedModel(model.url)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedModel === model.url
                      ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/50'
                      : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                  }`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-900">
                    <img
                      src={model.poster}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white font-semibold">{model.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AR Viewer */}
          {selectedModel ? (
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">AR Preview Ready</h2>
                  <p className="text-gray-400">Click the button below to launch AR viewer</p>
                </div>
              </div>
              
              <WebXRViewer
                modelUrl={selectedModel}
                artworkTitle={sampleModels.find(m => m.url === selectedModel)?.name || 'Sample Model'}
                dimensions={{ width: 80, height: 60, depth: 5, unit: 'cm' }}
                fallback={
                  <ARViewer
                    modelUrl={selectedModel}
                    artworkTitle={sampleModels.find(m => m.url === selectedModel)?.name || 'Sample Model'}
                    dimensions={{ width: 80, height: 60, depth: 5, unit: 'cm' }}
                    poster={sampleModels.find(m => m.url === selectedModel)?.poster}
                  />
                }
              />

              <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    <strong>Note:</strong> These are sample models for testing. Real artworks will show their actual paintings in AR when artists upload custom GLB files.
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 shadow-xl border border-gray-700 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-gray-400 text-lg">
                Select a sample model above to test the AR feature
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              🚀 To Use with Real Artworks
            </h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-1 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>
                  <strong className="text-white">Step 1:</strong> Artists go to "Upload New Artwork" page
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-1 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>
                  <strong className="text-white">Step 2:</strong> Scroll to purple "AR 3D Model" section
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-1 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>
                  <strong className="text-white">Step 3:</strong> Upload .glb file (create using Blender or online tools)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-full p-1 mt-0.5">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>
                  <strong className="text-white">Step 4:</strong> AR button will automatically appear on that artwork's detail page
                </p>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-3">Need help creating 3D models?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.blender.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Download Blender
              </a>
              <a
                href="https://gltf-viewer.donmccurdy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Test GLB Files
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
