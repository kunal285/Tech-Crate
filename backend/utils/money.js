/**
 * Money Utility — Authoritative Currency & Tax Management
 * Handles standard representations for INR (₹):
 * 1. Decimal Rupees (e.g. ₹349.00) for human display & backward compatibility.
 * 2. Integer Paise (e.g. 34900 paise) for transactional math, precision, and Razorpay.
 */

/**
 * Convert Rupees to integer Paise (₹1 = 100 paise)
 * @param {number|string} rupees
 * @returns {number} Integer paise
 */
function toPaise(rupees) {
  const num = Number(rupees) || 0;
  return Math.round(num * 100);
}

/**
 * Convert Paise to Rupees (100 paise = ₹1.00)
 * @param {number} paise
 * @returns {number} Decimal rupees with 2-digit precision
 */
function toRupees(paise) {
  const num = Number(paise) || 0;
  return Number((num / 100).toFixed(2));
}

/**
 * Format amount as INR display string (e.g. "₹1,299.00")
 * @param {number} rupees
 * @returns {string}
 */
function formatINR(rupees) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(rupees) || 0);
}

/**
 * Server-authoritative calculation for order totals with standard GST breakdown.
 * Electronics/ICs standard: 18% GST (9% CGST + 9% SGST).
 * Free shipping threshold: Orders ₹999 or more get free delivery, otherwise ₹70.
 *
 * @param {Object} options
 * @param {number} options.itemsPrice - In Rupees
 * @param {number} options.discountAmount - In Rupees
 * @param {number} [options.gstRate=0.18] - Standard GST rate (18%)
 * @param {number} [options.freeShippingThreshold=999] - In Rupees
 * @param {number} [options.shippingFee=70] - In Rupees
 * @returns {Object} Authoritative breakdown in both Rupees and Paise
 */
function calculateOrderTotals({
  itemsPrice = 0,
  discountAmount = 0,
  gstRate = 0.18,
  freeShippingThreshold = 999,
  shippingFee = 70,
}) {
  const rawItemsPrice = Math.max(0, Number(itemsPrice) || 0);
  const rawDiscount = Math.max(0, Math.min(rawItemsPrice, Number(discountAmount) || 0));
  const discountedSubtotal = Math.max(0, rawItemsPrice - rawDiscount);

  // Shipping rule
  const shippingPrice =
    discountedSubtotal >= freeShippingThreshold || discountedSubtotal === 0 ? 0 : shippingFee;

  // 18% GST calculation (split into 9% CGST + 9% SGST)
  const taxPrice = Math.round(discountedSubtotal * gstRate);
  const cgstPrice = Math.round(taxPrice / 2);
  const sgstPrice = taxPrice - cgstPrice;

  // Total
  const totalPrice = discountedSubtotal + shippingPrice + taxPrice;

  return {
    itemsPrice: rawItemsPrice,
    discountAmount: rawDiscount,
    discountedSubtotal,
    shippingPrice,
    taxPrice,
    cgstPrice,
    sgstPrice,
    totalPrice,

    // Integer paise representation for zero-rounding-error transactional storage
    itemsPricePaise: toPaise(rawItemsPrice),
    discountAmountPaise: toPaise(rawDiscount),
    shippingPricePaise: toPaise(shippingPrice),
    taxPricePaise: toPaise(taxPrice),
    totalPricePaise: toPaise(totalPrice),
  };
}

module.exports = {
  toPaise,
  toRupees,
  formatINR,
  calculateOrderTotals,
};
