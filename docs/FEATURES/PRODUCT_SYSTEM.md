# Product Management System Feature Specification

This document details the architecture, catalog structure, 4-slot image gallery system, and pricing calculations of the **Product Management System**.

---

## 📸 4-Slot Dedicated Image Gallery Architecture

Every product in Tech Crate contains 4 dedicated image slots designed for technical hardware clarity:

1. **Cover Image (`cover`)**: Main hero display on search results, category pages, and product cards.
2. **Angle View (`angle`)**: Alternative perspective or component dimensions.
3. **Schematic View (`schematic`)**: Pinout diagram, circuit connection diagram, or technical datasheet view.
4. **Packaging View (`packaging`)**: Physical product packaging or in-hand scale image.

```javascript
images: {
  cover: "https://res.cloudinary.com/.../cover.jpg",
  angle: "https://res.cloudinary.com/.../angle.jpg",
  schematic: "https://res.cloudinary.com/.../pinout.jpg",
  packaging: "https://res.cloudinary.com/.../box.jpg"
}
```

---

## 💰 Discount Pricing Engine

Prices are dynamically calculated in the backend and displayed on mobile product cards:
- **`originalPrice`**: Base List MRP.
- **`discountedPrice`**: Selling Price.
- **`price`**: Effective checkout price.
- **Discount Badge Calculation**:
  $$\text{Discount \%} = \left\lfloor \frac{\text{originalPrice} - \text{price}}{\text{originalPrice}} \times 100 \right\rfloor$$

---

## 📱 Mobile Product Detail Component (`ProductDetailScreen.js`)

- **Interactive Gallery Switcher**: Tapping any of the 4 thumbnail images updates the hero preview image instantly.
- **Feature Bullet Points**: Technical specifications array (`features`) rendered with checkmark indicators.
- **Stock Status**: Live inventory indicator (`In Stock` vs `Out of Stock`).
