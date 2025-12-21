# Admin Panel - Viva Documentation
## Shilpohaat E-Commerce Platform

---

## TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Access Control & Restrictions](#access-control--restrictions)
3. [Authentication Flow](#authentication-flow)
4. [Frontend Authorization](#frontend-authorization)
5. [Backend Authorization](#backend-authorization)
6. [Core Functionalities](#core-functionalities)
7. [Data Management Operations](#data-management-operations)
8. [Predicted Viva Questions & Answers](#predicted-viva-questions--answers)
9. [Database Models](#database-models)
10. [Error Handling](#error-handling)

---

## SYSTEM OVERVIEW

### What is the Admin Panel?
The Admin Panel is a dedicated dashboard for managing the Shilpohaat platform. It allows only authorized administrators to:
- Monitor and moderate artworks
- Manage user accounts
- Control featured artists
- Handle user reports
- View sales analytics
- Manage blog posts
- Moderate reviews

### Key Technologies
- **Frontend**: Next.js (React with TypeScript)
- **Backend**: Express.js + MongoDB
- **Authentication**: Firebase
- **Authorization**: Email-based & Role-based Access Control

---

## ACCESS CONTROL & RESTRICTIONS

### How Admin-Only Access is Enforced?

#### 1. **Frontend Level** (First Line of Defense)
**File**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx)

**Authentication Check** (Lines 31-45):
```javascript
useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');  // Non-logged in users redirected to login
        return;
      }
      const isAdmin = !!appUser && 
        (appUser.role === 'admin' || 
         (ADMIN_EMAIL && appUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()));
      if (!isAdmin) {
        router.push('/');  // Non-admin users redirected to home page
        return;
      }
      void loadAll();
    }
}, [user, appUser, loading]);
```

**What happens here?**
- If no Firebase user → redirect to `/login`
- If user is logged in BUT not admin → redirect to `/` (home page)
- Only if user is admin → load admin data

**Admin Check Logic**:
```
isAdmin = (appUser.role === 'admin') OR (appUser.email === ADMIN_EMAIL)
```

This means an admin can be recognized in TWO ways:
1. User has `role: 'admin'` in database
2. User's email matches `ADMIN_EMAIL` environment variable

#### 2. **Backend Level** (Server-Side Protection)
**File**: [backend/middleware/auth.js](backend/middleware/auth.js)

This is the CRITICAL security layer that protects all API endpoints.

**Authentication Middleware** (Lines 4-26):
```javascript
const requireAuth = async (req, res, next) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(401).json({ message: 'firebaseUID is required' });
    }
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account is suspended' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
```

**Authorization Middleware** (Lines 28-47):
```javascript
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminByRole = req.user.role === 'admin';
    const isAdminByEmail = adminEmail && req.user.email && 
                           req.user.email.toLowerCase() === adminEmail.toLowerCase();
    if (!isAdminByRole && !isAdminByEmail) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
```

**What happens here?**
- Every request MUST include `firebaseUID`
- User is verified from database
- Check if user is suspended
- Check if user is admin (by role OR email)
- If NOT admin → return HTTP 403 Forbidden

#### 3. **Route Protection** (Applied to All Admin Routes)
**File**: [backend/routes/admin.js](backend/routes/admin.js)

```javascript
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

// ALL ROUTES BELOW THIS LINE REQUIRE BOTH AUTHENTICATION AND ADMIN PRIVILEGES
router.use(requireAuth, requireAdmin);

router.get('/overview', ctrl.getOverview);
router.get('/artworks/pending', ctrl.getPendingArtworks);
router.patch('/artworks/:id/approve', ctrl.approveArtwork);
router.patch('/artworks/:id/reject', ctrl.rejectArtwork);
router.patch('/artworks/:id/feature', ctrl.featureArtwork);
router.delete('/artworks/:id', ctrl.removeArtwork);  // Delete endpoint for cross button
// ... more routes
```

**Key Point**: The `router.use(requireAuth, requireAdmin)` statement applies BOTH middleware to ALL routes in this file. This means:
- Every admin API call needs authentication
- Every admin API call needs admin role/email verification

---

## AUTHENTICATION FLOW

### Step-by-Step Authentication Process

#### Step 1: User Logs In (Firebase)
**File**: [frontend/app/components/AuthProvider.tsx](frontend/app/components/AuthProvider.tsx)

```javascript
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser);  // Firebase user object
    if (firebaseUser) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?firebaseUID=${firebaseUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          setAppUser(data.user);  // Our database user object
        }
      } catch {
        setAppUser(null);
      }
    }
    setLoading(false);
  });
```

**What happens?**
- Firebase verifies login credentials
- Frontend fetches user data from our backend
- User data includes `role` (buyer, artist, or admin)

#### Step 2: Check Admin Status
**File**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) (Lines 36-39)

```javascript
const isAdmin = !!appUser && 
  (appUser.role === 'admin' || 
   (ADMIN_EMAIL && appUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()));
```

**What happens?**
- Frontend checks if user's role is 'admin' OR
- Frontend checks if user's email matches ADMIN_EMAIL from environment

#### Step 3: Make API Calls with Authentication
**File**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) (Lines 166-173)

```javascript
const authHeaders = () => ({ 'x-firebase-uid': user?.uid || '' });

const loadAll = async () => {
  const headers = authHeaders();
  const [aw, u, ar, bl, as] = await Promise.all([
    fetch(`${API_BASE_URL}/api/artworks?includeAll=true`, { headers }),
    fetch(`${API_BASE_URL}/api/admin/users`, { headers }),
    // ...
  ]);
```

**What happens?**
- Every request includes Firebase UID in header
- Backend verifies this UID and checks admin status
- Only if verified → data is returned

---

## FRONTEND AUTHORIZATION

### Environment Configuration
**File**: [frontend/lib/config.ts](frontend/lib/config.ts)

```typescript
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
```

**Purpose**: Defines which email is the admin. Must be set in `.env.local`

### Admin Page Protection
**File**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx)

**Line 36-44: Redirect Logic**
```javascript
if (!user) {
  router.push('/login');  // Not logged in? Go to login
  return;
}

const isAdmin = !!appUser && (...check admin...);
if (!isAdmin) {
  router.push('/');  // Not admin? Go to home
  return;
}
```

**Security Note**: This is a UI-level check only. The backend MUST also verify admin status because frontend code can be modified by users.

---

## BACKEND AUTHORIZATION

### Database User Model
**File**: [backend/models/User.js](backend/models/User.js)

```javascript
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String },
  role: {
    type: String,
    enum: ['buyer', 'artist', 'admin'],
    default: 'buyer'
  },
  isSuspended: { type: Boolean, default: false }
});
```

**Important Fields**:
- `role`: Can be 'buyer', 'artist', or 'admin'
- `isSuspended`: Suspended users cannot access any protected routes
- `firebaseUID`: Links to Firebase authentication

### Middleware Authentication
**File**: [backend/middleware/auth.js](backend/middleware/auth.js)

Two middleware functions work together:

**1. requireAuth** - Verifies user exists and is not suspended
**2. requireAdmin** - Verifies user has admin privileges

```javascript
router.use(requireAuth, requireAdmin);
```

This applies to ALL admin routes, making them impossible to access without proper authorization.

---

## CORE FUNCTIONALITIES

### 1. Artwork Moderation

#### **Delete/Remove Artwork** (The "×" Button)
**Frontend**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) (Lines 226-229)

```jsx
<button 
  aria-label="Remove artwork" 
  title="Remove artwork" 
  className="px-3 py-1 bg-red-700 text-white rounded" 
  onClick={() => act(`${API_BASE_URL}/api/admin/artworks/${art._id}`, { method: 'DELETE' })}>
  ×
</button>
```

**What happens when you click ×?**
1. Frontend calls `DELETE /api/admin/artworks/{artworkId}`
2. Request includes Firebase UID in header
3. Backend middleware checks authentication & admin status
4. If approved → backend executes `removeArtwork` controller

**Backend Controller**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 76-93)

```javascript
const removeArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Artwork.findById(id);
    if (!art) return res.status(404).json({ message: 'Artwork not found' });

    // Delete images from Cloudinary storage
    if (Array.isArray(art.images)) {
      const publicIds = art.images.map((url) => extractPublicId(url)).filter(Boolean);
      await Promise.all(publicIds.map((pid) => deleteFromCloudinary(pid)));
    }

    // Delete from database
    await Artwork.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Remove artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

**What does it do?**
1. Finds artwork by ID
2. Extracts image URLs from artwork
3. Deletes images from Cloudinary (external storage)
4. Deletes artwork record from database
5. Returns success response

**After deletion**: Frontend calls `loadAll()` to refresh the table

#### **Approve Artwork**
**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 37-44)

```javascript
const approveArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Artwork.findByIdAndUpdate(
      id, 
      { moderationStatus: 'approved' }, 
      { new: true }
    );
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ artwork: art });
  } catch (err) {
    console.error('Approve artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

**What it does**:
- Sets `moderationStatus` to 'approved'
- Artwork becomes visible to buyers

#### **Reject Artwork**
**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 46-53)

```javascript
const rejectArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Artwork.findByIdAndUpdate(
      id, 
      { moderationStatus: 'rejected' }, 
      { new: true }
    );
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ artwork: art });
  } catch (err) {
    console.error('Reject artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

---

### 2. User Management

#### **Suspend User**
**Frontend**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) (Lines 276-277)

```jsx
<button 
  className={`px-3 py-1 rounded ${u.isSuspended ? 'bg-green-600' : 'bg-red-700'} text-white text-xs`} 
  onClick={() => act(`${API_BASE_URL}/api/admin/users/${u._id}/suspend`, { 
    method: 'PATCH', 
    body: JSON.stringify({ suspended: !u.isSuspended }) 
  })}>
  {u.isSuspended ? 'Unsuspend' : 'Suspend'}
</button>
```

**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 107-116)

```javascript
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;
    const user = await User.findByIdAndUpdate(
      id, 
      { isSuspended: !!suspended }, 
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Suspend user error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

**What happens when a user is suspended?**
- User cannot access ANY protected API endpoints
- Authentication middleware blocks suspended users:
  ```javascript
  if (user.isSuspended) {
    return res.status(403).json({ message: 'Account is suspended' });
  }
  ```

---

### 3. Artist Management

#### **Feature Artist**
**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 130-139)

```javascript
const featureArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const artist = await ArtistProfile.findByIdAndUpdate(
      id, 
      { isFeatured: !!isFeatured }, 
      { new: true }
    );
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json({ artist });
  } catch (err) {
    console.error('Feature artist error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

**Purpose**: Featured artists appear in promoted sections on the platform

---

### 4. Review Moderation

#### **Delete Review** (With Cross Button)
**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 168-177)

```javascript
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

#### **Hide Review** (Mark as removed without deleting)
**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 157-166)

