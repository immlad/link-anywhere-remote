// LinkDesk host agent — Electron main process.
// Opens a window that shows the sharing code/link, captures the screen,
// and streams it to viewers via WebRTC (PeerJS public cloud).

const { app, BrowserWindow, desktopCapturer, ipcMain, screen, powerSaveBlocker } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 460,
    height: 520,
    title: "LinkDesk", autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "renderer.html"));
}

ipcMain.handle("get-screen-source", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 0, height: 0 },
  });
  const primary = sources[0];
  const { size } = screen.getPrimaryDisplay();
  return { id: primary.id, name: primary.name, width: size.width, height: size.height };
});

// Input injection via @nut-tree-fork/nut-js (lazy require so the UI opens
// even if the native build hasn't completed yet).
let nut = null;
function getNut() {
  if (nut) return nut;
  try {
    nut = require("@nut-tree-fork/nut-js");
    nut.mouse.config.autoDelayMs = 0;
    nut.keyboard.config.autoDelayMs = 0;
  } catch (e) {
    console.warn("nut-js not available — input control disabled:", e.message);
  }
  return nut;
}

// Low-latency input queue: mouse moves are coalesced so only the newest
// position is applied — a backlog of stale moves is what makes the cursor lag.
const queue = [];
let busy = false;
ipcMain.on("input-event", (_e, ev) => {
  if (ev.type === "mousemove") {
    const last = queue[queue.length - 1];
    if (last && last.type === "mousemove") queue[queue.length - 1] = ev;
    else queue.push(ev);
  } else queue.push(ev);
  pump();
});
async function pump() {
  if (busy) return;
  busy = true;
  while (queue.length) await handleInput(queue.shift());
  busy = false;
}

async function handleInput(ev) {
  const n = getNut();
  if (!n) return;
  const { Point, Button, Key } = n;
  const { width, height } = screen.getPrimaryDisplay().size;
  try {
    if (ev.type === "mousemove") {
      await n.mouse.setPosition(new Point(ev.x * width, ev.y * height));
    } else if (ev.type === "mousedown" || ev.type === "mouseup") {
      await n.mouse.setPosition(new Point(ev.x * width, ev.y * height));
      const btn = ev.button === "right" ? Button.RIGHT : ev.button === "middle" ? Button.MIDDLE : Button.LEFT;
      if (ev.type === "mousedown") await n.mouse.pressButton(btn);
      else await n.mouse.releaseButton(btn);
    } else if (ev.type === "wheel") {
      if (ev.dy) await n.mouse.scrollDown(Math.round(ev.dy / 20));
      if (ev.dx) await n.mouse.scrollRight(Math.round(ev.dx / 20));
    } else if (ev.type === "keydown" || ev.type === "keyup") {
      const key = mapKey(ev, Key);
      if (!key) return;
      if (ev.type === "keydown") await n.keyboard.pressKey(key);
      else await n.keyboard.releaseKey(key);
    }
  } catch (err) {
    console.error("input error", err);
  }
}

function mapKey(ev, Key) {
  const map = {
    Enter: Key.Enter, Backspace: Key.Backspace, Tab: Key.Tab, Escape: Key.Escape,
    ArrowUp: Key.Up, ArrowDown: Key.Down, ArrowLeft: Key.Left, ArrowRight: Key.Right,
    " ": Key.Space, Shift: Key.LeftShift, Control: Key.LeftControl, Alt: Key.LeftAlt,
    Meta: Key.LeftSuper, CapsLock: Key.CapsLock, Delete: Key.Delete,
  };
  if (map[ev.key]) return map[ev.key];
  const k = (ev.key || "").toUpperCase();
  if (k.length === 1 && /[A-Z0-9]/.test(k)) return Key[k];
  return null;
}

// Only one copy at a time (it auto-starts with the computer).
if (!app.requestSingleInstanceLock()) app.quit();
app.on("second-instance", () => { if (win) { win.show(); win.focus(); } });

app.whenReady().then(() => {
  // Start automatically when the computer turns on / user signs in.
  if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: true });
  // Keep the computer awake while LinkDesk runs so it stays reachable.
  powerSaveBlocker.start("prevent-app-suspension");
  createWindow();
});
app.on("window-all-closed", () => app.quit());
