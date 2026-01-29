//This file watches the inbox directory for new files and processes them accordingly. It uses chokidar to monitor the directory and triggers the file processing logic when a new file is added. It should only act as a watcher and delegate the actual processing to the fileRouter module.

import path from "path";
import { updateLog, pruneLogs } from "./logger.js";
import chokidar from "chokidar";
import { processFile } from "./fileRouter.js";
import { INBOX_DIR } from "./config.js";

console.log("Watching inbox:", INBOX_DIR);
updateLog("---Application started---");

// Clean up old logs (older than 14 days) on startup
pruneLogs(14);

const watcher = chokidar.watch(INBOX_DIR, {
  ignoreInitial: true,
  persistent: true,
  // This tells Node to manually check files rather than waiting for OS signals
  usePolling: true,
  interval: 500, // Check every 0.5 seconds
  binaryInterval: 1000, // Check binaries every 1 second
  awaitWriteFinish: {
    stabilityThreshold: 3000,
    pollInterval: 500,
  },
  // 2. Ignore OneDrive's hidden meta-files and temp files
  // These often trigger "change" events that you don't want to process
  ignored: [
    /(^|[\/\\])\../, // Ignore hidden files (starting with dot)
    /\.tmp$/, // Ignore temporary files
    /~\$/, // Ignore Office lock files
    "**/desktop.ini", // Ignore Windows folder config
    "**/Thumbs.db", // Ignore thumbnail caches
  ],
});

// Track files currently being processed
const processing = new Set();

const handleFile = async (filePath, type) => {
  if (processing.has(filePath)) return; // Skip if already working on it

  processing.add(filePath);
  console.log(`${type} detected: ${filePath}`);
  await updateLog(`${type} detected: ${path.basename(filePath)}`);

  try {
    await processFile(filePath);
  } catch (err) {
    await updateLog(
      `ERROR: Processing failed for ${filePath} - ${err.message}`,
    );
    console.error(`🤦‍♂️ Error: ${err.message}`);
  } finally {
    // Remove from the set after a delay to account for OneDrive "echo" events
    setTimeout(() => processing.delete(filePath), 5000);
  }
};

// Listen for both new files and updated files
watcher
  .on("add", (path) => handleFile(path, "New file"))
  .on("change", (path) => handleFile(path, "Updated file"))
  .on("error", (error) => console.error(`Watcher error: ${error}`))
  .on("ready", () => console.log("Initial scan complete. Ready for changes."));
