const Artwork = require('../models/Artwork.js');
const User = require('../models/User.js');
const { uploadMultipleToCloudinary, replaceImages } = require('../utils/cloudinary.js');

const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveInt = (value, fallback, max = 200) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

// Create new artwork (POST /api/artworks)
const createArtwork = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can create artworks' });
    }

    const { title, description, category, price, images, dimensions, materials } = req.body;

    if (!title || !category || !price) {
      return res.status(400).json({ message: 'Title, category, and price are required' });
    }

    // Upload images to Cloudinary
    let cloudinaryUrls = [];
    if (images && images.length > 0) {
      console.log(`Uploading ${images.length} images to Cloudinary...`);
      cloudinaryUrls = await uploadMultipleToCloudinary(images, 'shilpohaat/artworks');
      console.log('✓ Images uploaded to Cloudinary');
    }

    const artwork = new Artwork({
      artist: user._id,
      title,
      description,
      category,
      price,
      images: cloudinaryUrls,
      dimensions: dimensions || {},
      materials: materials || [],
    });

    await artwork.save();

    return res.status(201).json({ success: true, artwork });
  } catch (error) {
    console.error('Create artwork error:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get all artworks (GET /api/artworks)
const getAllArtworks = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      status,
      featured,
      search,
      artistId,
      page,
      limit,
      fields,
      includeArtistProfile,
      thumbnailOnly,
    } = req.query;

    const pageNum = parsePositiveInt(page, 1, 10000);
    const limitNum = parsePositiveInt(limit, 0, 200);
    const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const isCardFields = fields === 'card';
    const shouldIncludeArtistProfile = includeArtistProfile !== 'false';
    const useThumbnailOnly = thumbnailOnly === 'true';

    let query = {};

    // By default, only show approved artworks publicly
    const includeAll = req.query.includeAll === 'true';
    const moderationStatus = req.query.moderationStatus;
    if (!includeAll && !moderationStatus) {
      // Show approved and pending artworks by default so freshly uploaded items are visible
      query.$or = [
        { moderationStatus: 'approved' },
        { moderationStatus: 'pending' },
        { moderationStatus: { $exists: false } },
      ];
    } else if (moderationStatus) {
      query.moderationStatus = moderationStatus;
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (featured === 'true') query.featured = true;
    if (artistId) query.artist = artistId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      const safe = escapeRegex(search);
      const searchClause = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];

      if (query.$or) {
        query = { $and: [{ $or: query.$or }, { $or: searchClause }] };
      } else {
        query.$or = searchClause;
      }
    }

    let selectFields = 'artist title description category price images arModelUrl status featured moderationStatus createdAt';
    if (isCardFields) {
      selectFields = 'artist title category price images status featured moderationStatus createdAt';
    }

    const baseQuery = Artwork.find(query).select(selectFields).sort({ createdAt: -1 }).lean();

    if (shouldIncludeArtistProfile) {
      baseQuery.populate({
        path: 'artist',
        select: 'name email artistProfile',
        populate: {
          path: 'artistProfile',
          select: 'profilePicture availability',
        },
      });
    } else {
      baseQuery.populate({
        path: 'artist',
        select: 'name',
      });
    }

    if (limitNum > 0) {
      baseQuery.skip(skipNum).limit(limitNum);
    }

    const [artworks, total] = await Promise.all([
      baseQuery,
      Artwork.countDocuments(query),
    ]);

    const normalizedArtworks = useThumbnailOnly
      ? artworks.map((artwork) => ({
          ...artwork,
          images: Array.isArray(artwork.images) ? artwork.images.slice(0, 1) : [],
        }))
      : artworks;

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');

    return res.json({
      success: true,
      count: normalizedArtworks.length,
      total,
      page: limitNum > 0 ? pageNum : 1,
      limit: limitNum > 0 ? limitNum : total,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      artworks: normalizedArtworks,
    });
  } catch (error) {
    console.error('Get artworks error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get single artwork (GET /api/artworks/:id)
const getArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', 'name email firebaseUID')
      .populate({
        path: 'artist',
        populate: {
          path: 'artistProfile',
          select: 'bio profilePicture specializations contactPhone website instagram availability',
        },
      });

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    // Increment views asynchronously so detail response is not delayed by a write round-trip.
    Artwork.updateOne({ _id: artwork._id }, { $inc: { views: 1 } })
      .catch((err) => console.error('Artwork view increment failed:', err.message));

    return res.json({ success: true, artwork });
  } catch (error) {
    console.error('Get artwork error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get artworks by artist (GET /api/artworks/artist/:artistId)
const getArtworksByArtist = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.params.artistId })
      .populate('artist', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: artworks.length,
      artworks,
    });
  } catch (error) {
    console.error('Get artist artworks error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createArtwork,
  getAllArtworks,
  getArtwork,
  getArtworksByArtist,
};
