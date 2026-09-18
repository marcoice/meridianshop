```
# PAYMENT ARCHITECTURE OVERVIEW

┌─────────────────────────────────────────────────────────────────────────────┐
│                          🛒 CHECKOUT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. ADDRESS STEP
   ┌──────────────────────────────────────────────────────────┐
   │  User fills shipping form                                │
   │  - Name, Email, Phone                                    │
   │  - Address, City, ZIP, Country                           │
   │  - Optional: Apartment, Region                           │
   └──────────────────────────────────────────────────────────┘
                              ↓
                    [Continue to Payment]
                              ↓

2. PAYMENT STEP - METHOD SELECTION
   ┌──────────────────────────────────────────────────────────┐
   │  Select payment method:                                  │
   │  ○ Card / Apple Pay / Google Pay (Stripe)              │
   │  ○ PayPal                                                │
   └──────────────────────────────────────────────────────────┘
                              ↓
                ┌─────────────┴─────────────┐
                ↓                           ↓

3A. STRIPE FLOW              3B. PAYPAL FLOW
    ┌──────────────────────┐  ┌──────────────────────┐
    │ Stripe Component     │  │ PayPal Component     │
    │ ─────────────────────│  │ ─────────────────────│
    │ Card Element OR      │  │ Redirect to          │
    │ Payment Request      │  │ paypal.com           │
    │ (Apple/Google Pay)   │  │ → User authorizes    │
    └──────────────────────┘  │ → Redirect back      │
            ↓                  └──────────────────────┘
                                    ↓
    POST /api/payment-intent
    {
      amount,
      shippingAddress,
      items
    }
            ↓
    Stripe Creates
    PaymentIntent
            ↓
    stripe.confirmCardPayment()
    OR paymentRequest.show()
            ↓                              ↓
    Stripe processes card              PayPal confirms
    or shows Apple/Google Pay           payment
            ↓                              ↓
            └──────────────┬───────────────┘
                           ↓
                    Payment successful
                           ↓
        ┌────────────────────────────────────┐
        │ POST /api/orders (Create order)    │
        │ ────────────────────────────────────│
        │ Send line_items + shipping address │
        │ to Printify                        │
        └────────────────────────────────────┘
                           ↓
                   Printify creates order
                           ↓
        ┌────────────────────────────────────┐
        │ ✓ Order Confirmed Page             │
        │ → Clear cart                       │
        │ → Show confirmation message        │
        │ → Email sent to customer           │
        └────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                     🔧 SYSTEM ARCHITECTURE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

FRONTEND (React/Next.js)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Page: /checkout                                                │
│  ├── components/StripeCheckoutButton.tsx ─────────────┐        │
│  │   ├── Stripe Provider (Elements)                   │        │
│  │   ├── Card Element                                 │        │
│  │   ├── PaymentRequestButtonElement                  │        │
│  │   │   (Apple Pay / Google Pay)                      │        │
│  │   └── Form handling                                │        │
│  │                                                    │        │
│  ├── components/PayPalCheckoutButton.tsx              │        │
│  │   ├── PayPal Buttons                               │        │
│  │   ├── createOrder callback                         │        │
│  │   └── onApprove callback                           │        │
│  │                                                    │        │
│  └── State management (Zustand)                       │        │
│      ├── Cart items                                   │        │
│      ├── Total price                                  │        │
│      └── User address                                 │        │
│                                                        │        │
└─────────────────────────────────────────────────────────────────┘
                          ↓ API CALLS ↓


BACKEND (Next.js API Routes)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Route: /api/payment-intent (POST)                              │
│  ├── Validate input                                             │
│  ├── Create Stripe PaymentIntent                                │
│  └── Return clientSecret to client                              │
│                                                                 │
│  Route: /api/orders (POST)                                      │
│  ├── Validate order payload                                     │
│  ├── Call Printify API                                          │
│  ├── Create order with shipping                                 │
│  └── Return order confirmation                                  │
│                                                                 │
│  Route: /api/webhooks/stripe (POST)                             │
│  ├── Verify webhook signature                                   │
│  ├── Handle payment_intent.succeeded                            │
│  ├── Create Printify order asynchronously                       │
│  └── Retry on failure                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                       ↓ API CALLS ↓


EXTERNAL SERVICES
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Stripe API                                                     │
│  ├── CreatePaymentIntent                                        │
│  ├── ConfirmPayment                                             │
│  ├── Webhooks                                                   │
│  └── Payment Methods (Card, SEPA, etc.)                         │
│                                                                 │
│  PayPal API                                                     │
│  ├── CreateOrder                                                │
│  ├── CaptureOrder                                               │
│  └── Webhooks (optional)                                        │
│                                                                 │
│  Printify API                                                   │
│  ├── GetShops                                                   │
│  ├── CreateOrder                                                │
│  ├── GetOrder                                                   │
│  └── UpdateOrder                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                     📊 DATA FLOW DIAGRAM                                     │
└─────────────────────────────────────────────────────────────────────────────┘

STRIPE FLOW:

User Input (Address + Cart)
    ↓
Validation (server-side)
    ↓
POST /api/payment-intent
├─ Request: { amount, shippingAddress, items }
└─ Response: { clientSecret, id }
    ↓
Client: stripe.confirmCardPayment(clientSecret)
├─ Encrypt card data (never sent to server)
├─ Get confirmation result from Stripe
└─ Return: { paymentIntent.status, error? }
    ↓
If success:
  ├─ POST /api/orders
  │  ├─ Create order in Printify
  │  └─ Return orderId
  ├─ Clear cart
  ├─ Show confirmation
  └─ Send email
    ↓
If webhook enabled:
  ├─ Stripe sends POST /api/webhooks/stripe
  │  ├─ Verify signature
  │  ├─ Extract metadata
  │  └─ Create Printify order (async)
  └─ Retry if failed


PAYPAL FLOW:

User Input (Address + Cart)
    ↓
Validation (server-side)
    ↓
PayPal Button rendered
    ↓
User clicks PayPal button
    ├─ PayPalButtons.createOrder()
    │  ├─ Request to Stripe/PayPal servers
    │  └─ Return orderId
    └─ Redirect to PayPal.com
    ↓
User logs in and approves
    ↓
Redirect back to site
    ↓
PayPalButtons.onApprove()
    ├─ actions.order.capture()
    ├─ Get payment confirmation
    └─ If success:
        ├─ POST /api/orders
        │  └─ Create order in Printify
        ├─ Clear cart
        ├─ Show confirmation
        └─ Send email


┌─────────────────────────────────────────────────────────────────────────────┐
│                  🔐 SECURITY & PCI COMPLIANCE                                │
└─────────────────────────────────────────────────────────────────────────────┘

✅ Implemented:

1. Card Data Never Touches Server
   └─ Stripe.js handles all card encryption
   └─ Server receives only clientSecret (non-sensitive)

2. Server-Side Validation
   └─ All inputs validated before API calls
   └─ Address validation with regex/whitelist
   └─ Amount validation (non-negative, reasonable max)

3. Webhook Verification
   └─ HMAC-SHA256 signature validation
   └─ Timestamp validation (replay protection)
   └─ Secret key never exposed to client

4. HTTPS Only
   └─ All API calls must be HTTPS
   └─ Apple Pay requires HTTPS
   └─ Stripe enforces SSL

5. Environment Secrets
   └─ STRIPE_SECRET_KEY never logged/exposed
   └─ STRIPE_WEBHOOK_SECRET stored securely
   └─ No secrets in git history

6. Logging & Monitoring
   └─ All transactions logged
   └─ Errors logged but sensitive data masked
   └─ Rate limiting recommended


⚠️ To Implement:

1. Rate Limiting
   └─ Limit /api/payment-intent calls
   └─ Prevent brute force attempts

2. IP Whitelisting (optional)
   └─ Restrict webhook calls to Stripe IPs
   └─ Prevent spoofed webhooks

3. Monitoring & Alerts
   └─ Alert on multiple failures
   └─ Monitor webhook latency
   └─ Track failed payments

4. Refund Handling
   └─ Implement refund endpoint
   └─ Only allow by authenticated admin
   └─ Log all refund reasons


┌─────────────────────────────────────────────────────────────────────────────┐
│                        💾 DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Optional: Add to database for order tracking:

TABLE payments:
  id                  (UUID)
  user_id            (foreign key)
  payment_method     (enum: stripe, paypal)
  stripe_payment_id  (string, nullable)
  paypal_order_id    (string, nullable)
  amount_cents       (integer)
  currency           (string, default: EUR)
  status             (enum: pending, succeeded, failed)
  error_message      (text, nullable)
  metadata           (JSON)
  created_at         (timestamp)
  updated_at         (timestamp)

TABLE orders:
  id                 (UUID)
  user_id            (foreign key)
  payment_id         (foreign key → payments.id)
  printify_order_id  (string)
  status             (enum: draft, pending, processing, etc)
  shipping_address   (JSON)
  line_items         (JSON)
  total_amount_cents (integer)
  created_at         (timestamp)
  updated_at         (timestamp)
  completed_at       (timestamp, nullable)

TABLE webhooks_log:
  id                 (UUID)
  provider           (enum: stripe, paypal)
  event_type         (string)
  event_id           (string)
  payload            (JSON)
  status             (enum: received, processing, success, failed)
  error_message      (text, nullable)
  retries            (integer, default: 0)
  created_at         (timestamp)
  processed_at       (timestamp, nullable)
```
