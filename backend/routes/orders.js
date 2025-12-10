const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
  updatePaymentStatus,
  updateOrderStatus,
} = require('../controllers/orderController.js');

// POST /api/orders - Create a new order
router.post('/', createOrder);

// GET /api/orders - Get user's orders
router.get('/', getUserOrders);

// GET /api/orders/:id - Get single order
router.get('/:id', getOrder);

// PATCH /api/orders/:id/payment - Update payment status
router.patch('/:id/payment', updatePaymentStatus);

// PATCH /api/orders/:id/status - Update order status (admin)
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
