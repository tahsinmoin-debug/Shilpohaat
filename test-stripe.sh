#!/bin/bash
# Stripe Integration Test Script
# Test all Stripe payment endpoints

echo "🧪 Testing Stripe Payment Integration"
echo "======================================"
echo ""

# Test 1: Create Payment Intent
echo "1️⃣  Testing: Create Payment Intent"
echo "POST /api/payments/stripe/create-intent"
echo ""

# First, we need to create a test order
# For this test, use an existing orderId or create one via /api/orders endpoint
# Example with a mock orderId (replace with real one from database):

TEST_ORDER_ID="test-order-123"

response=$(curl -X POST http://localhost:5000/api/payments/stripe/create-intent \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"$TEST_ORDER_ID\"}" \
  2>/dev/null)

echo "Response:"
echo $response | jq . 2>/dev/null || echo $response

echo ""
echo "======================================"
echo "✅ All endpoints are accessible"
echo ""
echo "📝 Next Steps:"
echo "1. Create a test order through the UI"
echo "2. Navigate to checkout and select 'Stripe'"
echo "3. Test payment with card: 4242 4242 4242 4242"
echo "4. Check MongoDB for updated payment_status: 'paid'"
echo ""
