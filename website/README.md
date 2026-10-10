# Tech Crate — Customer Storefront (Website)

> **Modern Customer Web Storefront & Maker Hub**  
> Built with Next.js 16 (App Router), React 18, Tailwind CSS, and Lucide Icons.

---

## 1. Overview & Key Capabilities

The Tech Crate website is a high-performance e-commerce storefront tailored specifically for electronics makers, students, hobbyists, and engineers across India.

### Core Features
* **Modern App Router Architecture**: Fast server and client components utilizing Next.js App Router.
* **Product Catalog & Advanced Discovery**: Search by keyword, filter by categories (Microcontrollers, Sensors, DIY Kits, 3D Printing), price range, and in-stock availability.
* **Product Details (`/products/[id]`)**:
  * Real-time 6-digit Indian PIN code delivery estimator.
  * SKU code and stock status indicators.
  * Verified customer reviews with rating stars.
  * JSON-LD Structured Data Schema (`schema.org/Product`) for enhanced Google Rich Snippets.
* **Indian Checkout Flow (`/checkout`)**:
  * Indian state dropdown, district/city, and PIN code validation.
  * Payment options: Razorpay (Cards, UPI, NetBanking, RuPay) and Cash on Delivery (COD).
  * Transparent GST and shipping breakdown.
* **Order Tracking & GST Tax Invoice (`/orders/[id]`)**:
  * Printable/Downloadable Tax Invoice with HSN codes (e.g. HSN 8542), GSTIN, CGST (9%) + SGST (9%).
  * Visual courier tracking timeline: `Placed` ➔ `Confirmed` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`.
  * 7-day hassle-free replacement claim modal for damaged or defective components.
* **Statutory Compliance**: Full suite of legal and policy pages adhering to India's Consumer Protection (E-Commerce) Rules 2020.
* **Dynamic SEO Engine**: Auto-generated dynamic `sitemap.xml` (`/sitemap.js`) and `robots.txt` (`/robots.js`).

---

## 2. Directory Structure

```
website/
├── public/                 # Static assets, logos, and payment gateway badges
├── src/
│   ├── app/                # Next.js App Router pages & layouts
│   │   ├── layout.js       # Root layout with Navbar, Cart Drawer, and Footer
│   │   ├── page.js         # Homepage (Hero, Categories, Best Sellers, Features)
│   │   ├── sitemap.js      # Dynamic SEO sitemap generator
│   │   ├── robots.js       # Dynamic search engine crawler rules
│   │   ├── products/
│   │   │   ├── page.js     # Catalog search & filter page
│   │   │   └── [id]/page.js # Product detail view with PIN estimator & reviews
│   │   ├── cart/page.js    # Full shopping cart review
│   │   ├── checkout/page.js # Indian address form & payment selection
│   │   ├── orders/
│   │   │   ├── page.js     # User order history
│   │   │   └── [id]/page.js # Order details, courier tracking, & GST invoice
│   │   ├── contact/page.js # Customer support & enquiry form
│   │   └── policies/       # India statutory compliance pages
│   │       ├── shipping/page.js
│   │       ├── returns/page.js
│   │       ├── cancellation/page.js
│   │       ├── warranty/page.js
│   │       ├── grievance/page.js
│   │       ├── privacy/page.js
│   │       └── terms/page.js
│   ├── components/         # Reusable UI components (Navbar, Footer, CartDrawer, etc.)
│   ├── context/            # React Context providers (AuthContext, CartContext)
│   └── lib/                # API client helpers & utility functions
├── tailwind.config.js      # Tailwind CSS theme configuration
└── package.json            # Dependencies & scripts
```

---

## 3. Statutory & Compliance Pages (India Rules 2020)

To comply with Indian e-commerce regulations, the storefront provides transparent policy routes:

* [`/policies/shipping`](file:///website/src/app/policies/shipping/page.js) — Delivery timelines (3–7 business days via BlueDart/Delhivery/India Post), tracking links, and shipping rates.
* [`/policies/returns`](file:///website/src/app/policies/returns/page.js) — 7-day replacement policy on defective components, technical testing requirements, and return eligibility criteria.
* [`/policies/cancellation`](file:///website/src/app/policies/cancellation/page.js) — Pre-dispatch cancellation rules and instant refund SLA.
* [`/policies/warranty`](file:///website/src/app/policies/warranty/page.js) — Manufacturer warranty coverage for development boards, sensors, and equipment.
* [`/policies/grievance`](file:///website/src/app/policies/grievance/page.js) — Appointed Grievance Redressal Officer contact details, escalation matrix, and regulatory response timelines.
* [`/policies/privacy`](file:///website/src/app/policies/privacy/page.js) — Digital Personal Data Protection (DPDP) Act compliant data handling.
* [`/policies/terms`](file:///website/src/app/policies/terms/page.js) — Terms of service, jurisdiction, and purchase conditions.

---

## 4. Environment Variables Configuration

Create a `.env.local` file in `website/`:

```env
# Backend API URL (Points to the Node.js/Express server)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Razorpay Client-Side Key ID (Safe to expose in browser)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere

# Website Canonical Host (Used for SEO and OpenGraph generation)
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

---

## 5. Development & Production Commands

```bash
# Install dependencies
npm install

# Start Next.js development server on port 3001
npm run dev

# Build production bundle and validate all static/dynamic routes
npm run build

# Start production server on port 3001
npm start
```

---

## 6. Integration with Payment Gateway

* When user selects **Razorpay**, the website requests an authenticated `order_id` from the backend `/api/v1/payment/razorpay/order`.
* Loads the Razorpay checkout script (`checkout.razorpay.com/v1/checkout.js`) and opens the payment popup supporting UPI QR, PhonePe, GPay, RuPay/Visa/MasterCard, and NetBanking.
* Upon payment completion, posts `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to `/api/v1/payment/razorpay/verify` for cryptographic verification.
