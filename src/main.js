const { app, BrowserWindow, ipcMain } = require("electron");
const { execFile } = require("child_process");
const path = require("node:path");
const showdown = require("showdown");

const converter = new showdown.Converter();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// Function to run AppleScript
function runAppleScript(script) {
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-e", script], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function sanitizeHTML(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, "\\n"); // Escape newlines
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('import-note', async (_, { content, title, account, folder }) => {
    const sanitizedContent = sanitizeHTML(content);
    const script = `
      tell application "Notes"
        set theAccount to account "${account}"
        set theFolder to folder "${folder}" of theAccount
        make new note at theFolder with properties {name: "${title}", body: "${sanitizedContent}"}
      end tell
    `;
    return await runAppleScript(script);
  });

  ipcMain.handle('get-accounts', async () => {
    const script = `
      tell application "Notes"
        set accountNames to {}
        repeat with anAccount in accounts
            set end of accountNames to name of anAccount
        end repeat
        return accountNames
      end tell
    `;
    const result = await runAppleScript(script);
    return result.split(', ');
  });

  ipcMain.handle('create-or-check-folder', async (_, account, folder) => {
    const script = `
      tell application "Notes"
        try
          set theAccount to account "${account}"
          set theFolder to folder "${folder}" of theAccount
          return true -- Folder exists
        on error
          make new folder at theAccount with properties {name: "${folder}"}
          return true -- Folder created
        end try
      end tell
    `;
    return await runAppleScript(script) === 'true';
  });

  ipcMain.handle("convert-markdown", (_, markdownContent) => {
    return converter.makeHtml(markdownContent);
  });

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
