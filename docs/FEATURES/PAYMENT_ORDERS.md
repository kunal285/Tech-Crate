# Payment Gateway & Order Lifecycle Feature Specification

This document details payment processing with **Razorpay** (`https://razorpay.com`), cart/wishlist management, and order status transitions.

---

## 💳 Razorpay Payment Gateway Integration (`controllers/paymentController.js` & `services/razorpayService.js`)

TechCrate utilizes **Razorpay** (`https://razorpay.com`) for secure, seamless checkout supporting UPI, Credit/Debit Cards, NetBanking, and Wallets.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Mobile App / Web App
    participant API as Express Backend API
    participant Razorpay as Razorpay Gateway (razorpay.com)

    User->>Client: Review cart and submit checkout
    Client->>API: POST /api/checkout/initiate { items, shippingAddress, paymentMethod }
    API->>Razorpay: Create Order { amount, currency, receipt }
    Razorpay-->>API: { razorpay_order_id, amount, currency, key_id }
    API-->>Client: { session_id, razorpay_order_id, razorpay_key_id, amount }
    Client->>Razorpay: Open Razorpay Checkout Modal
    User->>Razorpay: Complete Payment (UPI / Card / NetBanking)
    Razorpay-->>Client: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    Client->>API: POST /api/payments/verify { razorpay_payment_id, razorpay_order_id, razorpay_signature, session_id }
    API->>API: Verify HMAC-SHA256 signature
    API->>API: Finalize Order (`isPaid: true`, `orderStatus: "Processing"`)
    API-->>Client: Order Confirmed
```

---

## ⚙️ Environment Configuration

Set up the following variables in your `backend/.env` file:

```env
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
```

In development environments where keys are unset or using placeholders, the system uses a built-in sandbox mock mode for offline testing.

---

## 📦 Order Status Lifecycle

Orders progress through defined state transitions:
1. `Pending`: Order created, awaiting payment confirmation.
2. `Processing`: Payment verified via Auto UPI Gateway; order routed to fulfillment team.
3. `Shipped`: Dispatch tracking code assigned.
4. `Delivered`: Successful delivery to customer shipping address.
5. `Cancelled`: Order voided prior to dispatch.
