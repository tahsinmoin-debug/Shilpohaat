# Stripe Payment Integration Guide

## ✅ Implementation Complete

Full Stripe payment integration has been successfully implemented for the Shilpohaat platform. This includes payment intent creation, card processing, webhook handling, and order management.

---

## 📋 Setup Requirements

### Backend Environment Variables (`.env`)
```dotenv
STRIPE_SECRET_KEY=sk_test_51S2dBuPZVM0FwhSmDAJi0y905GgQ7WzYx9R1RTYX8GDtYMn3Y0LGLv8sbs9VJFYhnbiGOKA0RA2r6g5pKX2YCOHm00GE27APLI
```

### Frontend Environment Variables (`.env.local`)
```dotenv
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S2dBuPZVM0FwhSmNsSClknQIcwfqcOFtGRr3PWYwPdI64c9zppx2C2p53GVNpDG9fAWUO0beSHl56JzMyRjVwSz00VKOZZS8x
```

### Optional (for webhook verification):
```dotenv
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe dashboard Webhooks section
```

---

## 🔄 Payment Flow

### 1. **Checkout Page** (`frontend/app/checkout/page.tsx`)
- Customer selects "Stripe" as payment method
- Fills in shipping details
- Clicks "Place Order"
- Order is created in database
- Customer is redirected to Stripe payment page with `orderId` parameter

### 2. **Stripe Payment Page** (`frontend/app/payment/stripe/page.tsx`)
- Page loads and initializes payment intent with backend
- Backend creates Stripe PaymentIntent with order amount
- Customer enters card details (securely handled by Stripe Elements)
- Customer submits payment
- Frontend confirms payment with Stripe using `confirmCardPayment()`
- Backend verifies payment intent status
- If successful, order payment status is updated to "paid"
- Customer is redirected to order success page

### 3. **Backend Payment Processing**
Three main endpoints handle Stripe payments:

#### **Create Payment Intent**
```
POST /api/payments/stripe/create-intent
Body: { orderId: "..." }
Response: { success: true, clientSecret: "...", publishableKey: "..." }
```

#### **Confirm Payment**
```
POST /api/payments/stripe/confirm
Body: { orderId: "...", paymentIntentId: "..." }
Response: { success: true, message: "Payment confirmed successfully", orderId: "..." }
```

#### **Webhook Handler** (optional, for async updates)
```
POST /api/payments/stripe/webhook
Headers: stripe-signature (for signature verification)
Handles: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
```

---

## 💳 Testing Stripe Payments

### Test Card Numbers (Sandbox)
Use these card numbers with any future expiry date and any CVC:

| Card Type | Number | Outcome |
|-----------|--------|---------|
| Visa | `4242 4242 4242 4242` | ✅ Succeeds |
| Visa (Requires 3D Secure) | `4000 0025 0000 3155` | ✅ Succeeds with 3D Secure |
| Visa (Declines) | `4000 0000 0000 0002` | ❌ Declines |
| Mastercard | `5555 5555 5555 4444` | ✅ Succeeds |
| American Express | `3782 822463 10005` | ✅ Succeeds |

### Test Flow
1. Go to `http://localhost:3000`
2. Browse artworks and add to cart
3. Go to checkout
4. Select "Stripe" as payment method
5. Fill in shipping details
6. Click "Place Order"
7. Enter test card details (e.g., `4242 4242 4242 4242`)
8. Any future expiry date
9. Any 3-digit CVC
10. Submit payment
11. See success message and redirect to order confirmation

---

## 📊 Order Status Updates

The system updates order status at multiple points:

### On Frontend (Immediate)
- After successful card payment confirmation
- Order status set to "paid" immediately

### Via Backend (Real-time)
- When payment intent is confirmed
- Direct database update of order `paymentStatus`

### Via Webhook (Async - Optional)
- If Stripe webhook secret is configured
- Handles payment success/failure/refund events
- Ensures order status is synchronized even for delayed processing

---

## 🔐 Security Features

✅ **PCI Compliance**: Stripe Elements handles card data (never exposed to your server)
✅ **Secure Transmission**: All communications use HTTPS/TLS
✅ **Payment Intent Verification**: Backend verifies each payment with Stripe
✅ **Webhook Signature Verification**: Optional but recommended for production
✅ **Amount Verification**: Backend converts currency amounts correctly (to cents for Stripe)

---

## 📁 Files Modified/Created

### Backend
- ✏️ `backend/controllers/paymentController.js` - Added Stripe payment functions
- ✏️ `backend/routes/payments.js` - Added Stripe routes
- ✏️ `backend/index.js` - Added raw body middleware for webhooks
- ✓ `backend/.env` - STRIPE_SECRET_KEY configured

### Frontend
- ✏️ `frontend/app/checkout/page.tsx` - Updated to route Stripe orders
- ✏️ `frontend/app/payment/stripe/page.tsx` - Complete Stripe checkout page
- ✓ `frontend/.env.local` - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configured

---

## 🚀 Production Deployment

When deploying to production:

1. **Switch to Live Keys**
   - Get live keys from Stripe dashboard (remove "test" from key names)
   - Update `.env` and `.env.local` with live keys
   - Ensure `IS_LIVE=true` in SSLCommerz config if using it

2. **Configure Webhook**
   - Add webhook endpoint in Stripe dashboard:
     - URL: `https://yourdomain.com/api/payments/stripe/webhook`
     - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env`

3. **Update Environment URLs**
   ```dotenv
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://api.yourdomain.com
   ```

4. **Enable CORS** (if needed)
   - Update CORS origins in `backend/index.js` for production domain

---

## 🐛 Troubleshooting

### Payment Intent Creation Fails
- Verify `STRIPE_SECRET_KEY` is correct in `.env`
- Check backend logs for error details
- Ensure order exists in database before payment

### Card Payment Fails
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Check browser console for Stripe errors
- Use test card: `4242 4242 4242 4242` for debugging

### Webhook Not Firing
- Webhooks are optional for basic functionality
- If enabled, verify webhook secret matches dashboard
- Check Stripe dashboard "Webhooks" section for delivery status

### Order Not Updated After Payment
- Check backend logs for confirmation success
- Verify order exists before initiating payment
- Check MongoDB that order payment status was updated

---

## 📞 Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Elements](https://stripe.com/docs/stripe-js/elements/payment-element)
- [Payment Intent API](https://stripe.com/docs/api/payment_intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

---

**Last Updated**: December 9, 2025
**Status**: ✅ Production Ready
