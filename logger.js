import { appendFile } from "node:fs/promises";

const content = "Some content!";
const content2 = "More content...";
const timeStamp = new Date(Date.now()).toString();
const logPath = "C:/Users/sheld/receipt-watcher/log.txt";

//Use for testing on work computer
// const logPath = "C:/Users/sheld/receipt-watcher/log.txt";

// console.log("Content:", content);
// console.log("Log path:", logPath);
console.log("Log path length:", logPath.length);
console.log(timeStamp);

async function updateLog(logPath, content, timeStamp) {
  try {
    if (!logPath) {
      throw new Error("No log path found. Please check the logpath string.");
    }

    const data = `\n${content} ${timeStamp}`;
    console.log(data);
    await appendFile(logPath, data);
    console.log(`${timeStamp} File appended successfully.`);
  } catch (err) {
    console.error(`${timeStamp} Failed to write to log.`);
    console.error(err.message);
  }
}

updateLog(logPath, content2, timeStamp);
