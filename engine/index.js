//This file watches the inbox directory for new files and processes them accordingly. It uses chokidar to monitor the directory and triggers the file processing logic when a new file is added. It should only act as a watcher and delegate the actual processing to the fileRouter module.

import path from "path";
import { updateLog, pruneLogs } from "./logger.js";
import chokidar from "chokidar";
import { processFile } from "./fileRouter.js";
import { INBOX_DIR } from "./config.js";

console.log("Watching inbox:", INBOX_DIR);
updateLog("---Application started---");

// Clean up old logs (older than 14 days) on startup
pruneLogs(10);

// --- QUEUE LOGIC ---
const fileQueue = [];
let isProcessing = false;
const processingSet = new Set(); // To prevent "echo" triggers

async function workQueue() {
  if (isProcessing || fileQueue.length === 0) return;

  isProcessing = true;
  const nextFile = fileQueue.shift();

  try {
    await processFile(nextFile);
  } catch (err) {
    console.error(`Queue error while processing: ${err.message}`);
    await updateLog(`ERROR: Queue processing failed - ${err.message}`);
  } finally {
    isProcessing = false;
    // Small delay before next file to let CPU/OneDrive breathe
    setTimeout(workQueue, 500);
  }
}

// --- THE SINGLE HANDLEFILE FUNCTION ---
const handleFile = async (filePath, type) => {
  const fileName = path.basename(filePath);

  // 1. Ignore if already in the queue or recently processed (the 5s cooldown)
  if (processingSet.has(filePath) || fileQueue.includes(filePath)) return;

  // 2. Add to cooldown set
  processingSet.add(filePath);

  console.log(`+ ${type} detected: ${fileName}`);
  await updateLog(`${type} detected: ${fileName}`);

  // 3. Push to queue and trigger worker
  fileQueue.push(filePath);
  workQueue();

  // 4. Clean up the cooldown set after 5 seconds
  setTimeout(() => processingSet.delete(filePath), 5000);
};

// --- WATCHER SETUP ---
const watcher = chokidar.watch(INBOX_DIR, {
  ignoreInitial: true,
  persistent: true,
  usePolling: true,
  interval: 500,
  binaryInterval: 1000,
  awaitWriteFinish: {
    stabilityThreshold: 3000,
    pollInterval: 500,
  },
  ignored: [/(^|[\/\\])\../, /\.tmp$/, /~\$/, "**/desktop.ini", "**/Thumbs.db"],
});

watcher
  .on("add", (path) => handleFile(path, "New file"))
  .on("change", (path) => handleFile(path, "Updated file"))
  .on("error", (error) => console.error(`Watcher error: ${error}`))
  .on("ready", () => console.log("Initial scan complete. Ready for changes."));
