import { useEffect, useState } from "react";
import { Power, User as UserIcon, Lock } from "lucide-react";
import { STATION } from "./types";

const BOOT_LINES = [
  "[OK] CRT warm-up · 18.6 kV ......... NOMINAL",
  "[OK] Mission tape · DECK-A spool ... ENGAGED",
  "[OK] Vacuum tubes V-001..V-128 ..... STABLE",
  "[OK] Line printer · 132-col ribbon . READY",
  "[OK] Uplink · WEST DELHI HUB ....... HANDSHAKE",
  "[OK] Local vault · localStorage .... UNLOCKED",
  "READY ▌",
];

export function Login({ onAuth }: { onAuth: (username: string) => void }) {
  const [phase, setPhase] = useState<"boot" | "select">("boot");
  const [shown, setShown] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [waqiKey, setWaqiKey] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem("republic.waqiToken") || "",
  );

  function persistKeys() {
    try {
      if (waqiKey) window.localStorage.setItem("republic.waqiToken", waqiKey.trim());
      else window.localStorage.removeItem("republic.waqiToken");
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (phase !== "boot") return;
    let i = 0;
    const t = window.setInterval(() => {
      i++;
      setShown(BOOT_LINES.slice(0, i));
      if (i >= BOOT_LINES.length) {
        window.clearInterval(t);
        window.setTimeout(() => setPhase("select"), 500);
      }
    }, 220);
    return () => window.clearInterval(t);
  }, [phase]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();
    if (!u) { setError("USERNAME REQUIRED"); return; }
    if (!p) { setError("PASSCODE REQUIRED"); return; }
    setError(null);
    persistKeys();
    onAuth(u);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="panel rivet-corner crt p-6 w-full max-w-xl">
        <span className="rivet-tl" /><span className="rivet-tr" />
        <header className="text-center mb-4">
          <div className="font-display text-2xl glow-amber leading-none">
            REPUBLIC<span className="text-beige">/</span>OS
          </div>
          <div className="text-[9px] tracking-[0.3em] text-beige-dim mt-2">
            v4.7.2 · OPERATION PROGRESS · GREATER GOOD MAINFRAME
          </div>
          <div className="text-[10px] tracking-[0.2em] glow-phosphor mt-1 normal-case">
            {STATION}
          </div>
        </header>

        <div className="display-recessed p-3 font-terminal text-[14px] text-phosphor min-h-[180px]">
          {shown.map((line, i) => (
            <div key={i} className="leading-tight">{line}</div>
          ))}
          {phase === "boot" && <span className="cursor-blink" />}
        </div>

        {phase === "select" && (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="label-tape">OPERATOR LOGIN · CHANNEL 00</div>

            <label className="flex items-center gap-2 display-recessed px-2 py-2">
              <UserIcon className="w-3 h-3 text-beige-dim" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USERNAME"
                autoFocus
                className="bg-transparent flex-1 font-terminal text-[14px] text-phosphor outline-none normal-case"
              />
            </label>
            <label className="flex items-center gap-2 display-recessed px-2 py-2">
              <Lock className="w-3 h-3 text-beige-dim" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSCODE"
                type="password"
                className="bg-transparent flex-1 font-terminal text-[14px] text-phosphor outline-none normal-case"
              />
            </label>

            {error && (
              <div className="text-[10px] glow-alert tracking-[0.25em]">{error}</div>
            )}

            <button type="submit" className="btn-mech w-full px-3 py-3 flex items-center justify-center gap-2">
              <Power className="w-4 h-4" /> ENGAGE SESSION
            </button>

            <button
              type="button"
              onClick={() => setShowKeys((v) => !v)}
              className="text-[9px] text-beige-dim text-center mt-1 tracking-[0.2em] w-full hover:glow-amber"
            >
              {showKeys ? "▾ HIDE API KEYS" : "▸ CONFIGURE API KEYS (WAQI)"}
            </button>

            {showKeys && (
              <div className="space-y-2 border-t border-border/40 pt-3">
                <div className="text-[9px] text-beige-dim tracking-[0.2em] normal-case">
                  Stored locally in this browser only. Get a free WAQI token at aqicn.org/data-platform/token.
                </div>
                <label className="flex items-center gap-2 display-recessed px-2 py-2">
                  <span className="text-[9px] text-beige-dim tracking-[0.2em] w-12">WAQI</span>
                  <input
                    value={waqiKey}
                    onChange={(e) => setWaqiKey(e.target.value)}
                    placeholder="paste WAQI token"
                    className="bg-transparent flex-1 font-terminal text-[12px] text-phosphor outline-none normal-case"
                  />
                </label>
              </div>
            )}

            <p className="text-[9px] text-beige-dim text-center mt-1 tracking-[0.2em]">
              ALL DATA SAVED ON THIS DEVICE ONLY · NO SERVER ACCOUNT
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
