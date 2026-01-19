//This file watches the inbox directory for new files and processes them accordingly. It uses chokidar to monitor the directory and triggers the file processing logic when a new file is added. It should only act as a watcher and delegate the actual processing to the fileRouter module.

import chokidar from "chokidar";
import { processFile } from "./fileRouter.js";
import { INBOX_DIR } from "./config.js";

console.log("Watching inbox:", INBOX_DIR);

const watcher = chokidar.watch(INBOX_DIR, {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 3000,
    pollInterval: 500,
  },
});

watcher.on("add", async (filePath) => {
  console.log("New file detected:", filePath);
  try {
    await processFile(filePath);
  } catch (err) {
    console.error("Processing failed:", err);
  }
});
