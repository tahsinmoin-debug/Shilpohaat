const Order = require('../models/Order.js');
const User = require('../models/User.js');
const Artwork = require('../models/Artwork.js');

// Create order (POST /api/orders)
const createOrder = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      items,
      subtotal,
      shippingCost,
      totalAmount,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    if (!paymentMethod || !['cod', 'sslcommerz', 'stripe'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid payment method is required' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    // Create order
    const order = new Order({
      userId: user._id,
      items,
      subtotal,
      shippingCost,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    });

    await order.save();

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get user's orders (GET /api/orders)
const getUserOrders = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ userId: user._id })
      .populate('items.artworkId', 'title price category images')
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get single order (GET /api/orders/:id)
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.artworkId', 'title price category images artist');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Update payment status (PATCH /api/orders/:id/payment)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    if (!paymentStatus || !['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Valid payment status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, ...(transactionId && { transactionId }) },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Update payment error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Update order status (PATCH /api/orders/:id/status) - Admin only
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Valid order status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updatePaymentStatus,
  updateOrderStatus,
};
