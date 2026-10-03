import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Monitor, Download, Link as LinkIcon, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinkDesk — Remote Desktop in a Link" },
      {
        name: "description",
        content:
          "Control your computer from anywhere through a shareable link. Download the tiny host agent, open the link, done.",
      },
      { property: "og:title", content: "LinkDesk — Remote Desktop in a Link" },
      {
        property: "og:description",
        content:
          "Peer-to-peer remote desktop, no account required. Static site + lightweight host agent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [code, setCode] = useState("");
  const navigate = Route.useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b border-border/60 backdrop-blur-xl sticky top-0 z-10 bg-background/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Monitor className="w-5 h-5" />
            </div>
            <span className="font-semibold tracking-tight">LinkDesk</span>
          </div>
          <a
            href="https://github.com"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Source
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your desktop,
            <br />
            <span className="text-primary">one link away.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Run the tiny host agent on your computer. Share the link. Control
            it live from any browser — peer-to-peer, no server in the middle.
          </p>
        </section>

        <section className="mt-14 grid md:grid-cols-2 gap-6">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">1. Host your desktop</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Download and run the host agent on the computer you want to
              control. It opens a window with your sharing code and link.
            </p>
            <Button asChild size="lg" className="w-full">
              <a href={`${import.meta.env.BASE_URL}linkdesk-host.zip`} download>
                <Download className="w-4 h-4 mr-2" />
                Download Host Agent
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Windows · macOS · Linux
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">2. Open the link</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Already have a code from the host? Paste it below, or open a
              link like <code className="text-xs">/viewer#CODE</code>.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) {
                  navigate({ to: "/viewer", hash: code.trim() });
                }
              }}
              className="space-y-3"
            >
              <Input
                type="text"
                placeholder="Enter sharing code, e.g. minh-office-pc"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11"
              />
              <Button type="submit" size="lg" variant="secondary" className="w-full">
                Connect
              </Button>
            </form>
          </Card>
        </section>

        <section className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Peer-to-peer",
              body: "Video and input flow directly between browser and host over WebRTC.",
            },
            {
              icon: Shield,
              title: "No account",
              body: "Nothing to sign up for. The code is the only credential.",
            },
            {
              icon: Monitor,
              title: "Full control",
              body: "Live screen, mouse, keyboard. Like being there.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="p-6">
              <Icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 text-center text-sm text-muted-foreground">
          <p>
            Powered by WebRTC and the public PeerJS cloud. For sensitive use,
            self-host a signaling server.
          </p>
        </section>
      </main>
    </div>
  );
}