```javascript
const hideReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRemoved } = req.body;
    const review = await Review.findByIdAndUpdate(
      id, 
      { isRemoved: !!isRemoved }, 
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) {
    console.error('Hide review error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

---

### 5. Blog Management

#### **Delete Blog Post** (With Cross Button)
**Frontend**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) (Lines 308-310)

```jsx
<button 
  aria-label="Remove blog" 
  title="Remove blog" 
  className="px-3 py-1 bg-red-700 text-white rounded" 
  onClick={() => act(`${API_BASE_URL}/api/admin/blog/${b._id}`, { method: 'DELETE' })}>
  ×
</button>
```

**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 291-302)

```javascript
removeBlogPost: async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Remove blog post error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
```

---

### 6. Analytics Dashboard

#### **Sales Per Artist**
**Frontend**: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) (Lines 175-195)

Shows revenue, units sold, and order count for each artist.

**Backend**: [backend/controllers/adminController.js](backend/controllers/adminController.js) (Lines 245-290)

```javascript
getArtistSales: async (req, res) => {
  try {
    const days = parseInt(req.query.days || '0', 10);
    let matchStage = { paymentStatus: 'paid' };
    
    // Filter by date range if specified
    if (days && days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      matchStage.createdAt = { $gte: since };
    }

    // MongoDB aggregation pipeline
    const result = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'artworks',
          localField: 'items.artworkId',
          foreignField: '_id',
          as: 'artworkDoc',
        },
      },
      { $unwind: '$artworkDoc' },
      {
        $group: {
          _id: '$artworkDoc.artist',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          sales: { $sum: '$items.quantity' },
          orderIds: { $addToSet: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'artistUser',
        },
      },
      { $unwind: '$artistUser' },
      {
        $project: {
          artistId: '$_id',
          name: '$artistUser.name',
          email: '$artistUser.email',
          revenue: 1,
          sales: 1,
          orders: { $size: '$orderIds' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json({ artists: result });
  } catch (err) {
    console.error('Admin getArtistSales error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}
```

**What it does?**
1. Finds all paid orders
2. Extracts artwork information for each order item
3. Groups by artist
4. Calculates total revenue, units sold, and order count
5. Sorts by revenue (highest first)

---

## DATA MANAGEMENT OPERATIONS

### DELETE Operations (The Cross Button ×)

#### Flow for Delete Artwork:
```
User clicks × button
    ↓
Frontend sends DELETE request with Firebase UID
    ↓
Backend middleware: requireAuth checks user exists
    ↓
Backend middleware: requireAdmin checks user is admin
    ↓
If NOT admin → Return HTTP 403 Forbidden
    ↓
If admin → removeArtwork controller executes
    ↓
Extract image public IDs from Cloudinary URLs
    ↓
Delete images from Cloudinary cloud storage
    ↓
Delete artwork record from MongoDB database
    ↓
Return success response
    ↓
Frontend refreshes data with loadAll()
```

### PATCH Operations (Update Status)

#### Flow for Suspend User:
```
User clicks "Suspend" button
    ↓
Frontend sends PATCH request with { suspended: true }
    ↓
Backend authentication checks
    ↓
suspendUser controller sets isSuspended = true
    ↓
User cannot access any protected routes anymore
    ↓
Frontend refreshes and shows "Unsuspend" button instead
```

---

## PREDICTED VIVA QUESTIONS & ANSWERS

### **Question 1: How do you ensure only admin can access the admin page?**

**Answer**:
We use a **three-layer security approach**:

**Layer 1 - Frontend (UI Protection)**:
- In `admin/page.tsx`, we check if the user is logged in
- We verify the user's role is 'admin' OR email matches ADMIN_EMAIL
- Non-admin users are redirected to home page
- Code: Lines 36-44 in `frontend/app/admin/page.tsx`

**Layer 2 - API Request Protection**:
- Every request includes Firebase UID in header: `x-firebase-uid`
- Code: `authHeaders()` function at Line 166 in `frontend/app/admin/page.tsx`

**Layer 3 - Backend Authorization (Most Important)**:
- All admin routes use `router.use(requireAuth, requireAdmin)` middleware
- File: `backend/routes/admin.js`
- This applies to EVERY admin API endpoint
- If user is not authenticated or not admin → returns HTTP 403 Forbidden
- Code: `backend/middleware/auth.js` (Lines 28-47)

**Security Point**: Frontend checks are just convenience. Backend checks are what actually protect the data. A non-admin user cannot access admin data even if they bypass frontend code.

---

### **Question 2: What happens when I click the cross (×) button to delete an artwork?**

**Answer**:
The delete operation follows this process:

**Frontend Side**:
```javascript
onClick={() => act(`${API_BASE_URL}/api/admin/artworks/${art._id}`, { method: 'DELETE' })}
```
Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Lines 226-229

**Backend Flow**:
1. **Authentication Check** (Lines 4-26 in `auth.js`):
   - Extracts firebaseUID from header
   - Finds user in database
   - Checks if user is suspended
   - Sets `req.user` object

2. **Authorization Check** (Lines 28-47 in `auth.js`):
   - Verifies user is admin (by role or email)
   - If not → returns 403 Forbidden

3. **Deletion Process** (`removeArtwork` controller, Lines 76-93):
   - Finds artwork by ID
   - Extracts Cloudinary image URLs
   - Deletes images from Cloudinary storage
   - Deletes artwork record from MongoDB
   - Returns success response

**Frontend Response**:
- Calls `loadAll()` function to refresh the table
- User sees artwork removed from list

**Code Location for Delete**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 76-93

---

### **Question 3: How are admin credentials stored and verified?**

**Answer**:
Admin credentials are stored in the User model with a special `role` field and email verification.

**User Model**:
```javascript
// backend/models/User.js
role: {
  type: String,
  enum: ['buyer', 'artist', 'admin'],
  default: 'buyer'
}
```

**Admin Verification (Two Methods)**:

**Method 1 - Role Check**:
```javascript
const isAdminByRole = req.user.role === 'admin';
```

**Method 2 - Email Check**:
```javascript
const adminEmail = process.env.ADMIN_EMAIL;
const isAdminByEmail = adminEmail && 
                       req.user.email?.toLowerCase() === adminEmail.toLowerCase();
```

Location: [backend/middleware/auth.js](backend/middleware/auth.js) Lines 32-39

**How to Make Someone Admin?**:
1. Set their role to 'admin' in database, OR
2. Add their email to ADMIN_EMAIL environment variable

**Why Two Methods?**:
- Flexibility: Can add admin by database entry OR by email config
- The email method allows quick admin access without database changes

---

### **Question 4: What happens if a non-admin user tries to access the admin API endpoints directly?**

**Answer**:
The backend will reject the request with HTTP 403 Forbidden.

**Step-by-step Blocking**:

1. **Request arrives with Firebase UID**:
   ```javascript
   const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
   ```

2. **Check if user exists**:
   ```javascript
   const user = await User.findOne({ firebaseUID });
   if (!user) return res.status(401).json({ message: 'User not found' });
   ```

3. **Check if user is suspended**:
   ```javascript
   if (user.isSuspended) {
     return res.status(403).json({ message: 'Account is suspended' });
   }
   ```

4. **Check if user is admin**:
   ```javascript
   const isAdminByRole = req.user.role === 'admin';
   const isAdminByEmail = adminEmail && req.user.email?.toLowerCase() === adminEmail.toLowerCase();
   if (!isAdminByRole && !isAdminByEmail) {
     return res.status(403).json({ message: 'Admin access required' });
   }
   ```

**Result**: Regular users cannot access ANY admin endpoints.

Location: [backend/middleware/auth.js](backend/middleware/auth.js)

---

### **Question 5: How does the system handle user suspension?**

**Answer**:
User suspension is a two-level system:

**Part 1 - Setting Suspension Status**:
Location: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 107-116

```javascript
const suspendUser = async (req, res) => {
  const { id } = req.params;
  const { suspended } = req.body;
  const user = await User.findByIdAndUpdate(
    id, 
    { isSuspended: !!suspended }, 
    { new: true }
  );
};
```

**Part 2 - Enforcing Suspension**:
Location: [backend/middleware/auth.js](backend/middleware/auth.js) Lines 18-20

```javascript
if (user.isSuspended) {
  return res.status(403).json({ message: 'Account is suspended' });
}
```

**What happens when someone is suspended?**
- They cannot login (Frontend shows suspended message)
- They cannot make ANY API calls
- Even if they have valid Firebase token, backend blocks them
- They can be unsuspended by clicking the toggle button again

**Frontend UI**:
Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Lines 276-277
- Shows "Suspend" button if user is active
- Shows "Unsuspend" button if user is suspended

---

### **Question 6: What are all the data deletion operations in the admin panel?**

**Answer**:
The admin panel supports deletion for 3 types of content:

**1. Artwork Deletion**:
- **Function**: `removeArtwork`
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 76-93
- **Frontend Button**: × button in Artworks table
- **What it deletes**:
  - Images from Cloudinary
  - Artwork record from MongoDB
- **Route**: `DELETE /api/admin/artworks/:id`

**2. Review Deletion**:
- **Function**: `deleteReview`
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 168-177
- **What it deletes**: Review record from MongoDB
- **Route**: `DELETE /api/admin/reviews/:id`
- **Alternative**: `hideReview` marks review as `isRemoved: true` without deleting

**3. Blog Post Deletion**:
- **Function**: `removeBlogPost`
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 291-302
- **Frontend Button**: × button in Blogs table
- **What it deletes**: Blog post record from MongoDB
- **Route**: `DELETE /api/admin/blog/:id`

**All deletion endpoints require admin authorization** through middleware.

---

### **Question 7: How is the authentication token managed?**

**Answer**:
The system uses **Firebase Authentication** for token management.

**Token Flow**:

1. **User Logs In**:
   - Firebase handles login with email/password
   - Firebase returns `firebaseUID` (user ID)
   - Token stored in browser by Firebase SDK

2. **Token Usage**:
   ```javascript
   const authHeaders = () => ({ 'x-firebase-uid': user?.uid || '' });
   ```
   Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Line 166

3. **Backend Verification**:
   ```javascript
   const firebaseUID = req.headers['x-firebase-uid'];
   const user = await User.findOne({ firebaseUID });
   ```
   Location: [backend/middleware/auth.js](backend/middleware/auth.js) Lines 7-9

4. **User Session**:
   - Firebase handles logout
   - AuthProvider listens for auth state changes
   - If logged out → redirected to login page

**Token Security**:
- NOT sent in URL (avoids logs exposure)
- Sent in header as `x-firebase-uid`
- Verified against database on every request
- Backend looks up user from UID

**Note**: This is a simplified auth system. For production, consider:
- JWT tokens with expiration
- Refresh token rotation
- HTTPS only

---

### **Question 8: What moderation capabilities does the admin have?**

**Answer**:
The admin panel provides comprehensive moderation for 4 areas:

**1. Artwork Moderation**:
- **Approve**: Set `moderationStatus: 'approved'` - makes artwork visible
- **Reject**: Set `moderationStatus: 'rejected'` - hides artwork
- **Feature**: Toggle `featured` flag - shows in promoted sections
- **Delete**: Removes artwork and images permanently
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 37-93

**2. User Management**:
- **View All Users**: See name, email, role, suspension status
- **Suspend/Unsuspend**: Toggle `isSuspended` flag
- **Effect**: Suspended users cannot access ANY protected routes
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 107-116

**3. Artist Management**:
- **View All Artists**: See artist profiles with associated users
- **Feature Artist**: Toggle `isFeatured` flag - shows in artist sections
- **Suspend Artist**: Toggle `isSuspended` flag - artist cannot sell
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 130-150

**4. Review & Report Moderation**:
- **View Reviews**: See all user reviews on artworks
- **Hide Review**: Mark as `isRemoved: true` - hidden from public
- **Delete Review**: Completely remove review
- **View Reports**: See user reports about content/users
- **Update Report Status**: Change status (open/resolved)
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 152-228

**5. Blog Management**:
- **View Blogs**: See all published blog posts
- **Delete Blog**: Remove blog post completely
- **Location**: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 291-302

---

### **Question 9: How does data flow from the admin interface to the database?**

**Answer**:
Data flows through a 5-step process:

**Step 1: User Action**
```javascript
// User clicks button in admin panel
onClick={() => act(`${API_BASE_URL}/api/admin/artworks/${art._id}`, { 
  method: 'DELETE' 
})}
```
Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Lines 226-229

**Step 2: Frontend Sends Request**
```javascript
const res = await fetch(url, { 
  ...opts, 
  headers: { 
    'Content-Type': 'application/json', 
    ...authHeaders()  // Includes Firebase UID
  } 
});
```

**Step 3: Backend Route Handling**
```javascript
router.delete('/artworks/:id', ctrl.removeArtwork);
```
Location: [backend/routes/admin.js](backend/routes/admin.js)

**Step 4: Middleware Authentication**
```javascript
router.use(requireAuth, requireAdmin);  // Applied to all routes
```
- Checks if user is authenticated
- Checks if user is admin
- If not → rejects request

**Step 5: Controller Executes**
```javascript
const removeArtwork = async (req, res) => {
  // Delete from Cloudinary
  // Delete from MongoDB
  // Return response
};
```

**Step 6: Database Update**
```javascript
await Artwork.findByIdAndDelete(id);
```

**Step 7: Frontend Response**
```javascript
await loadAll();  // Refresh data from API
```

This flow ensures that:
- Only authenticated users can make requests
- Only admins can modify data
- All changes are logged
- Frontend immediately reflects changes

---

### **Question 10: What happens when an admin logs out?**

**Answer**:
Logout is handled by Firebase and removes all admin privileges.

**Logout Process**:

**Step 1: User Clicks Logout**
- Frontend calls Firebase logout
- Location: [frontend/app/components/AuthProvider.tsx](frontend/app/components/AuthProvider.tsx)

**Step 2: Firebase Clears Session**
```javascript
import { signOut } from 'firebase/auth';
await signOut(auth);
```

**Step 3: Auth State Changes**
```javascript
const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
  setUser(firebaseUser);  // Now null
  if (firebaseUser) {
    // Fetch user data
  } else {
    setAppUser(null);  // Clear app user
  }
});
```

**Step 4: Admin Page Redirects**
```javascript
if (!user) {
  router.push('/login');  // Redirect to login
  return;
}
```
Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Lines 34-35

**Security Implications**:
- All admin operations become impossible
- Firebase token is deleted from browser
- `firebaseUID` is cleared from memory
- Any API calls without valid UID will fail
- User must login again to access admin panel

**Session Timeout**:
- Firebase tokens have expiration (typically 1 hour)
- After expiration, user must login again
- No persistent admin access without continuous authentication

---

### **Question 11: How does the system prevent concurrent modifications?**

**Answer**:
The system relies on MongoDB's atomic operations and proper request handling.

**Atomic Updates**:
```javascript
const user = await User.findByIdAndUpdate(
  id, 
  { isSuspended: !!suspended }, 
  { new: true }  // Returns updated document
);
```

**What protects against concurrent modifications?**

1. **Database Level**:
   - MongoDB uses atomic `findByIdAndUpdate`
   - Only one update happens at a time
   - No race conditions at database level

2. **Application Level**:
   - Each request is independent
   - No locking mechanism (relies on database atomicity)
   - For high-concurrency systems, would need version numbers or timestamps

3. **Frontend Level**:
   - `busy` flag prevents multiple simultaneous actions
   - Code: `setBusy(true)` and `setBusy(false)` around API calls
   - Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Lines 174-188

**Potential Issue**:
If two admins try to update the same user simultaneously:
- Both requests reach backend
- MongoDB processes both atomically (last write wins)
- Frontend shows final state after reload
- No data loss, but intermediate state might be skipped

**Solution for Production**:
- Add version numbers to documents
- Check version before update
- Return conflict error if versions don't match

---

### **Question 12: What error handling exists in the admin system?**

**Answer**:
Error handling is implemented at multiple levels:

**Frontend Error Handling**:
Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx)

```javascript
const [error, setError] = useState<string>('');

try {
  // API calls
} catch (e) {
  console.error('Load all error:', e);
  setError('Failed to load admin data. Please check console for details.');
}
```

**Backend Error Handling**:
Location: [backend/controllers/adminController.js](backend/controllers/adminController.js)

Each controller function has try-catch:
```javascript
const removeArtwork = async (req, res) => {
  try {
    const art = await Artwork.findById(id);
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    // ... deletion logic
    res.json({ success: true });
  } catch (err) {
    console.error('Remove artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
```

**Error Types**:

1. **404 Not Found**: Resource doesn't exist
   ```javascript
   if (!art) return res.status(404).json({ message: 'Artwork not found' });
   ```

2. **500 Server Error**: Unexpected server exception
   ```javascript
   catch (err) {
     res.status(500).json({ message: 'Server error.' });
   }
   ```

3. **401 Unauthorized**: Not authenticated
   ```javascript
   if (!firebaseUID) {
     return res.status(401).json({ message: 'firebaseUID is required' });
   }
   ```

4. **403 Forbidden**: Not authorized
   ```javascript
   if (!isAdminByRole && !isAdminByEmail) {
     return res.status(403).json({ message: 'Admin access required' });
   }
   ```

**Frontend User Feedback**:
- Loading spinner shown while fetching
- Error messages displayed to user
- Console logs for debugging
- No sensitive errors exposed to frontend

---

### **Question 13: How is Cloudinary integration used in deletion?**

**Answer**:
When deleting an artwork, all images are removed from Cloudinary cloud storage.

**Why Use Cloudinary?**
- Images are stored externally, not in MongoDB
- More scalable than storing large files in database
- Reduces server storage costs
- Provides CDN for faster image delivery

**Deletion Process**:
Location: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 80-87

```javascript
const removeArtwork = async (req, res) => {
  const art = await Artwork.findById(id);
  
  // Extract public IDs from Cloudinary URLs
  if (Array.isArray(art.images)) {
    const publicIds = art.images
      .map((url) => extractPublicId(url))
      .filter(Boolean);
    
    // Delete images from Cloudinary
    await Promise.all(
      publicIds.map((pid) => deleteFromCloudinary(pid))
    );
  }
  
  // Delete database record
  await Artwork.findByIdAndDelete(id);
};
```

**How it works**:
1. Extract public ID from each image URL
   - Example URL: `https://res.cloudinary.com/xyz/image/upload/v123/abc123.jpg`
   - Public ID extracted: `abc123`

2. Call Cloudinary API to delete each image
   - Uses `deleteFromCloudinary()` utility function
   - Removes image from Cloudinary servers

3. Delete artwork from MongoDB
   - Only after images are deleted
   - Ensures no orphaned images in cloud

4. Return success response

**Benefit**:
- When artwork is deleted, all associated images are also cleaned up
- No storage waste on Cloudinary
- Complete removal of data

Location of Cloudinary utils: [backend/utils/cloudinary.js](backend/utils/cloudinary.js)

---

### **Question 14: What data is displayed in the Analytics section?**

**Answer**:
The Analytics section shows "Sales Per Artist" with comprehensive sales data.

**Displayed Data**:
1. **Artist Name**: Name of the seller
2. **Email**: Artist's email address
3. **Revenue**: Total income in Bangladeshi Taka (৳)
4. **Units Sold**: Total quantity of items sold
5. **Orders**: Total number of orders

**Data Source**:
Location: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 245-290

The `getArtistSales` function uses MongoDB aggregation:

```javascript
Order.aggregate([
  { $match: { paymentStatus: 'paid' } },  // Only paid orders
  { $unwind: '$items' },                   // Split order items
  { $lookup: { ... } },                    // Join with artworks
  { $group: {                              // Group by artist
    _id: '$artworkDoc.artist',
    revenue: { $sum: {...} },
    sales: { $sum: '$items.quantity' },
    orderIds: { $addToSet: '$_id' }
  }},
  { $lookup: { ... } },                    // Join with user data
  { $project: { ... } },                   // Format output
  { $sort: { revenue: -1 } }               // Sort by revenue
])
```

**How it calculates**:
1. Finds all orders with `paymentStatus: 'paid'`
2. Extracts artwork information for each item
3. Groups items by artist
4. Sums up total revenue per artist
5. Counts total units sold per artist
6. Counts unique orders per artist

**Frontend Display**:
Location: [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx) Lines 210-228

```jsx
<table>
  <tr>
    <th>Artist</th>
    <th>Email</th>
    <th>Revenue</th>
    <th>Units Sold</th>
    <th>Orders</th>
  </tr>
  {artistSales.map((s) => (
    <tr>
      <td>{s.name}</td>
      <td>{s.email}</td>
      <td>৳ {s.revenue.toFixed(2)}</td>
      <td>{s.sales}</td>
      <td>{s.orders}</td>
    </tr>
  ))}
</table>
```

**Business Value**:
- Track which artists are generating most revenue
- Identify top performers
- Monitor sales trends
- Make data-driven promotion decisions

---

### **Question 15: Can an admin delete another admin account?**

**Answer**:
Yes, there is NO special protection for admin accounts. An admin can suspend another admin.

**Current Implementation**:
Location: [backend/controllers/adminController.js](backend/controllers/adminController.js) Lines 107-116

```javascript
const suspendUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    id, 
    { isSuspended: !!suspended }, 
    { new: true }
  );
};
```

**Security Issue**:
- No check to prevent suspending admins
- An admin could suspend the main admin
- No super-admin role to prevent this

**Recommended Improvements**:
```javascript
const suspendUser = async (req, res) => {
  const { id } = req.params;
  const { suspended } = req.body;
  
  // Don't allow suspending the main admin
  if (user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
    return res.status(403).json({ 
      message: 'Cannot suspend main admin' 
    });
  }
  
  // Don't allow non-super-admin to suspend other admins
  if (targetUser.role === 'admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({ 
      message: 'Only super-admin can manage admins' 
    });
  }
  
  const user = await User.findByIdAndUpdate(id, { isSuspended: !!suspended }, { new: true });
};
```

**For Your Viva**:
- Mention that current system lacks this protection
- Suggest adding role hierarchy (admin vs super-admin)
- Explain why this is important for production

---

## DATABASE MODELS

### User Model
**File**: [backend/models/User.js](backend/models/User.js)

```javascript
{
  email: String (unique),
  firebaseUID: String (unique),
  name: String,
  role: String (enum: 'buyer', 'artist', 'admin'),
  isSuspended: Boolean (default: false),
  artistProfile: ObjectId (reference to ArtistProfile),
  timestamps: true
}
```

### Artwork Model
**File**: [backend/models/Artwork.js](backend/models/Artwork.js)

Has `moderationStatus` and `featured` fields used by admin.

### Review Model
**File**: [backend/models/Review.js](backend/models/Review.js)

Has `isRemoved` field to track if review is hidden.

### Order Model
**File**: [backend/models/Order.js](backend/models/Order.js)

Tracks orders with `paymentStatus` for analytics.

---

## ERROR HANDLING

### HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful operation |
| 401 | Unauthorized | No firebaseUID provided |
| 403 | Forbidden | Not admin or account suspended |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected exception |

---

## SUMMARY TABLE

| Feature | Frontend File | Backend File | Route | Protection |
|---------|---------------|--------------|-------|------------|
| Admin Page Access | admin/page.tsx | - | - | requireAuth + Admin check |
| Get Pending Artworks | admin/page.tsx | adminController.js | GET /admin/artworks/pending | requireAuth + requireAdmin |
| Approve Artwork | admin/page.tsx | adminController.js | PATCH /admin/artworks/:id/approve | requireAuth + requireAdmin |
| Delete Artwork | admin/page.tsx | adminController.js | DELETE /admin/artworks/:id | requireAuth + requireAdmin |
| Suspend User | admin/page.tsx | adminController.js | PATCH /admin/users/:id/suspend | requireAuth + requireAdmin |
| Feature Artist | admin/page.tsx | adminController.js | PATCH /admin/artists/:id/feature | requireAuth + requireAdmin |
| Delete Blog | admin/page.tsx | adminController.js | DELETE /admin/blog/:id | requireAuth + requireAdmin |
| View Analytics | admin/page.tsx | adminController.js | GET /admin/analytics/artists-sales | requireAuth + requireAdmin |

---

## KEY POINTS TO MEMORIZE FOR VIVA

1. **Three-Layer Security**: Frontend UI check → API header authentication → Backend authorization
2. **Admin Identification**: By role='admin' OR email matches ADMIN_EMAIL
3. **Cross Button Flow**: Frontend → DELETE request → Middleware checks → Controller deletes → Cloudinary cleanup → DB deletion
4. **Suspended Users**: Cannot access ANY protected routes (checked in requireAuth middleware)
5. **Atomic Operations**: MongoDB uses `findByIdAndUpdate` for atomic changes
6. **No Direct Database Access**: All operations go through controllers with error handling
7. **Admin Routes Protection**: `router.use(requireAuth, requireAdmin)` applies to all routes
8. **Cloudinary Integration**: External storage prevents orphaned files after deletion
9. **Analytics**: Uses MongoDB aggregation to calculate revenue, units sold, orders by artist
10. **Error Responses**: 401 for auth, 403 for authorization, 404 for not found, 500 for server errors

---

## REVISION CHECKLIST

Before your viva, ensure you can explain:

- [ ] How a non-admin user is blocked from accessing admin page
- [ ] What happens when you click the × button
- [ ] How suspended users are blocked from all operations
- [ ] Why backend checks are more important than frontend checks
- [ ] Two ways an admin can be identified
- [ ] What firebaseUID is and how it's used
- [ ] All four types of deletion operations
- [ ] How analytics data is calculated
- [ ] MongoDB aggregation pipeline in analytics
- [ ] Error codes used in the system
- [ ] Cloudinary integration benefits
- [ ] How logout clears admin access
- [ ] Middleware chain: requireAuth then requireAdmin
- [ ] Database models and their relationships
- [ ] Route protection mechanism

---

**Good luck with your viva! You got this! 🚀**

