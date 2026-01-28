import path from "path";
import * as fs from "fs-extra";
import scribe from "scribe.js-ocr";
import { extractDate } from "./dateExtractor.js";
import { detectVendor } from "./vendorDetector.js"; // Import the new tool
import { RECEIPTS_ROOT, MANUAL_REVIEW_DIR } from "./config.js";

const MONTH_FOLDERS = [
  "01 January",
  "02 February",
  "03 March",
  "04 April",
  "05 May",
  "06 June",
  "07 July",
  "08 August",
  "09 September",
  "10 October",
  "11 November",
  "12 December",
];

export async function processFile(filePath) {
  try {
    const results = await scribe.extractText({ pdfFiles: [filePath] });
    const text = Array.isArray(results) ? results[0] : results;

    if (!text || text.trim().length === 0) {
      await moveToTarget(filePath, MANUAL_REVIEW_DIR, path.basename(filePath));
      return;
    }

    const date = extractDate(text);
    const vendor = detectVendor(text);

    // 1. Determine New Filename
    let finalFileName = path.basename(filePath); // Default to original

    if (date) {
      const MM = String(date.getMonth() + 1).padStart(2, "0");
      const DD = String(date.getDate()).padStart(2, "0");
      const YYYY = date.getFullYear();

      const dateString = `${MM}-${DD}-${YYYY}`; // Result: "08-22-2025"
      finalFileName = `${dateString} - ${vendor}.pdf`;
    }

    // 2. Determine Folder
    const targetDir = date
      ? path.join(RECEIPTS_ROOT, MONTH_FOLDERS[date.getMonth()])
      : MANUAL_REVIEW_DIR;

    console.log(
      `🏷️  Identified: ${vendor} | 📁 Target: ${path.basename(targetDir)}`,
    );

    await moveToTarget(filePath, targetDir, finalFileName);
  } catch (err) {
    console.error(`💥 Error:`, err.message);
    await moveToTarget(filePath, MANUAL_REVIEW_DIR, path.basename(filePath));
  }
}

async function moveToTarget(originalPath, targetDir, newFileName) {
  await fs.ensureDir(targetDir);

  // Clean up filename (remove characters Windows doesn't like)
  const safeName = newFileName.replace(/[<>:"/\\|?*]/g, "");
  const destination = path.join(targetDir, safeName);

  await fs.move(originalPath, destination, { overwrite: false });
  console.log(`✅ Saved as: ${safeName} and moved to ${targetDir}`);
}
