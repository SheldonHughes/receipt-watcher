import path from "path";
import * as fs from "fs-extra";
import scribe from "scribe.js-ocr";
import { extractDate } from "./dateExtractor.js";
import { detectVendor } from "./vendorDetector.js";
import { RECEIPTS_ROOT, MANUAL_REVIEW_DIR, DEBUG_MODE } from "./config.js";
import { updateLog } from "./logger.js";

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
  // 1. Safety check: Does the file still exist?
  // (Prevents errors if a previous event already moved it)
  if (!(await fs.pathExists(filePath))) return;

  try {
    const results = await scribe.extractText({ pdfFiles: [filePath] });
    const text = Array.isArray(results) ? results[0] : results;

    // --- DEBUG OCR LOGGING ---
    if (DEBUG_MODE && text) {
      const snippet = text.replace(/\n/g, " [NL] ").substring(0, 500);
      await updateLog(`DEBUG OCR (${path.basename(filePath)}): ${snippet}...`);
    }

    if (!text || text.trim().length === 0) {
      await updateLog(
        `EMPTY TEXT: ${path.basename(filePath)} moved to Manual Review.`,
      );
      await moveToTarget(filePath, MANUAL_REVIEW_DIR, path.basename(filePath));
      return;
    }

    const date = extractDate(text);
    const vendor = detectVendor(text);

    let finalFileName = path.basename(filePath);

    if (date) {
      const MM = String(date.getMonth() + 1).padStart(2, "0");
      const DD = String(date.getDate()).padStart(2, "0");
      const YYYY = date.getFullYear();
      const dateString = `${MM}-${DD}-${YYYY}`;
      finalFileName = `${vendor} - ${dateString}.pdf`;
    }
    // If we couldn't find a date but did find a vendor, at least prefix with the vendor
    else if (vendor && vendor !== "Unknown Vendor") {
      finalFileName = `[NO DATE] ${vendor} - ${path.basename(filePath)}`;
    }

    const targetDir = date
      ? path.join(RECEIPTS_ROOT, MONTH_FOLDERS[date.getMonth()])
      : MANUAL_REVIEW_DIR;
    await updateLog(
      `Identified: ${vendor} | Target Folder: ${path.basename(targetDir)}`,
    );
    console.log(
      `🏷️  Identified: ${vendor} | 📁 Target: ${path.basename(targetDir)}`,
    );

    await moveToTarget(filePath, targetDir, finalFileName);
    await updateLog(`SUCCESS: ${vendor} (${finalFileName})`);
  } catch (err) {
    await updateLog(`CRITICAL ERROR: ${err.message}`);
    console.error(`💥 Error during processing:`, err.message);
    // Only try to move to manual review if the file still exists
    if (await fs.pathExists(filePath)) {
      await moveToTarget(filePath, MANUAL_REVIEW_DIR, path.basename(filePath));
    }
  }
}

async function moveToTarget(originalPath, targetDir, newFileName) {
  await fs.ensureDir(targetDir);

  const cleanName = newFileName.replace(/[<>:"/\\|?*]/g, "");
  const ext = path.extname(cleanName);
  const base = path.basename(cleanName, ext);

  let destination = path.join(targetDir, cleanName);
  let counter = 1;

  // 2. COLLISION LOGIC: If file exists, add a suffix instead of failing
  while (await fs.pathExists(destination)) {
    destination = path.join(targetDir, `${base}-${counter}${ext}`);
    counter++;
  }

  try {
    // We use move but since we checked existence above, we are safe
    await fs.move(originalPath, destination);
    const msg = `✅ Saved as: ${path.basename(destination)}`;
    console.log(msg);
    await updateLog(msg);
  } catch (moveErr) {
    if (moveErr.code === "ENOENT") {
      await updateLog(
        `File from ${originalPath} already moved by another process.`,
      );
      console.log("File already moved by another process.");
    } else {
      throw moveErr;
    }
  }
}
