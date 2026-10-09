# Tech Crate — Unified API Contracts Specification

This document defines the formal request and response contracts for the **Tech Crate REST API**, shared across the Customer Website (`/website`), Mobile Application (`/mobile`), and Admin Panel (`/admin`).

All endpoints are rooted under `/api`.

---

## 1. Authentication & User Endpoints (`/api/auth`)

### POST `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Maker",
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "phone": "+919876543210",
    "college": "MIT Pune",
    "branch": "Electronics & Telecommunication"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "_id": "65f1c...",
      "name": "Jane Maker",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```

### POST `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "_id": "65f1c...",
      "name": "Jane Maker",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```

---

## 2. Product Endpoints (`/api/products`)

### GET `/api/products`
- **Access**: Public
- **Query Parameters**:
  - `keyword` *(optional)*: Full-text search string for title, description, and SKU.
  - `category` *(optional)*: Filter by category (e.g. `Microcontrollers`, `Sensors`).
  - `page` *(optional, integer)*: Page index (default: 1).
  - `limit` *(optional, integer)*: Items per page (default: 20).
  - `includeArchived` *(optional, boolean, admin only)*: Include soft-deleted/archived items.
- **Response `200 OK` (when paginated)**:
  ```json
  {
    "products": [
      {
        "_id": "65f1c0010000000000000001",
        "title": "ESP32 Wi-Fi & Bluetooth Dual-Core Development Board",
        "description": "High performance ESP-WROOM-32 board...",
        "price": 349,
        "originalPrice": 499,
        "discountedPrice": 349,
        "discountPercentage": 30,
        "category": "Microcontrollers",
        "stock": 42,
        "images": [
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
        ],
        "specifications": {
          "operatingVoltage": "3.3V - 5V DC",
          "pinCount": "30 Pins",
          "interface": "SPI / I2C / UART / PWM"
        },
        "features": [
          "Dual-Core Tensilica LX6 240 MHz",
          "Integrated 802.11 b/g/n Wi-Fi"
        ],
        "sku": "TC-ESP32-DEV",
        "isArchived": false,
        "rating": 4.8,
        "reviewCount": 38
      }
    ],
    "page": 1,
    "pages": 1,
    "total": 1
  }
  ```

### GET `/api/products/:id`
- **Access**: Public
- **Response `200 OK`**: Single product object.

### POST `/api/products`
- **Access**: Protected (`admin`, `seller`)
- **Request Body**:
  ```json
  {
    "title": "Raspberry Pi Pico H",
    "description": "Microcontroller board powered by RP2040 chip with pre-soldered headers.",
    "price": 440,
    "originalPrice": 520,
    "category": "Microcontrollers",
    "stock": 25,
    "sku": "TC-RPI-PICOH",
    "images": [
      "https://res.cloudinary.com/dmy7cmuq9/image/upload/v1/TechCrate/products/picoh.webp"
    ],
    "specifications": {
      "operatingVoltage": "1.8V - 5.5V DC",
      "pinCount": "40 Pins",
      "interface": "I2C, SPI, UART"
    },
    "features": [
      "Dual-core Arm Cortex-M0+ processor",
      "264kB of SRAM, and 2MB of on-board Flash memory"
    ]
  }
  ```
- **Response `201 Created`**: The created product object.

### PUT `/api/products/:id`
- **Access**: Protected (`admin`, `seller` owner)
- **Request Body**: Partial product update fields.
- **Response `200 OK`**: Updated product object.

### DELETE `/api/products/:id`
- **Access**: Protected (`admin`, `seller` owner)
- **Query Parameter**: `permanent=true` *(optional)*. Defaults to safe soft-delete/archival (`isArchived: true`) to preserve historical order records and references.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Product archived successfully",
    "isArchived": true
  }
  ```

---

## 3. Image Upload Endpoints (`/api/upload`)

### POST `/api/upload/image`
- **Access**: Protected
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**:
  - `image`: Binary file (JPEG, PNG, WEBP, GIF, max 5MB)
  - `folder`: Destination category folder (`products`, `banners`, `avatars`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "url": "https://res.cloudinary.com/dmy7cmuq9/image/upload/v1/TechCrate/products/...",
    "public_id": "TechCrate/products/...",
    "width": 800,
    "height": 800,
    "format": "webp"
  }
  ```

---

## 4. Cart & Order Endpoints (`/api/orders`, `/api/cart`)

### POST `/api/orders`
- **Access**: Protected (`customer`)
- **Request Body**:
  ```json
  {
    "orderItems": [
      {
        "product": "65f1c0010000000000000001",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "fullName": "Kunal Gavit",
      "phone": "9876543210",
      "street": "Plot 42, Maker Street",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411001",
      "country": "India"
    },
    "paymentMethod": "UPI",
    "couponCode": "TECH10"
  }
  ```
- **Server-Side Enforcement**:
  - The server recalculates and validates product prices directly from MongoDB (client-submitted prices are overridden).
  - Stock availability is verified and reserved atomically.
- **Response `201 Created`**:
  ```json
  {
    "_id": "66a01...",
    "orderItems": [...],
    "itemsPrice": 698,
    "discountAmount": 69.8,
    "shippingPrice": 40,
    "totalPrice": 668.2,
    "orderStatus": "Pending",
    "paymentStatus": "Pending"
  }
  ```

---

## 5. Admin Management Endpoints (`/api/admin`)

- `GET /api/admin/stats` — Platform sales, active orders, user counts, inventory status.
- `GET /api/admin/orders` — Complete order list with filter by status.
- `PUT /api/orders/:id/status` — Update order fulfillment state (`Processing`, `Shipped`, `Delivered`, `Cancelled`).
- `GET /api/admin/users` — Registered customer and seller list.
- `GET /api/admin/categories` & `POST /api/admin/categories` — Categories management.
