import { useEffect, useRef, useState } from "react";
import { Send, Radio } from "lucide-react";
import type { AppState } from "./store";
import { useSectorLive, type DwarkaSnapshot } from "./SectorEngine";
import { useLocation } from "./LocationContext";

const CHANNELS = [
  { id: "01", label: "Civic Ops" },
  { id: "02", label: "Medical" },
  { id: "03", label: "Engineering" },
  { id: "04", label: "Security" },
  { id: "05", label: "Citizen Care" },
];

const QUICK = [
  "What's the air-quality advice right now?",
  "Should I go for an outdoor walk?",
  "How is traffic in my sector?",
  "Power grid status near me?",
];

function buildContextPrompt(snap: DwarkaSnapshot, operator: string, channel: string) {
  return [
    `You are OPS, the Help Desk operator at Republic Sector: West Delhi Hub — a 1960s-style space-age civic mission control. Speak in simple English, calm and clipped like a radio operator. Reference real West Delhi places when useful. Help citizens with: AQI advice, traffic, metro, power outages, RWA matters, blood donation, helplines (Police 100, Fire 101, Ambulance 102, Women 1091, Child 1098, Cyber 1930). Keep replies to 1-3 short sentences. Use UPPERCASE only for codes/labels. End with "STAND BY." or "ACKNOWLEDGED." when natural. Never break character.`,
    `\n--- LIVE TELEMETRY (do not invent values; use these numbers when asked) ---`,
    `Operator: ${operator}`,
    `Channel: CH-${channel}`,
    `Sector: ${snap.neighborhoodName} (${snap.station})`,
    `Data source: ${snap.source} · last sync ${new Date(snap.fetchedAt).toLocaleTimeString("en-GB")}`,
    `Air: AQI ${snap.aqi} (${snap.aqiCategory}) · PM2.5 ${snap.pm25} µg/m³ · PM10 ${snap.pm10} µg/m³ · O3 ${snap.o3} · NO2 ${snap.no2} · SO2 ${snap.so2} · CO ${snap.co}`,
    `Weather: ${snap.tempC}°C (feels ${snap.feelsLikeC}°C) · ${snap.humidity}% RH · wind ${snap.windKmh} km/h ${snap.windDir} · pressure ${snap.pressureHpa} hPa · cloud ${snap.cloudPct}% · UV ${snap.uvIndex} · visibility ${snap.visibilityKm} km · ${snap.conditions}`,
    `Sun: rises ${snap.sunrise} · sets ${snap.sunset}`,
    `Grid: load ${snap.gridLoadMW} MW · frequency ${snap.gridFreqHz} Hz · outage risk ${snap.outageRisk}`,
    `Traffic index: ${snap.trafficIndex}/100. Hot spots: ${snap.congestion.map(c => `${c.road} (${c.level})`).join("; ")}`,
    `Metro: ${snap.metroOk ? "ON TIME" : "DELAY"} · Water: ${snap.waterOk ? "OK" : "DISRUPTION"}`,
    snap.weatherAlert ? `ACTIVE ADVISORY: ${snap.weatherAlert}` : `No active advisory.`,
    `--- END TELEMETRY ---`,
  ].join("\n");
}

export function CommsView({
  state, patch, operatorName,
}: {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
  operatorName: string;
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState("01");
  const logRef = useRef<HTMLDivElement>(null);
  const { neighborhood } = useLocation();
  const { snap } = useSectorLive(neighborhood, 60000);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [state.commsLog.length]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");

    const next: AppState["commsLog"] = [
      ...state.commsLog,
      { ts: Date.now(), role: "you", text: trimmed },
    ];
    patch({ commsLog: next });

    const systemPrompt = buildContextPrompt(snap, operatorName, channel);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Backend not configured");
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/republic-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          systemPrompt,
          messages: next.slice(-12).map((m) => ({
            role: m.role === "you" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (res.status === 429) {
        patch({
          commsLog: [...next, { ts: Date.now(), role: "ops", text: "Signal overloaded — too many requests. Wait a moment, citizen. STAND BY." }],
        });
        return;
      }
      if (res.status === 402) {
        patch({
          commsLog: [...next, { ts: Date.now(), role: "ops", text: "AI credits depleted. Contact command to add funds. STAND BY." }],
        });
        return;
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 160)}`);
      }
      const json = await res.json();
      const reply: string =
        json?.reply?.trim() ||
        "Signal received but empty. STAND BY.";
      patch({
        commsLog: [...next, { ts: Date.now(), role: "ops", text: reply }],
      });
    } catch (e) {
      console.error("CommsView send error", e);
      patch({
        commsLog: [
          ...next,
          { ts: Date.now(), role: "ops", text: "Signal lost. Backend may be initializing — try again shortly. STAND BY." },
        ],
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="lg:col-span-2 panel rivet-corner p-3 flex flex-col">
        <span className="rivet-tl" /><span className="rivet-tr" />
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="label-tape">HELP DESK · ASK STATION AI</div>
          <div className="flex gap-1 flex-wrap">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                onClick={() => setChannel(c.id)}
                className={`btn-mech px-2 py-1 text-[9px] ${channel === c.id ? "is-active" : ""}`}
              >
                CH-{c.id}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[9px] text-beige-dim tracking-[0.2em] mb-2 normal-case">
          AI context: <span className="glow-amber">{snap.neighborhoodName}</span> · AQI {snap.aqi} · {snap.tempC}°C · {snap.conditions}
        </div>

        <div ref={logRef} className="display-recessed p-3 font-terminal text-[13px] flex-1 min-h-[260px] max-h-[420px] overflow-y-auto">
          {state.commsLog.map((m, i) => (
            <div key={i} className="leading-tight mb-1 normal-case">
              <span className={m.role === "you" ? "text-amber" : "glow-phosphor"}>
                {m.role === "you" ? "YOU" : "OPS"}:
              </span>{" "}
              {m.text}
            </div>
          ))}
          {sending && <div className="text-beige-dim">OPS: <span className="cursor-blink" /></div>}
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)} className="btn-mech px-2 py-1 text-[9px] normal-case tracking-normal">
              {q}
            </button>
          ))}
        </div>

        <form className="flex gap-2 mt-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="display-recessed px-2 py-2 flex-1 font-terminal text-[13px] text-phosphor outline-none normal-case bg-transparent"
          />
          <button type="submit" disabled={sending} className="btn-mech px-3 py-2 flex items-center gap-1">
            <Send className="w-3 h-3" /> SEND
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="panel rivet-corner p-3">
          <span className="rivet-tl" /><span className="rivet-tr" />
          <div className="label-tape mb-2">OPEN CHANNELS</div>
          <div className="space-y-1 text-[11px] normal-case">
            {CHANNELS.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-border/40 py-1">
                <span className="flex items-center gap-2"><Radio className="w-3 h-3" /> CH-{c.id} · {c.label}</span>
                <span className={`led ${c.id === channel ? "" : "amber"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel rivet-corner p-3">
          <span className="rivet-tl" /><span className="rivet-tr" />
          <div className="label-tape mb-2">RECENT BROADCASTS</div>
          <div className="display-recessed p-2 font-terminal text-[11px] max-h-40 overflow-y-auto">
            {state.broadcastLog.length === 0
              ? <div className="text-beige-dim">— silent —</div>
              : state.broadcastLog.slice(0, 8).map((b, i) => (
                  <div key={i} className="leading-tight normal-case">
                    <span className="text-amber">[{new Date(b.ts).toLocaleTimeString().slice(0, 5)}]</span>{" "}
                    {b.text}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
