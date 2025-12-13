const express = require('express');
const router = express.Router();
const {
  initiateSslcommerz,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIpn,
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
} = require('../controllers/paymentController.js');

// SSLCommerz initiation
router.post('/sslcommerz/initiate', initiateSslcommerz);

// SSLCommerz callbacks
router.post('/sslcommerz/success', sslSuccess);
router.post('/sslcommerz/fail', sslFail);
router.post('/sslcommerz/cancel', sslCancel);
router.post('/sslcommerz/ipn', sslIpn);

// Stripe payment routes
router.post('/stripe/create-intent', createStripePaymentIntent);
router.post('/stripe/confirm', confirmStripePayment);

// Stripe webhook (with raw body middleware from index.js)
router.post('/stripe/webhook', (req, res, next) => {
  // Body parser middleware is already configured in index.js with express.raw()
  stripeWebhook(req, res);
});

module.exports = router;