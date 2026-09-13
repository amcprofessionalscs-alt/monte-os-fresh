const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer calls this to register a callback for incoming deep links
  onDeepLink: (callback) => {
    ipcRenderer.on('deep-link', (_event, url) => callback(url));
  },
});
