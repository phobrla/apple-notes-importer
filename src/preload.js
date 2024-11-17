// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
  getAccounts: () => ipcRenderer.invoke("get-accounts"),
  createOrCheckFolder: (account, folder) => ipcRenderer.invoke("create-or-check-folder", account, folder),
  processFiles: (files, title, account, folder) => ipcRenderer.invoke("process-files", { files, title, account, folder })
});