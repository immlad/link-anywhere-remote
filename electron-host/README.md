# LinkDesk Host Agent

The computer-side half of LinkDesk. Captures your desktop and relays mouse/keyboard
input from any viewer that opens your sharing link.

## Run it

Requires Node.js 18+.

```bash
npm install
npm start
```

A small window opens showing:

- a **sharing code** (e.g. `linkdesk-ab12cd`)
- a **shareable link** pointing at the LinkDesk viewer site

Open the link in any browser (or send it to someone) to control this computer.

## Point it at your viewer site

Edit `renderer.html` and replace:

```js
const VIEWER_BASE = "https://YOUR-GITHUB-PAGES-URL/viewer";
```

with the URL where you deployed the LinkDesk web app (e.g. your GitHub Pages URL).

## Packaging

Build a standalone app with [`@electron/packager`](https://github.com/electron/packager):

```bash
npx @electron/packager . "LinkDesk" --platform=darwin --arch=arm64 --out=dist
npx @electron/packager . "LinkDesk" --platform=win32  --arch=x64   --out=dist
npx @electron/packager . "LinkDesk" --platform=linux  --arch=x64   --out=dist
```

## Notes

- Uses the public PeerJS cloud for signaling. For sensitive use, run your own
  PeerServer and pass `{ host, port, path }` to `new Peer(...)` in `renderer.html`.
- Input control uses `@nut-tree-fork/nut-js`, which is a native module. If the
  install fails on your machine you may need platform build tools
  (Xcode CLI, Visual Studio Build Tools, or `build-essential`).
- The host streams at up to 1080p30. Tune the constraints in `renderer.html`.
