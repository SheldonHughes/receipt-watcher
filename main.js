const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs-extra");
const path = require("path");

// Reference to your existing settings logic
const settingsPath = path.join(app.getPath("userData"), "settings.json");

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
