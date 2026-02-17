import { Service } from "node-windows";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a new service object
const svc = new Service({
  name: "Receipt Watcher OCR",
  description: "OCR and organizes OneDrive scans automatically.",
  script: path.join(__dirname, "index.js"), // Points to your main entry file
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on("install", function () {
  console.log("Installation complete! Starting service...");
  svc.start();
});

svc.install();
