const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lockAPI', {
  getConfig: () => ipcRenderer.invoke('get-lock-config'),
  checkPassword: (attempt) => ipcRenderer.invoke('check-password', attempt),
  unlock: () => ipcRenderer.invoke('unlock-app')
});
