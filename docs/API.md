# Core API Reference Specification

This document provides complete endpoint documentation for the **Tech Crate REST API**.

The backend server also exports an interactive OpenAPI 3.0 specification at `backend/docs/openapi.json`.

---

## 🔐 Authentication & Session Endpoints

### 1. User & Admin Email/Password Login
```http
POST /api/auth/login
Content-Type: application/json
```
**Request Body**:
```json
{
  "email": "admin@techcrate.com",
  "password": "password123"
}
```
**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "refreshToken": "d8a1f2b...",
  "user": {
    "_id": "651f8a...",
    "name": "System Administrator",
    "email": "admin@techcrate.com",
    "role": "admin"
  }
}
```

---

### 2. Register New User Account
```http
POST /api/auth/register
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@techcrate.com",
  "password": "password123",
  "phone": "9876543210"
}
```
**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "_id": "651f8b...",
    "name": "Rahul Sharma",
    "email": "rahul@techcrate.com",
    "role": "customer"
  }
}
```

---

## 📦 Product Catalog Endpoints

### 1. Fetch All Products
```http
GET /api/products?category=iot&search=esp32&page=1&limit=10
```
**Response (200 OK)**:
```json
{
  "products": [
    {
      "_id": "651f9b...",
      "title": "ESP32 NodeMCU Wi-Fi + Bluetooth Board",
      "description": "Powerful dual-core microcontroller for IoT development.",
      "category": "Microcontrollers",
      "price": 349,
      "originalPrice": 499,
      "discountedPrice": 349,
      "stock": 50,
      "images": {
        "cover": "https://res.cloudinary.com/demo/cover.jpg",
        "angle": "https://res.cloudinary.com/demo/angle.jpg",
        "schematic": "https://res.cloudinary.com/demo/pinout.jpg",
        "packaging": "https://res.cloudinary.com/demo/box.jpg"
      },
      "features": ["Built-in Wi-Fi & BLE", "240 MHz Dual Core", "512KB SRAM"]
    }
  ],
  "page": 1,
  "pages": 5,
  "total": 48
}
```

---

### 2. Create Product *(Admin / Seller)*
```http
POST /api/products
Authorization: Bearer <JWT_ADMIN_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{
  "title": "Arduino UNO R3 Board",
  "description": "ATmega328P based microcontroller board.",
  "category": "Microcontrollers",
  "price": 449,
  "originalPrice": 599,
  "stock": 100,
  "images": {
    "cover": "https://example.com/cover.png",
    "angle": "https://example.com/angle.png",
    "schematic": "https://example.com/schematic.png",
    "packaging": "https://example.com/pack.png"
  },
  "features": ["ATmega328P", "16 MHz Crystal", "14 Digital I/O"]
}
```

---

## 🎨 Promotional Poster Endpoints

### 1. Fetch Active Banners
```http
GET /api/posters/active
```
**Response (200 OK)**:
```json
[
  {
    "_id": "651fc...",
    "title": "Mega Electronics Sale",
    "subtitle": "Up to 40% OFF on IoT Development Kits",
    "imageUrl": "https://res.cloudinary.com/banner1.jpg",
    "ctaText": "Shop IoT Kits",
    "ctaLink": "/category/iot",
    "badge": "LIMITED DEAL",
    "isActive": true,
    "order": 1
  }
]
```

---

## 💳 Payment Gateway Endpoints (Auto UPI Gateway)

### 1. Create Auto UPI Payment Order *(Protected)*
```http
POST /api/payments/create-order
Authorization: Bearer <JWT_USER_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{
  "amount": 1499,
  "orderId": "651f8a...",
  "currency": "INR"
}
```
**Response (200 OK)**:
```json
{
  "success": true,
  "order_id": "ORD-20261010-ABCD",
  "razorpay_order_id": "order_xyz123",
  "razorpay_key_id": "rzp_test_...",
  "amount": 149900,
  "amount_display": 1499,
  "currency": "INR",
  "status": "PAYMENT_INITIATED"
}
```

---

### 2. Verify Razorpay Payment *(Protected)*
```http
POST /api/payments/verify
Authorization: Bearer <JWT_USER_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{
  "session_id": "651f8a...",
  "razorpay_payment_id": "pay_xyz456",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "9ef803..."
}
```
**Response (200 OK)**:
```json
{
  "success": true,
  "isPaid": true,
  "status": "paid",
  "order_id": "ORD-20261010-ABCD",
  "final_order_id": "ORD-20261010-ABCD"
}
```

---

## 🤖 AI Assistant Endpoint

### 1. Hardware Guidance Chat
```http
POST /api/ai/chat
Content-Type: application/json
```
**Request Body**:
```json
{
  "message": "How do I wire an ESP32 to an OLED display?"
}
```
**Response (200 OK)**:
```json
{
  "reply": "Connect VCC to 3.3V pin of ESP32 and SDA to GPIO21, SCL to GPIO22.",
  "suggestedComponents": [
    { "name": "ESP32 NodeMCU Board", "price": 349 },
    { "name": "0.96 inch I2C OLED Display", "price": 189 }
  ],
  "circuitTip": "Ensure pull-up resistors are configured if not built into module.",
  "timestamp": "2026-10-07T15:00:00.000Z"
}
```
