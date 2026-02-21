import { app, BrowserWindow, ipcMain, dialog } from "electron";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Reference to your existing settings logic
const settingsPath = path.join(app.getPath("userData"), "settings.json");

function createWindow() {
  const win = new BrowserWindow({
    title: "Receipt Watcher",
    width: 800,
    height: 600,
  });
  const startPathURL = path.join(__dirname, "index.html");

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
