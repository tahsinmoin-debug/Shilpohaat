# AR Feature Fix - December 22, 2025

## Problem Summary
The AR camera preview feature was not working properly - it would request camera permission but after granting permission, nothing would appear on screen.

## Root Causes Identified

### 1. **Video Element Hidden But Not Properly Connected**
   - The video element was set to `className="hidden"` but the canvas wasn't rendering the video feed
   - Video readyState wasn't being checked before attempting to draw

### 2. **Timing Issues**
   - Canvas rendering started too early, before video stream was fully ready
   - No proper waiting for video metadata to be loaded and video to start playing

### 3. **No Loading State**
   - Users saw a blank screen during camera initialization
   - No visual feedback that something was happening

### 4. **Limited Debugging**
   - Insufficient console logging made it hard to diagnose issues
   - Video readyState wasn't being checked

## Fixes Implemented

### 1. **Improved Video Stream Initialization**
```typescript
// Added proper promise chain
videoRef.current?.play()
  .then(() => {
    console.log('✅ Video playing');
    setCameraLoading(false);
    setShowCamera(true);
    // Wait 500ms for video to actually start
    setTimeout(() => {
      console.log('🎨 Starting AR overlay rendering...');
      renderAROverlay();
    }, 500);
  })
```

### 2. **Enhanced Canvas Rendering Checks**
```typescript
// Check video readyState before drawing
if (video.readyState < 2) {
  console.warn('⚠️ Video not ready yet, readyState:', video.readyState);
  animationRef.current = requestAnimationFrame(renderAROverlay);
  return;
}
```

### 3. **Added Loading State**
- New `cameraLoading` state to show initialization progress
- Loading spinner with "Initializing Camera" message
- Better user experience during camera startup

### 4. **Comprehensive Debugging**
- Added console logs at every step:
  - Camera access request
  - Stream acquisition
  - Video metadata loaded
  - Video playing
  - Canvas rendering start
  - Any errors or warnings

### 5. **Better Error Handling**
- More descriptive error messages
- Proper cleanup of camera streams
- Error state properly resets on retry

## How to Test

### Basic Testing
1. **Open an artwork detail page** that has dimensions
2. **Click "View on Wall (Camera Preview)"** button
3. **Grant camera permission** when prompted
4. **You should see:**
   - Loading spinner with "Initializing Camera"
   - Then the camera view with artwork overlay
   - Purple border around the artwork
   - Artwork dimensions displayed
   - Title at the top

### What Should Happen
- ✅ Camera opens smoothly
- ✅ Artwork image appears overlaid on camera feed
- ✅ Artwork respects actual dimensions (scaled appropriately)
- ✅ Can move phone around to see different perspectives
- ✅ Close button works to exit AR view

### Mobile Testing
**Best tested on mobile devices:**
- **Android Chrome** - Full support
- **iOS Safari** - Full support
- **Desktop browsers** - Limited (no back camera, but front camera works for testing)

### Check Console Logs
Open browser DevTools console to see:
```
🎥 Requesting camera access...
✅ Camera stream acquired
✅ Video metadata loaded: {width: 1280, height: 720}
✅ Video playing
🎨 Starting AR overlay rendering...
📐 Canvas sized: 1280 x 720
✅ Artwork image loaded successfully
```

## Technical Details

### Key Changes Made

1. **CameraARViewer.tsx** - Line changes:
   - Added `cameraLoading` state variable
   - Enhanced `startCamera()` with better async handling
   - Improved `renderAROverlay()` with readyState checks
   - Added loading UI in the render section
   - Better cleanup in `stopCamera()`

### Video ReadyState Values
- `0` = HAVE_NOTHING - no data available
- `1` = HAVE_METADATA - metadata loaded
- `2` = HAVE_CURRENT_DATA - data for current position available
- `3` = HAVE_FUTURE_DATA - enough data to play forward
- `4` = HAVE_ENOUGH_DATA - can play through

We now wait for readyState >= 2 before rendering.

## Known Limitations

### This is NOT True AR
- **Current implementation:** 2D image overlay on camera feed
- **Not spatial tracking:** Artwork doesn't "stick" to walls
- **No depth sensing:** Fixed size, not based on distance
- **Orientation:** Doesn't use device orientation

### For True 3D AR
Use artworks with GLB models - they use `ARViewer.tsx` which provides:
- True spatial AR with WebXR
- Device orientation tracking
- 3D model rendering
- "Stick to surface" functionality (iOS Safari and Android Chrome)

## Future Improvements

1. **Add WebXR support** for 2D images (more complex)
2. **Implement plane detection** for better placement
3. **Add pinch-to-zoom** for manual size adjustment
4. **Save AR screenshots** functionality
5. **Share AR preview** with friends

## Troubleshooting

### If Camera Still Doesn't Work:

1. **Check Browser Permissions**
   - Settings → Site Settings → Camera
   - Ensure camera access is allowed

2. **Check HTTPS**
   - Camera API requires HTTPS (or localhost)
   - `http://` won't work on production

3. **Check Console Errors**
   - Open DevTools → Console
   - Look for red error messages
   - Share error messages for debugging

4. **Try Different Browser**
   - Chrome/Safari recommended
   - Firefox may have different behavior

5. **Check Device Camera**
   - Test camera in other apps
   - Some devices have camera restrictions

### Common Error Messages

- **"Camera permission denied"** → User needs to grant permission in browser settings
- **"No camera found"** → Device has no camera or camera is disabled
- **"Video stream error"** → Camera is in use by another app
- **"Unable to load artwork image"** → Network or CORS issue with image

## Files Modified

- `frontend/app/components/CameraARViewer.tsx` - Main AR preview component

## Related Files (Not Modified)
- `frontend/app/components/ARViewer.tsx` - True 3D AR for GLB models
- `frontend/app/artworks/[id]/page.tsx` - Uses CameraARViewer
- `frontend/app/ar-demo/page.tsx` - AR demo page

## Summary

The AR feature is now **fully functional** with:
- ✅ Proper camera initialization
- ✅ Loading states for better UX
- ✅ Comprehensive error handling
- ✅ Extensive debugging logs
- ✅ Smooth user experience

The camera should open reliably and display the artwork overlay correctly!
