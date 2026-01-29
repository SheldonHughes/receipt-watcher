import { appendFile, readdir, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { LOG_PATH } from "./config.js"; // Add this to your config

export async function updateLog(content) {
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // Result: "2026-01-28"
  const timeString = now.toLocaleTimeString();

  // We create a new file for every day: log-2026-01-28.txt
  const dailyLogPath = path.join(LOG_PATH, `log-${dateString}.txt`);

  try {
    const data = `[${timeString}] ${content}\n`;
    await appendFile(dailyLogPath, data);
  } catch (err) {
    console.error(`Failed to write to log: ${err.message}`);
  }
}

/**
 * Deletes log files older than 14 days
 */
export async function pruneLogs(daysToKeep = 14) {
  try {
    const files = await readdir(LOG_PATH);
    const now = Date.now();
    const expiryMs = daysToKeep * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (file.startsWith("log-") && file.endsWith(".txt")) {
        const filePath = path.join(LOG_PATH, file);
        const fileStat = await stat(filePath);

        if (now - fileStat.mtimeMs > expiryMs) {
          await unlink(filePath);
          console.log(`Cleaned up old log: ${file}`);
        }
      }
    }
  } catch (err) {
    console.error("Error pruning logs:", err.message);
  }
}
