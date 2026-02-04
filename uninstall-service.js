import { Service } from "node-windows";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a new service object - must match the settings in install-service.js exactly
const svc = new Service({
  name: "Receipt Watcher OCR",
  description: "OCR and organizes OneDrive scans automatically.",
  script: path.join(__dirname, "index.js"),
});

// Listen for the "uninstall" event
svc.on("uninstall", function () {
  console.log("Uninstall complete.");
  console.log("The service exists: ", svc.exists);
});

// Handle cases where it might already be gone
svc.on("alreadyuninstalled", function () {
  console.log("This service was already uninstalled.");
});

// Trigger the uninstallation
console.log("Attempting to uninstall 'Receipt Watcher OCR'...");
svc.uninstall();
