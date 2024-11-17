const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { execFile } = require("child_process");
const path = require("node:path");
const JSZip = require("jszip");
const showdown = require("showdown");

const converter = new showdown.Converter();

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
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

async function processFileContent(content, filename, title, account, folder) {
  const format = filename.split(".").pop().toLowerCase();
  let parsedContent = "";

  if (format === "md") {
    parsedContent = converter.makeHtml(content);
  } else if (format === "html") {
    parsedContent = content;
  } else if (format === "txt") {
    parsedContent = `<pre>${sanitizeHTML(content)}</pre>`;
  } else {
    console.warn("Unsupported file format for " + filename);
    return;
  }

  const script = `
    tell application "Notes"
      set theAccount to account "${account}"
      set theFolder to folder "${folder}" of theAccount
      make new note at theFolder with properties {name: "${title}", body: "${sanitizeHTML(parsedContent)}"}
    end tell
  `;
  return await runAppleScript(script);
}

ipcMain.handle("process-files", async (_, { files, title, account, folder }) => {
  const textDecoder = new TextDecoder("utf-8");
  const results = [];

  for (const file of files) {
    const { name, data, isZip } = file;

    if (isZip) {
      const zip = await JSZip.loadAsync(data);
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir) {
          const content = await zipEntry.async("text");
          const result = await processFileContent(content, filename, title, account, folder);
          results.push(result);
        }
      }
    } else {
      const content = textDecoder.decode(data); // Convert ArrayBuffer to string
      const result = await processFileContent(content, name, title, account, folder);
      results.push(result);
    }
  }

  return results.every(result => result !== undefined);
});


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Only that start with https://*.readwise.io will be allowed
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

let tray

app.whenReady().then(() => {
  // const icon = nativeImage.createFromPath("icon.png").resize({
  //   width: 16,
  //   height: 16,
  // });
  // if (icon.isEmpty()) {
  //   console.error("Failed to load icon");
  // } else {
  //   console.log("Icon loaded successfully");
  //   tray = new Tray(icon);
  // }

  // const contextMenu = Menu.buildFromTemplate([
  //   { label: "Item1", type: "radio" },
  //   { label: "Item2", type: "radio" },
  //   { label: "Item3", type: "radio", checked: true },
  //   { label: "Item4", type: "radio" },
  // ]);

  // tray.setToolTip("This is my application.");
  // tray.setContextMenu(contextMenu);

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

  // Create a new window
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
