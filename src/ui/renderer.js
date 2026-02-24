// Function to switch between Dashboard, Vendors, and Settings views
function showView(viewId) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");

  if (viewId === "vendors") loadVendors();
  if (viewId === "settings") loadSettings();
}

// Populate the Vendor Manager table from settings.json
async function loadVendors() {
  const settings = await window.api.getSettings();
  const tbody = document.getElementById("vendor-list-body");
  tbody.innerHTML = "";

  // Loop through the vendor object: key is name, value is keyword array
  for (const [name, keywords] of Object.entries(settings.vendor)) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td><strong>${name}</strong></td>
            <td>${keywords.map((kw) => `<span class="pill">${kw}</span>`).join(" ")}</td>
            <td>
                <button onclick="editVendor('${name}')">Edit</button>
            </td>
        `;
    tbody.appendChild(row);
  }
}

// Load current paths into the Settings view
async function loadSettings() {
  const settings = await window.api.getSettings();
  document.getElementById("inbox-path").value = settings.paths.inbox;
  document.getElementById("receipts-root").value = settings.paths.receiptsRoot;
}

// Trigger the folder picker via Main process
async function browseFolder(type) {
  const path = await window.api.selectDirectory();
  if (path) {
    const fieldId = type === "inbox" ? "inbox-path" : "receipts-root";
    document.getElementById(fieldId).value = path;

    // Auto-save the new path back to settings.json
    const settings = await window.api.getSettings();
    if (type === "inbox") settings.paths.inbox = path;
    else settings.paths.receiptsRoot = path;
    await window.api.saveSettings(settings);
  }
}
