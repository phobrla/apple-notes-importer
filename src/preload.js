// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    importNote: (content, title, account, folder) => ipcRenderer.invoke('import-note', { content, title, account, folder }),
    convertMarkdown: (markdownContent) => ipcRenderer.invoke('convert-markdown', markdownContent),
    getAccounts: () => ipcRenderer.invoke('get-accounts'),
    createOrCheckFolder: (account, folder) => ipcRenderer.invoke('create-or-check-folder', account, folder)
  });