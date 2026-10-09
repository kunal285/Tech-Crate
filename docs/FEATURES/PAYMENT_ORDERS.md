# Payment Gateway & Order Lifecycle Feature Specification

This document details payment processing with **Auto UPI Gateway** (`https://autoupigateway.com`), cart/wishlist management, and order status transitions.

---

## 💳 Auto UPI Payment Gateway Integration (`controllers/paymentController.js` & `services/autoUpiService.js`)

TechCrate utilizes **Auto UPI Gateway** (`https://autoupigateway.com`) for direct, instant UPI transactions, intent links, QR codes, and automated webhooks.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Mobile as Mobile App / Web App
    participant API as Express Backend API
    participant AutoUPI as Auto UPI Gateway (autoupigateway.com)

    User->>Mobile: Review cart and submit checkout
    Mobile->>API: POST /api/orders { items, shippingAddress, paymentMethod }
    API-->>Mobile: Pending order details page { orderId, total, status: Pending }
    User->>Mobile: Tap Pay Now on order details
    Mobile->>API: POST /api/payments/create-order { orderId }
    API->>AutoUPI: POST https://autoupigateway.com/api/create-order { user_token, amount, order_id }
    AutoUPI-->>API: { status: true, payment_url, upi_intent_url, qr_code }
    API-->>Mobile: { success: true, paymentUrl, upiIntentUrl, qrData, orderId }
    Mobile->>User: Launch UPI Intent (GPay/PhonePe/Paytm) or Display QR Code
    User->>AutoUPI: Complete Payment in UPI App
    AutoUPI->>API: POST /api/payments/webhook (Instant Status Notification)
    Mobile->>API: POST /api/payments/verify { orderId }
    API->>AutoUPI: POST https://autoupigateway.com/api/check-order-status
    AutoUPI-->>API: { status: "COMPLETED", isPaid: true }
    API->>API: Mark Order as Paid (`isPaid: true`, `orderStatus: "Processing"`)
    API-->>Mobile: Payment Verified & Order Confirmed
```

---

## ⚙️ Environment Configuration

Set up the following variables in your `.env` file:

```env
# Auto UPI Gateway (https://autoupigateway.com)
AUTO_UPI_GATEWAY_URL=https://autoupigateway.com
AUTO_UPI_USER_TOKEN=your_merchant_user_token_here
AUTO_UPI_WEBHOOK_SECRET=your_webhook_secret_here
```

In development or staging environments where `AUTO_UPI_USER_TOKEN` is unset, the system seamlessly uses a built-in sandbox mock mode for offline testing.

---

## 📦 Order Status Lifecycle

Orders progress through defined state transitions:
1. `Pending`: Order created, awaiting payment confirmation.
2. `Processing`: Payment verified via Auto UPI Gateway; order routed to fulfillment team.
3. `Shipped`: Dispatch tracking code assigned.
4. `Delivered`: Successful delivery to customer shipping address.
5. `Cancelled`: Order voided prior to dispatch.
