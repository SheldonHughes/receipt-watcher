/**
 * Simple keyword-based vendor detection
 */
const VENDOR_MAP = {
  Posigen: ["posigen", "solar solutions"],
  "Stop & Shop": ["stop n shop", "stop & shop", "stop&shop"],
  Entergy: ["entergy", "electric service"],
  Amazon: ["amazon.com", "amzn mktp"],
  Shell: ["shell oil", "v-power"],
};

export function detectVendor(text) {
  const normalizedText = text.toLowerCase();

  for (const [vendor, keywords] of Object.entries(VENDOR_MAP)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return vendor;
    }
  }

  return "Unknown Vendor";
}
