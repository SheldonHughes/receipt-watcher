import path from "path";
import * as fs from "fs-extra";
import { runOCR } from "./ocr.js";
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
  const text = await runOCR(filePath);
  const date = extractDate(text);

  let targetDir;

  if (!date) {
    targetDir = MANUAL_REVIEW_DIR;
  } else {
    const monthFolder = MONTH_FOLDERS[date.getMonth()];
    targetDir = path.join(RECEIPTS_ROOT, monthFolder);
  }

  await fs.ensureDir(targetDir);

  const destination = path.join(targetDir, path.basename(filePath));

  await fs.move(filePath, destination, { overwrite: false });

  console.log(`Moved file to: ${destination}`);
}
