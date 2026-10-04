const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("linkdesk", {
  getScreenSource: () => ipcRenderer.invoke("get-screen-source"),
  // Fire-and-forget: no round trip per event keeps input fast.
  inputEvent: (ev) => ipcRenderer.send("input-event", ev),
});
