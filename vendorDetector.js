/**
 * Simple keyword-based vendor detection
 */
import vendors from "./settings.json" with { type: "json" };

const VENDOR_MAP = vendors.vendor;

// console.log(VENDOR_MAP);
// {
//   Posigen: ["posigen", "solar solutions"],
//   "Stop & Shop": ["stop n shop", "stop & shop", "stop&shop"],
//   Entergy: ["entergy", "electric service"],
//   Amazon: ["amazon.com", "amzn mktp"],
//   Shell: ["shell oil", "v-power"],
//   "Brotherhood Auto Aid": ["brotherhood auto aid", "baa"],
//   "J R Parkerson": ["j r parkerson iii", "parkerson"],
//   "Leland Auto Parts": ["leland auto parts", "bumper to bumper", "leland auto"],
//   "Double Quick": ["double quick", "doublequick"],
//   "Zoe Coffee Co.": ["Zoe Coffee company", "zoe coffee", "z0e coffee"],
// };

export function detectVendor(text) {
  const normalizedText = text.toLowerCase();

  for (const [vendor, keywords] of Object.entries(VENDOR_MAP)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return vendor;
    }
  }

  return "Unknown Vendor";
}
