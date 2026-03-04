const Artwork = require('../models/Artwork');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const Review = require('../models/Review');
const Report = require('../models/Report');
const BlogPost = require('../models/BlogPost');
const { deleteFromCloudinary, extractPublicId } = require('../utils/cloudinary');
const Order = require('../models/Order');

// Overview counts
const getOverview = async (req, res) => {
  try {
    const [pendingArtworks, openReports] = await Promise.all([
      Artwork.countDocuments({ moderationStatus: 'pending' }),
      Report.countDocuments({ status: 'open' }),
    ]);
    res.json({ pendingArtworks, openReports });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Artworks moderation
const getPendingArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ moderationStatus: 'pending' })
      .select('title artist category price moderationStatus createdAt')
      .populate('artist', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ artworks });
  } catch (err) {
    console.error('Get pending artworks error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const approveArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Artwork.findByIdAndUpdate(id, { moderationStatus: 'approved' }, { new: true });
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ artwork: art });
  } catch (err) {
    console.error('Approve artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const rejectArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Artwork.findByIdAndUpdate(id, { moderationStatus: 'rejected' }, { new: true });
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ artwork: art });
  } catch (err) {
    console.error('Reject artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const featureArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    const art = await Artwork.findByIdAndUpdate(id, { featured: !!featured }, { new: true });
    if (!art) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ artwork: art });
  } catch (err) {
    console.error('Feature artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const removeArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const art = await Artwork.findById(id);
    if (!art) return res.status(404).json({ message: 'Artwork not found' });

    // Attempt to delete images from Cloudinary
    if (Array.isArray(art.images)) {
      const publicIds = art.images.map((url) => extractPublicId(url)).filter(Boolean);
      await Promise.all(publicIds.map((pid) => deleteFromCloudinary(pid)));
    }

    await Artwork.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Remove artwork error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Users management
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role isSuspended')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;    
    const user = await User.findByIdAndUpdate(id, { isSuspended: !!suspended }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Suspend user error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Artists management
const getArtists = async (req, res) => {
  try {
    const artists = await ArtistProfile.find({})
      .select('user bio isFeatured isSuspended availability rating totalArtworks createdAt')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ artists });
  } catch (err) {
    console.error('Get artists error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const featureArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const artist = await ArtistProfile.findByIdAndUpdate(id, { isFeatured: !!isFeatured }, { new: true });
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json({ artist });
  } catch (err) {
    console.error('Feature artist error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const suspendArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;
    const artist = await ArtistProfile.findByIdAndUpdate(id, { isSuspended: !!isSuspended }, { new: true });
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json({ artist });
  } catch (err) {
    console.error('Suspend artist error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Reviews moderation
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('artwork', 'title')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const hideReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRemoved } = req.body;
    const review = await Review.findByIdAndUpdate(id, { isRemoved: !!isRemoved }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) {
    console.error('Hide review error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

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

// Reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
    res.json({ reports });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ report });
  } catch (err) {
    console.error('Update report status error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getOverview,
  // artworks
  getPendingArtworks,
  approveArtwork,
  rejectArtwork,
  featureArtwork,
  removeArtwork,
  // users
  getUsers,
  suspendUser,
  // artists
  getArtists,
  featureArtist,
  suspendArtist,
  // reviews
  getReviews,
  hideReview,
  deleteReview,
  // reports
  getReports,
  updateReportStatus,
  // analytics
  getArtistSales: async (req, res) => {
    try {
      const days = parseInt(req.query.days || '0', 10);
      let matchStage = { paymentStatus: 'paid' };
      if (days && days > 0) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        matchStage.createdAt = { $gte: since };
      }

      const result = await Order.aggregate([
        { $match: matchStage },
        { $project: { items: 1, createdAt: 1 } },
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
  },
  // blogs
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
  },
};
