import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type Peer from "peerjs";
import type { DataConnection, MediaConnection } from "peerjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Monitor, WifiOff, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/viewer")({
  head: () => ({
    meta: [
      { title: "LinkDesk Viewer — Control a remote desktop" },
      {
        name: "description",
        content:
          "Open a LinkDesk sharing code to view and control a remote computer live in your browser.",
      },
      { property: "og:title", content: "LinkDesk Viewer" },
      {
        property: "og:description",
        content: "Control a remote computer live in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Viewer,
});

type Status = "idle" | "connecting" | "connected" | "error" | "ended";

function Viewer() {
  const [hostId, setHostId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const dataRef = useRef<DataConnection | null>(null);
  const callRef = useRef<MediaConnection | null>(null);

  useEffect(() => {
    const h = window.location.hash.replace(/^#/, "").trim();
    if (h) {
      setHostId(h);
      connect(h);
    }
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    callRef.current?.close();
    dataRef.current?.close();
    peerRef.current?.destroy();
    peerRef.current = null;
  }

  async function connect(id: string) {
    setStatus("connecting");
    setError(null);
    try {
      const { default: PeerCtor } = await import("peerjs");
      const peer = new PeerCtor();
      peerRef.current = peer;

      peer.on("open", () => {
        const data = peer.connect(id, { reliable: true });
        dataRef.current = data;
        data.on("open", () => {
          data.send({ type: "request-stream" });
        });
        data.on("close", () => setStatus("ended"));
        data.on("error", (e) => {
          setError(String(e));
          setStatus("error");
        });
      });

      peer.on("call", (call) => {
        callRef.current = call;
        call.answer();
        call.on("stream", (stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setStatus("connected");
        });
        call.on("close", () => setStatus("ended"));
      });

      peer.on("error", (e) => {
        setError(e.message || String(e));
        setStatus("error");
      });
    } catch (e) {
      setError(String(e));
      setStatus("error");
    }
  }

  function sendInput(ev: object) {
    const d = dataRef.current;
    if (d && d.open) d.send(ev);
  }

  function relativeCoords(e: React.MouseEvent<HTMLVideoElement>) {
    const v = e.currentTarget;
    const rect = v.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  }

  const buttons = ["left", "middle", "right"] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <Monitor className="w-4 h-4 text-primary" />
            <span className="font-mono text-muted-foreground">
              {hostId || "no code"}
            </span>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      <main className="flex-1 grid place-items-center p-4 bg-muted">
        {status === "idle" && (
          <Card className="p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2">Enter a sharing code</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Get the code from the host agent window.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (hostId.trim()) {
                  window.location.hash = hostId.trim();
                  connect(hostId.trim());
                }
              }}
              className="flex gap-2"
            >
              <Input
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                placeholder="e.g. linkdesk-ab12cd"
              />
              <Button type="submit">Connect</Button>
            </form>
          </Card>
        )}

        {status === "connecting" && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Connecting to host…</p>
          </div>
        )}

        {(status === "error" || status === "ended") && (
          <Card className="p-8 max-w-md w-full text-center">
            <WifiOff className="w-8 h-8 mx-auto mb-3 text-destructive" />
            <h2 className="text-lg font-semibold mb-1">
              {status === "ended" ? "Session ended" : "Could not connect"}
            </h2>
            {error && (
              <p className="text-xs text-muted-foreground break-all mb-4">
                {error}
              </p>
            )}
            <Button
              onClick={() => {
                cleanup();
                setStatus("idle");
              }}
            >
              Try again
            </Button>
          </Card>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={
            "max-w-full max-h-[calc(100vh-120px)] rounded-lg shadow-2xl bg-black " +
            (status === "connected" ? "block" : "hidden")
          }
          tabIndex={0}
          onContextMenu={(e) => e.preventDefault()}
          onMouseMove={(e) => {
            const p = relativeCoords(e);
            sendInput({ type: "mousemove", ...p });
          }}
          onMouseDown={(e) => {
            const p = relativeCoords(e);
            sendInput({ type: "mousedown", button: buttons[e.button] ?? "left", ...p });
          }}
          onMouseUp={(e) => {
            const p = relativeCoords(e);
            sendInput({ type: "mouseup", button: buttons[e.button] ?? "left", ...p });
          }}
          onWheel={(e) => {
            sendInput({ type: "wheel", dx: e.deltaX, dy: e.deltaY });
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            sendInput({
              type: "keydown",
              key: e.key,
              code: e.code,
              ctrl: e.ctrlKey,
              shift: e.shiftKey,
              alt: e.altKey,
              meta: e.metaKey,
            });
          }}
          onKeyUp={(e) => {
            e.preventDefault();
            sendInput({
              type: "keyup",
              key: e.key,
              code: e.code,
            });
          }}
        />
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    idle: { label: "Idle", cls: "bg-muted text-muted-foreground" },
    connecting: { label: "Connecting", cls: "bg-primary/10 text-primary" },
    connected: { label: "Live", cls: "bg-emerald-500/15 text-emerald-600" },
    error: { label: "Error", cls: "bg-destructive/10 text-destructive" },
    ended: { label: "Ended", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[status];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
