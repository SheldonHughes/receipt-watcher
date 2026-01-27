import path from "path";
import * as fs from "fs-extra";
import scribe from "scribe.js-ocr"; // New Scribe import
import { extractDate } from "./dateExtractor.js";
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
  console.log(`🔍 Processing: ${path.basename(filePath)}`);

  try {
    // 1. Perform OCR/Text Extraction using Scribe
    // Scribe returns an array of strings (one per file provided)
    const [text] = await scribe.extractText([filePath]);

    if (!text || text.trim().length === 0) {
      console.warn(`⚠️ No text found in ${filePath}. Moving to Manual Review.`);
      await moveToTarget(filePath, MANUAL_REVIEW_DIR);
      return;
    }

    // 2. Extract Date from the OCR text
    const date = extractDate(text);
    let targetDir;

    if (!date) {
      console.log("📅 No date detected. Routing to Manual Review.");
      targetDir = MANUAL_REVIEW_DIR;
    } else {
      const monthFolder = MONTH_FOLDERS[date.getMonth()];
      targetDir = path.join(RECEIPTS_ROOT, monthFolder);
      console.log(
        `📅 Date detected: ${date.toDateString()}. Routing to ${monthFolder}.`,
      );
    }

    // 3. Move the file
    await moveToTarget(filePath, targetDir);
  } catch (err) {
    console.error(`❌ Critical error processing ${filePath}:`, err.message);
    // Move to manual review on error to prevent the file from getting stuck in Inbox
    await moveToTarget(filePath, MANUAL_REVIEW_DIR);
  }
}

/**
 * Helper to handle directory assurance and moving
 */
async function moveToTarget(filePath, targetDir) {
  try {
    await fs.ensureDir(targetDir);
    const destination = path.join(targetDir, path.basename(filePath));

    // overwrite: false prevents accidentally deleting a file with the same name
    await fs.move(filePath, destination, { overwrite: false });
    console.log(`✅ Successfully moved to: ${destination}`);
  } catch (moveErr) {
    console.error(`📂 File Move Error: ${moveErr.message}`);
  }
}
