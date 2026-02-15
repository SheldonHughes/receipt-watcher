import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// This ensures the service finds the settings file regardless of where it's launched from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsPath = path.join(__dirname, "settings.json");

// Read the settings
const settings = fs.readJsonSync(settingsPath);

export const INBOX_DIR = settings.paths.inbox;
export const RECEIPTS_ROOT = settings.paths.receiptsRoot;
export const MANUAL_REVIEW_DIR = settings.paths.manualReview;
export const LOG_PATH = settings.paths.logs;

// These were tucked inside the 'paths' object in your JSON
export const LOG_DAYS_TO_KEEP = settings.paths.logDaysToKeep || 14;
export const DEBUG_MODE = settings.paths.debugMode || false;

// Export the vendor object directly
export const VENDOR_DATA = settings.vendor;
