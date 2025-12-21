# AI Artwork Recommendation Feature Setup Guide

## Overview
ShilpoHaat now features an AI-powered artwork recommendation system that helps users discover artworks matching their preferences. The system uses OpenAI's API to intelligently rank artworks based on user preferences.

## Features
- 🤖 **AI Chatbot**: Floating chatbot button for easy access
- 💬 **Natural Language Queries**: Ask for recommendations in plain English
- 🎨 **Smart Filtering**: Filter by category, budget, and materials
- 📊 **Intelligent Ranking**: OpenAI ranks artworks by relevance
- 🔄 **Fallback System**: Graceful degradation if AI is unavailable
- 📱 **Responsive UI**: Works on all devices

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install openai
```

### 2. Environment Variables
Add to your `.env` file:
```
OPENAI_API_KEY=your_actual_api_key_here
```

**IMPORTANT**: Replace with your actual OpenAI API key from https://platform.openai.com/account/api-keys

### 3. API Endpoints

#### POST /api/recommendations
Get AI-ranked recommendations based on preferences.

**Request Body:**
```json
{
  "category": "Modern Art",
  "budget_min": 1000,
  "budget_max": 50000,
  "materials": "Oil Painting",
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "_id": "artwork_id",
      "title": "Artwork Title",
      "price": 15000,
      "category": "Modern Art",
      "images": ["url"],
      "artist": { "name": "Artist Name" },
      "aiReason": "Perfectly matches your modern style preference"
    }
  ],
  "aiExplanation": "Based on your preferences for Modern Art within your budget...",
  "fallback": false
}
```

#### POST /api/recommendations/quick
Get quick recommendations from natural language query.

**Request Body:**
```json
{
  "query": "I want modern art under 5000 taka"
}
```

### 4. Fallback System
- If OpenAI is unavailable, the system returns filtered results sorted by price
- No data loss; users always get recommendations

---

## Frontend Setup

### 1. Component Integration
The AI Chatbot is automatically added to your layout. It appears as a floating button (🎨) in the bottom-right corner.

### 2. How It Works

#### Floating Button
- Click the 🎨 button to open/close the chat
- All pages have access to the chatbot

#### Chat Interface
1. **Natural Language Mode**: Type "I want modern art under 5000 taka"
2. **Advanced Search**: Click "+ Advanced Search" for detailed filters
3. **Recommendations**: Click on any artwork card to view details

#### Example Queries
- "Show me abstract art"
- "I want traditional paintings under 3000 taka"
- "Modern watercolor pieces"
- "Oil paintings by famous artists"

### 3. Customization

#### Change Button Style
Edit `AIChatbot.tsx`, line ~88:
```tsx
className={`... bg-brand-gold ...`}
```

#### Customize Categories
Edit `AIChatbot.tsx`, line ~250:
```tsx
<option value="Your Category">Your Category</option>
```

---

## How It Works Behind the Scenes

### Flow Diagram
```
User Query
    ↓
Frontend sends to /api/recommendations or /api/recommendations/quick
    ↓
Backend filters artworks from MongoDB (approved only)
    ↓
OpenAI API receives filtered list + user preferences
    ↓
OpenAI returns ranked top 5 + explanations (JSON)
    ↓
Backend maps IDs back to full artwork objects
    ↓
Frontend displays with AI explanations
    ↓
User clicks to view details or add to cart
```

### Model Used
- **gpt-4o-mini**: Fast, cost-effective, perfect for ranking tasks
- **Alternative**: gpt-5-mini (when available)

### Temperature & Tokens
- Temperature: 0.7 (balanced creativity vs consistency)
- Max Tokens: 1000 (structured JSON response)

---

## Error Handling

### OpenAI API Failures
- Automatically falls back to rule-based filtering
- Returns message: "Showing curated results (AI unavailable)"
- No breaking errors; graceful degradation

### MongoDB Query Errors
- Returns filtered results sorted by price
- Displays user-friendly error message

### Network Issues
- Retry logic can be added as needed
- Currently shows: "Failed to get recommendations"

---

## Security Best Practices

✅ **DO:**
- Store API key in `.env` file
- Use `process.env.OPENAI_API_KEY` in code
- Regenerate key if exposed
- Use gpt-4o-mini for cost efficiency

❌ **DON'T:**
- Commit API keys to GitHub
- Expose keys in frontend code
- Use production key for testing
- Leave API key in comments

---

## Testing

### Manual Testing
1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Click 🎨 button
4. Type: "Show me abstract art under 5000"
5. View recommendations

### Test Cases
```
✓ Natural language query
✓ Advanced search with filters
✓ Click on artwork → detail page
✓ No internet → fallback results
✓ Invalid category → general results
✓ Budget out of range → empty results with fallback
```

---

## Performance Optimization

### Caching (Optional)
```javascript
// Add to controller
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Check cache before calling OpenAI
if (cache.has(cacheKey) && Date.now() - cache.get(cacheKey).time < CACHE_TTL) {
  return cache.get(cacheKey).data;
}
```

### Rate Limiting (Optional)
```javascript
const rateLimit = require('express-rate-limit');
const recommendationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
});

router.post('/', recommendationLimiter, getRecommendations);
```

---

## Cost Estimation

### OpenAI Pricing (gpt-4o-mini)
- Input: ~$0.0001 per 1K tokens
- Output: ~$0.0004 per 1K tokens
- Average query: ~500 input tokens, ~200 output tokens
- **Cost per recommendation: ~$0.00015**
- **1000 recommendations/month: ~$0.15**

---

## Future Enhancements

1. **User Preferences Learning**: Remember past queries
2. **Favorites Integration**: "Show me like my favorites"
3. **Social Proof**: "Artists similar to those you follow"
4. **Visual Search**: Upload image → find similar
5. **Price Alerts**: "Notify me when price drops"
6. **Collaboration**: "Artists who work with X material"

---

## Troubleshooting

### "API key not found"
- Check `.env` file exists
- Verify `OPENAI_API_KEY` is set
- Restart backend server

### "No recommendations returned"
- Check MongoDB filters work independently
- Verify OpenAI is responding (check logs)
- Try with broader budget range

### "Chatbot not appearing"
- Check AIChatbot component imported in layout.tsx
- Verify Tailwind CSS is loaded
- Check browser console for errors

### "Slow responses"
- OpenAI API might be slow (check status page)
- Consider adding caching
- Try reducing `limit` parameter

---

## Support

For issues, check:
1. Backend logs: `npm run dev` output
2. Browser console: Open DevTools (F12)
3. Network tab: Check API calls
4. OpenAI dashboard: Check API usage/errors

---

## Code Files Modified

- ✅ `backend/controllers/recommendationController.js` - New
- ✅ `backend/routes/recommendations.js` - New
- ✅ `backend/index.js` - Added route import
- ✅ `frontend/app/components/AIChatbot.tsx` - New
- ✅ `frontend/app/layout.tsx` - Added AIChatbot component

---

**Happy recommending! 🎨✨**
