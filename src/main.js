// import { app, BrowserWindow, ipcMain, dialog } from "electron";
import pkg from "electron";
const { app, BrowserWindow, ipcMain, dialog } = pkg;
import fs from "fs-extra";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(__dirname);

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
  const startPathURL = pathToFileURL(
    path.join(__dirname, "ui/index.html"),
  ).href;
  // console.log("Loading FilePath:", startPathURL);

  win.loadURL(startPathURL);
}

app.whenReady().then(() => {
  createWindow();
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
