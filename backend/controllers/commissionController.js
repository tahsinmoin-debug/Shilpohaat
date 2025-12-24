const CommissionRequest = require('../models/CommissionRequest');
const User = require('../models/User');
const ArtistProfile = require('../models/ArtistProfile');
const { uploadMultipleToCloudinary } = require('../utils/cloudinary');

// Create new commission request (Buyer)
const createCommissionRequest = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    console.log('Commission request - firebaseUID:', firebaseUID);
    
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const buyer = await User.findOne({ firebaseUID });
    console.log('Commission request - buyer found:', buyer ? buyer.email : 'NOT FOUND');
    console.log('Commission request - buyer role:', buyer?.role);
    
    if (!buyer) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (buyer.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can request commissions' });
    }

    const { title, description, style, budget, dimensions, referenceImages, deadline } = req.body;
    console.log('Commission request - data:', { title, style, budget, hasImages: referenceImages?.length > 0 });

    if (!title || !style || !budget) {
      return res.status(400).json({ message: 'Title, style, and budget are required' });
    }

    // Upload reference images to Cloudinary
    let cloudinaryUrls = [];
    if (referenceImages && referenceImages.length > 0) {
      console.log(`Uploading ${referenceImages.length} reference images to Cloudinary...`);
      try {
        cloudinaryUrls = await uploadMultipleToCloudinary(referenceImages, 'shilpohaat/commissions');
        console.log('✓ Reference images uploaded');
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload images', error: uploadError.message });
      }
    }

    const commissionRequest = new CommissionRequest({
      buyer: buyer._id,
      title,
      description,
      style,
      budget,
      dimensions: dimensions || {},
      referenceImages: cloudinaryUrls,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    await commissionRequest.save();

    // Populate buyer info for response
    await commissionRequest.populate('buyer', 'name email');

    return res.status(201).json({ success: true, commission: commissionRequest });
  } catch (error) {
    console.error('Create commission error:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get all pending commissions (for sellers to browse)
const getPendingCommissions = async (req, res) => {
  try {
    const commissions = await CommissionRequest.find({ status: 'pending' })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ commissions });
  } catch (error) {
    console.error('Get pending commissions error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get commissions by buyer (their own requests)
const getBuyerCommissions = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const buyer = await User.findOne({ firebaseUID });
    if (!buyer) {
      return res.status(404).json({ message: 'User not found' });
    }

    const commissions = await CommissionRequest.find({ buyer: buyer._id })
      .populate('acceptedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ commissions });
  } catch (error) {
    console.error('Get buyer commissions error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get commissions accepted by an artist (seller)
const getArtistCommissions = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const artist = await User.findOne({ firebaseUID });
    if (!artist) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (artist.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can have commission requests' });
    }

    const commissions = await CommissionRequest.find({ acceptedBy: artist._id })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ commissions });
  } catch (error) {
    console.error('Get artist commissions error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get single commission request
const getCommissionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await CommissionRequest.findById(id)
      .populate('buyer', 'name email')
      .populate('acceptedBy', 'name email');

    if (!commission) {
      return res.status(404).json({ message: 'Commission request not found' });
    }

    return res.json({ commission });
  } catch (error) {
    console.error('Get commission request error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Accept commission request (Artist)
const acceptCommission = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const artist = await User.findOne({ firebaseUID });
    if (!artist) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (artist.role !== 'artist') {
      return res.status(403).json({ message: 'Only artists can accept commissions' });
    }

    const { id } = req.params;
    const commission = await CommissionRequest.findByIdAndUpdate(
      id,
      { status: 'accepted', acceptedBy: artist._id },
      { new: true }
    )
      .populate('buyer', 'name email')
      .populate('acceptedBy', 'name email');

    if (!commission) {
      return res.status(404).json({ message: 'Commission request not found' });
    }

    return res.json({ success: true, commission });
  } catch (error) {
    console.error('Accept commission error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Reject commission request (Artist)
const rejectCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await CommissionRequest.findByIdAndUpdate(
      id,
      { status: 'rejected', acceptedBy: null },
      { new: true }
    )
      .populate('buyer', 'name email');

    if (!commission) {
      return res.status(404).json({ message: 'Commission request not found' });
    }

    return res.json({ success: true, commission });
  } catch (error) {
    console.error('Reject commission error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Update commission status (Buyer or Admin)
const updateCommissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const commission = await CommissionRequest.findByIdAndUpdate(id, { status }, { new: true })
      .populate('buyer', 'name email')
      .populate('acceptedBy', 'name email');

    if (!commission) {
      return res.status(404).json({ message: 'Commission request not found' });
    }

    return res.json({ success: true, commission });
  } catch (error) {
    console.error('Update commission status error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Cancel commission request (Buyer)
const cancelCommission = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const buyer = await User.findOne({ firebaseUID });
    if (!buyer) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id } = req.params;
    const commission = await CommissionRequest.findById(id);

    if (!commission) {
      return res.status(404).json({ message: 'Commission request not found' });
    }

    // Only buyer can cancel their own request
    if (commission.buyer.toString() !== buyer._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own commission' });
    }

    commission.status = 'cancelled';
    await commission.save();

    return res.json({ success: true, commission });
  } catch (error) {
    console.error('Cancel commission error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createCommissionRequest,
  getPendingCommissions,
  getBuyerCommissions,
  getArtistCommissions,
  getCommissionRequest,
  acceptCommission,
  rejectCommission,
  updateCommissionStatus,
  cancelCommission,
};
