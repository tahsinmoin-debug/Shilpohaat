# 🚀 AR Feature Quick Reference

## For Artists
**Upload GLB in 3 steps:**
1. Go to `/artist/artworks/new`
2. Scroll to purple "AR 3D Model" section
3. Click "Choose 3D Model File" → select `.glb` file

**Requirements:**
- Max 50MB
- .glb or .gltf format
- Artwork dimensions required for accurate scaling

---

## For Developers

### Components
```tsx
// AR Viewer
<ARViewer
  modelUrl={artwork.arModelUrl}
  artworkTitle={artwork.title}
  dimensions={artwork.dimensions}
  poster={artwork.images?.[0]}
/>

// AR Badge
<ARBadge hasARModel={!!artwork.arModelUrl} compact />
```

### API Endpoints
```bash
# Upload GLB model
POST /api/upload/model
Body: { modelData: "data:...", folder: "shilpohaat/models" }
Response: { url: "https://res.cloudinary.com/..." }

# Get artwork with AR
GET /api/artworks/:id
Response: { artwork: { arModelUrl: "...", ... } }
```

### Database
```javascript
// Artwork schema field
arModelUrl: {
  type: String,
  default: null,
}
```

---

## Testing Commands

```bash
# Test AR feature
cd backend
node scripts/testArFeature.js

# Build frontend
cd frontend
npm run build

# Run locally
npm run dev
```

---

## Environment Variables

```env
# Backend (.env)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---

## Browser Support

| Device | Browser | AR | 3D Preview |
|--------|---------|----|-----------
| Android | Chrome 79+ | ✅ | ✅ |
| iOS | Safari 12+ | ✅ | ✅ |
| Desktop | Any | ❌ | ✅ |

---

## File Sizes

| Type | Recommended | Maximum |
|------|-------------|---------|
| GLB Model | < 10 MB | 50 MB |
| Texture | 2048x2048 | 4096x4096 |

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| No AR button | Upload GLB file for artwork |
| Model not loading | Test GLB at gltf-viewer.donmccurdy.com |
| Wrong size | Add dimensions (width, height, unit) |
| Upload fails | Check file < 50MB, format is .glb |

---

## Resources

- **Docs**: `AR_FEATURE_README.md`
- **GLB Guide**: `GLB_CONVERSION_GUIDE.md`
- **Deploy**: `AR_DEPLOYMENT_CHECKLIST.md`
- **Test**: `backend/scripts/testArFeature.js`

---

*Questions? Check the full docs!*
