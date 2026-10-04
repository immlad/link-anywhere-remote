const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/bundler-ClWuY94c.js","assets/rolldown-runtime-DC62tzP2.js"])))=>i.map(i=>d[i]);
import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { a as require_react, i as require_jsx_runtime, n as __vitePreload, r as Link } from "./ghpages-BAh5iL2y.js";
import { a as Button, i as Input, n as createLucideIcon, r as Card, t as Monitor } from "./monitor-D0YpFYoR.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowLeft = createLucideIcon("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LoaderCircle = createLucideIcon("loader-circle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var WifiOff = createLucideIcon("wifi-off", [
	["path", {
		d: "M12 20h.01",
		key: "zekei9"
	}],
	["path", {
		d: "M8.5 16.429a5 5 0 0 1 7 0",
		key: "1bycff"
	}],
	["path", {
		d: "M5 12.859a10 10 0 0 1 5.17-2.69",
		key: "1dl1wf"
	}],
	["path", {
		d: "M19 12.859a10 10 0 0 0-2.007-1.523",
		key: "4k23kn"
	}],
	["path", {
		d: "M2 8.82a15 15 0 0 1 4.177-2.643",
		key: "1grhjp"
	}],
	["path", {
		d: "M22 8.82a15 15 0 0 0-11.288-3.764",
		key: "z3jwby"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]);
//#endregion
//#region src/routes/viewer.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Viewer() {
	const [hostId, setHostId] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const videoRef = (0, import_react.useRef)(null);
	const peerRef = (0, import_react.useRef)(null);
	const dataRef = (0, import_react.useRef)(null);
	const callRef = (0, import_react.useRef)(null);
	const timeoutRef = (0, import_react.useRef)(null);
	const startedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		const h = window.location.hash.replace(/^#/, "").trim();
		if (h) {
			setHostId(h);
			connect(h);
		}
		return () => {
			cleanup();
		};
	}, []);
	function cleanup() {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		callRef.current?.close();
		dataRef.current?.close();
		peerRef.current?.destroy();
		peerRef.current = null;
	}
	function fail(msg) {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		setError(msg);
		setStatus("error");
	}
	async function connect(rawId) {
		const clean = rawId.trim().toLowerCase();
		const id = clean.startsWith("linkdesk-") ? clean : "linkdesk-" + clean;
		setStatus("connecting");
		setError(null);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			fail("Timed out waiting for the host. Check that the host agent is running and the code is correct. Strict firewalls or networks that block peer-to-peer traffic can also prevent a connection.");
		}, 2e4);
		try {
			const { default: PeerCtor } = await __vitePreload(async () => {
				const { default: PeerCtor } = await import("./bundler-ClWuY94c.js");
				return { default: PeerCtor };
			}, __vite__mapDeps([0,1]));
			const peer = new PeerCtor();
			peerRef.current = peer;
			peer.on("open", (myId) => {
				console.log("[ld] peer open", myId, "-> connecting to", id);
				const data = peer.connect(id, { reliable: true });
				dataRef.current = data;
				data.on("open", () => {
					console.log("[ld] data open -> request-stream");
					data.send({ type: "request-stream" });
				});
				data.on("close", () => setStatus("ended"));
				data.on("error", (e) => fail(String(e)));
			});
			peer.on("call", (call) => {
				console.log("[ld] incoming call from", call.peer);
				callRef.current = call;
				call.answer();
				call.on("stream", (stream) => {
					console.log("[ld] stream received", stream.getTracks().length);
					if (timeoutRef.current) clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
					if (videoRef.current) {
						videoRef.current.srcObject = stream;
						videoRef.current.play().catch(() => {});
					}
					setStatus("connected");
				});
				call.on("close", () => setStatus("ended"));
			});
			peer.on("error", (e) => fail(e.message || String(e)));
		} catch (e) {
			setError(String(e));
			setStatus("error");
		}
	}
	function sendInput(ev) {
		const d = dataRef.current;
		if (d && d.open) d.send(ev);
	}
	function relativeCoords(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;
		return {
			x: Math.max(0, Math.min(1, x)),
			y: Math.max(0, Math.min(1, y))
		};
	}
	const buttons = [
		"left",
		"middle",
		"right"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-border/60 px-4 py-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-4 h-4 mr-1" }), " Home"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "w-4 h-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-muted-foreground",
						children: hostId || "no code"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex-1 grid place-items-center p-4 bg-muted",
			children: [
				status === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-8 max-w-md w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold mb-2",
							children: "Enter a sharing code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mb-4",
							children: "Get the code from the host agent window."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								if (hostId.trim()) {
									window.location.hash = hostId.trim();
									connect(hostId.trim());
								}
							},
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: hostId,
								onChange: (e) => setHostId(e.target.value),
								placeholder: "e.g. linkdesk-ab12cd"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Connect"
							})]
						})
					]
				}),
				status === "connecting" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-8 h-8 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Connecting to host…" })]
				}),
				(status === "error" || status === "ended") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-8 max-w-md w-full text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-8 h-8 mx-auto mb-3 text-destructive" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold mb-1",
							children: status === "ended" ? "Session ended" : "Could not connect"
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground break-all mb-4",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								cleanup();
								setStatus("idle");
							},
							children: "Try again"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					autoPlay: true,
					playsInline: true,
					muted: true,
					className: "max-w-full max-h-[calc(100vh-120px)] rounded-lg shadow-2xl bg-black " + (status === "connected" ? "block" : "hidden"),
					tabIndex: 0,
					onContextMenu: (e) => e.preventDefault(),
					onMouseMove: (e) => {
						sendInput({
							type: "mousemove",
							...relativeCoords(e)
						});
					},
					onMouseDown: (e) => {
						const p = relativeCoords(e);
						sendInput({
							type: "mousedown",
							button: buttons[e.button] ?? "left",
							...p
						});
					},
					onMouseUp: (e) => {
						const p = relativeCoords(e);
						sendInput({
							type: "mouseup",
							button: buttons[e.button] ?? "left",
							...p
						});
					},
					onWheel: (e) => {
						sendInput({
							type: "wheel",
							dx: e.deltaX,
							dy: e.deltaY
						});
					},
					onKeyDown: (e) => {
						e.preventDefault();
						sendInput({
							type: "keydown",
							key: e.key,
							code: e.code,
							ctrl: e.ctrlKey,
							shift: e.shiftKey,
							alt: e.altKey,
							meta: e.metaKey
						});
					},
					onKeyUp: (e) => {
						e.preventDefault();
						sendInput({
							type: "keyup",
							key: e.key,
							code: e.code
						});
					}
				})
			]
		})]
	});
}
function StatusBadge({ status }) {
	const s = {
		idle: {
			label: "Idle",
			cls: "bg-muted text-muted-foreground"
		},
		connecting: {
			label: "Connecting",
			cls: "bg-primary/10 text-primary"
		},
		connected: {
			label: "Live",
			cls: "bg-emerald-500/15 text-emerald-600"
		},
		error: {
			label: "Error",
			cls: "bg-destructive/10 text-destructive"
		},
		ended: {
			label: "Ended",
			cls: "bg-muted text-muted-foreground"
		}
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`,
		children: s.label
	});
}
//#endregion
export { Viewer as component };
