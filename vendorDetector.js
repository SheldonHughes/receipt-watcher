import { VENDOR_DATA } from "./config.js";

export function detectVendor(text) {
  if (!text) return "Unknown Vendor";

  const lowerText = text.toLowerCase();

  // Object.entries turns the JSON object into an array we can loop through
  for (const [vendorName, keywords] of Object.entries(VENDOR_DATA)) {
    // Check each keyword associated with that vendor
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return vendorName;
      }
    }
  }

  return "Unknown Vendor";
}
