const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('../models/Order');

// Initialize Stripe only if API key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Initiate SSLCommerz payment
// POST /api/payments/sslcommerz/initiate
// body: { orderId }
const initiateSslcommerz = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'sslcommerz') {
      return res.status(400).json({ message: 'Payment method must be sslcommerz for this order' });
    }

    // Config
    const store_id = process.env.STORE_ID;
    const store_passwd = process.env.STORE_PASSWORD;
    const is_live = process.env.IS_LIVE === 'true';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    if (!store_id || !store_passwd) {
      return res.status(500).json({ message: 'SSLCommerz credentials missing in environment' });
    }

    const tran_id = `${order._id}`;

    const sslData = {
      total_amount: order.totalAmount,
      currency: order.currency || 'BDT',
      tran_id,
      success_url: `${backendUrl}/api/payments/sslcommerz/success`,
      fail_url: `${backendUrl}/api/payments/sslcommerz/fail`,
      cancel_url: `${backendUrl}/api/payments/sslcommerz/cancel`,
      ipn_url: `${backendUrl}/api/payments/sslcommerz/ipn`,
      shipping_method: 'Courier',
      product_name: 'Artwork Purchase',
      product_category: 'Art',
      product_profile: 'general',
      cus_name: order.customerName || 'Customer',
      cus_email: order.customerEmail || 'customer@example.com',
      cus_add1: order.shippingAddress?.street || 'N/A',
      cus_city: order.shippingAddress?.city || 'N/A',
      cus_postcode: order.shippingAddress?.postalCode || '0000',
      cus_country: order.shippingAddress?.country || 'Bangladesh',
      cus_phone: order.customerPhone || '0000000000',
      ship_name: order.customerName || 'Customer',
      ship_add1: order.shippingAddress?.street || 'N/A',
      ship_city: order.shippingAddress?.city || 'N/A',
      ship_postcode: order.shippingAddress?.postalCode || '0000',
      ship_country: order.shippingAddress?.country || 'Bangladesh',
      value_a: order._id.toString(), // metadata to identify order
    };

    const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcommerz.init(sslData);
    if (apiResponse?.GatewayPageURL) {
      return res.json({ success: true, redirectURL: apiResponse.GatewayPageURL });
    }

    console.error('SSLCommerz init: missing GatewayPageURL', apiResponse);
    return res.status(500).json({ message: 'Failed to initiate SSLCommerz payment', details: apiResponse });
  } catch (error) {
    console.error('SSLCommerz init error:', error);
    return res.status(500).json({ message: 'Server error.', error: error?.message });
  }
};

// Success handler (SSLCommerz will POST here)
const sslSuccess = async (req, res) => {
  try {
    const orderId = req.body?.value_a || req.body?.tran_id;
    if (!orderId) {
      return res.status(400).send('Invalid success payload');
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      transactionId: req.body?.val_id || req.body?.tran_id,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/order-success/${orderId}`);
  } catch (error) {
    console.error('SSLCommerz success error:', error);
    return res.status(500).send('Server error');
  }
};

// Fail handler
const sslFail = async (req, res) => {
  try {
    const orderId = req.body?.value_a || req.body?.tran_id;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/checkout?status=failed`);
  } catch (error) {
    console.error('SSLCommerz fail error:', error);
    return res.status(500).send('Server error');
  }
};

// Cancel handler
const sslCancel = async (req, res) => {
  try {
    const orderId = req.body?.value_a || req.body?.tran_id;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/checkout?status=cancelled`);
  } catch (error) {
    console.error('SSLCommerz cancel error:', error);
    return res.status(500).send('Server error');
  }
};

// IPN handler (optional)
const sslIpn = async (req, res) => {
  try {
    const status = req.body?.status;
    const orderId = req.body?.value_a || req.body?.tran_id;
    if (orderId && status === 'VALID') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        transactionId: req.body?.val_id || req.body?.tran_id,
      });
    }
    return res.status(200).send('IPN received');
  } catch (error) {
    console.error('SSLCommerz IPN error:', error);
    return res.status(500).send('Server error');
  }
};

// ============= STRIPE PAYMENT INTEGRATION =============

// Create Stripe Payment Intent
// POST /api/payments/stripe/create-intent
// body: { orderId }
const createStripePaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      console.error('Stripe not initialized - check STRIPE_SECRET_KEY in .env');
      return res.status(500).json({ message: 'Stripe is not configured', details: 'STRIPE_SECRET_KEY missing' });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'stripe') {
      return res.status(400).json({ message: 'Payment method must be stripe for this order' });
    }

    console.log('Creating Stripe payment intent:', {
      orderId: orderId,
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency || 'BDT',
      customerEmail: order.customerEmail,
    });

    // Create payment intent with amount in cents
    // Note: Use USD for test mode if BDT is not supported
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe expects amount in cents
      currency: 'usd', // Use USD for test/demo (BDT may not be supported in test mode)
      metadata: {
        orderId: order._id.toString(),
        customerEmail: order.customerEmail,
      },
      description: `Order ${order._id} - Artwork Purchase`,
    });

    console.log('✓ Payment intent created:', paymentIntent.id);

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    console.error('Error details:', error?.message, error?.code, error?.decline_code);
    return res.status(500).json({ 
      message: 'Failed to create payment intent', 
      error: error?.message,
      code: error?.code
    });
  }
};

// Confirm Stripe Payment and update order
// POST /api/payments/stripe/confirm
// body: { orderId, paymentIntentId }
const confirmStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured' });
    }

    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ message: 'orderId and paymentIntentId are required' });
    }

    console.log('Confirming Stripe payment:', { orderId, paymentIntentId });

    // Retrieve payment intent from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log('Payment intent status:', paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      // Update order with payment details
      const updatedOrder = await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        transactionId: paymentIntent.id,
      }, { new: true });

      console.log('✓ Order updated:', orderId, 'status:', updatedOrder.paymentStatus);

      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        orderId,
      });
    } else if (paymentIntent.status === 'processing') {
      return res.json({
        success: false,
        message: 'Payment is processing',
        status: 'processing',
      });
    } else {
      // Payment failed or cancelled
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
      });

      console.log('✗ Payment failed:', paymentIntent.status);

      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error('Stripe confirm payment error:', error);
    return res.status(500).json({ message: 'Failed to confirm payment', error: error?.message });
  }
};

// Stripe Webhook handler for payment status updates
// POST /api/payments/stripe/webhook
const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    let body = req.body;

    // Handle raw body (Buffer) if provided
    if (Buffer.isBuffer(body)) {
      body = body.toString('utf-8');
    }

    // Parse if it's a string
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    if (endpointSecret && sig) {
      // Verify webhook signature
      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      // No signature verification (for testing without endpoint secret)
      event = body;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            transactionId: paymentIntent.id,
          });
          console.log(`✓ Order ${orderId} payment confirmed via webhook`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'failed',
          });
          console.log(`✗ Order ${orderId} payment failed via webhook`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const orderId = charge.metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'refunded',
          });
          console.log(`↺ Order ${orderId} refunded via webhook`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = {
  initiateSslcommerz,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIpn,
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
};