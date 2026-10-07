# Promotional Poster & Banner Carousel Feature Specification

This document details the admin-managed promotional poster system and auto-sliding mobile carousel.

---

## 🎨 Overview

The Promotional Poster system allows administrators to control mobile homepage hero banners dynamically without requiring mobile app updates.

---

## 🛠️ Data Model (`models/Poster.js`)

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `title` | String | Main headline text rendered over banner. |
| `subtitle` | String | Supporting promotional description text. |
| `imageUrl` | String | CDN image URL for high-resolution banner background. |
| `ctaText` | String | Label for Call-To-Action button (e.g., "Shop Now"). |
| `ctaLink` | String | Deep-link target route (e.g., `/category/iot` or `/products/651f...`). |
| `badge` | String | Promotional badge overlay (e.g., `HOT DEAL`, `LIMITED TIME`). |
| `isActive` | Boolean | Visibility toggle flag. |
| `order` | Number | Sort weight for carousel ordering. |

---

## 📱 Mobile Component (`PosterCarousel.js`)

- **Auto-Sliding Engine**: Timer-based horizontal auto-scroll (5-second intervals).
- **Pagination Indicators**: Dynamic dot indicators reflecting active slide index.
- **Deep Link Navigation**: Tapping CTA button decodes `ctaLink` and navigates to the target screen.
