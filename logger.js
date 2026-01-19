const fs = require("node:fs");

const content = "Some content!";

try {
  fs.writeFileSync("C:\Users\sheld\receipt-watcher\log.txt", content);
  // file written successfully
} catch (err) {
  console.error(err);
}
