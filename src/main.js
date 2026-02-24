// import { app, BrowserWindow, ipcMain, dialog } from "electron";
import pkg from "electron";
const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = pkg;
import fs from "fs-extra";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Add a global flag to track if we are truly quitting or just hiding
let isQuitting = false;
let tray = null;
let win = null;
// console.log(__dirname);

// Reference to your existing settings logic
const settingsPath = path.join(__dirname, "settings.json");

function createWindow() {
  const win = new BrowserWindow({
    title: "Receipt Watcher",
    width: 1000,
    height: 800,
    webPreferences: {
      // Point to the preload file
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 1. Add a global flag to track if we are truly quitting or just hiding
  const startPathURL = pathToFileURL(
    path.join(__dirname, "ui/index.html"),
  ).href;
  // console.log("Loading FilePath:", startPathURL);

  win.loadURL(startPathURL);
}

// CREATE SYSTEM TRAY
function createTray() {
  // You'll need a small .ico or .png file in your src folder for the icon
  const iconPath = path.join(__dirname, "src/icons/search.png");
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => win.show() },
    { type: "separator" },
    {
      label: "Shut Down Entirely",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Receipt Watcher Service");
  tray.setContextMenu(contextMenu);

  // Double click tray icon to show window
  tray.on("double-click", () => win.show());
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on("shutdown-app", () => {
  isQuitting = true;
  app.quit();
});

ipcMain.handle("select-directory", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle("get-settings", async () => {
  return await fs.readJson(settingsPath).catch(() => ({}));
});

ipcMain.handle("save-settings", async (event, newSettings) => {
  await fs.writeJson(settingsPath, newSettings, { spaces: 2 });
  return { success: true };
});
