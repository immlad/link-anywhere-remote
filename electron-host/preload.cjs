const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("linkdesk", {
  getScreenSource: () => ipcRenderer.invoke("get-screen-source"),
  inputEvent: (ev) => ipcRenderer.invoke("input-event", ev),
});
