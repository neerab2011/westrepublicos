import { useEffect, useMemo, useRef, useState } from "react";
import {
  Wind, Droplets, Gauge as GaugeIcon, Zap, AlertTriangle, Car, Train,
  Send, RefreshCw, Activity, Clock, Sun, Sunrise, Sunset, Eye, CloudRain,
  Compass, Thermometer, Radio, Settings as SettingsIcon, Check,
} from "lucide-react";
import { useSectorLive } from "./SectorEngine";
import { useLocation } from "./LocationContext";
import type { AppState } from "./store";
import { MISSIONS, randomCrewName, SECTOR_BROADCASTS } from "./types";

function Tile({
  label, value, sub, Icon, tone = "amber", live = false,
}: {
  label: string; value: string; sub?: string; Icon: typeof Wind;
  tone?: "amber" | "phosphor" | "alert";
  live?: boolean;
}) {
  let glow = "glow-amber";
  if (tone === "phosphor") glow = "glow-phosphor";
  if (tone === "alert")    glow = "glow-alert";
  return (
    <div className="panel rivet-corner p-3">
      <span className="rivet-tl" /><span className="rivet-tr" />
      <div className="flex items-center justify-between text-[9px] text-beige-dim tracking-[0.2em]">
        <span className="flex items-center gap-1">
          {live && <span className="led" style={{ width: 5, height: 5 }} />}
          {label}
        </span>
        <Icon className="w-3 h-3" />
      </div>
      <div className={`font-terminal text-2xl ${glow} mt-1`}>{value}</div>
      {sub && <div className="text-[9px] text-beige-dim mt-1 normal-case">{sub}</div>}
    </div>
  );
}

function Gauge({
  label, value, min, max, unit, tone = "phosphor",
}: {
  label: string; value: number; min: number; max: number; unit: string;
  tone?: "phosphor" | "amber" | "alert";
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min);
  const angle = -90 + pct * 180;

  let stroke = "var(--phosphor)";
  let glow = "glow-phosphor";
  if (tone === "amber") { stroke = "var(--amber)"; glow = "glow-amber"; }
  if (tone === "alert") { stroke = "var(--alert)"; glow = "glow-alert"; }

  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const a = (-90 + (i / 10) * 180) * (Math.PI / 180);
    const r1 = 42;
    const r2 = i % 5 === 0 ? 34 : 38;
    ticks.push(
      <line key={i} x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)} x2={50 + r2 * Math.cos(a)} y2={50 + r2 * Math.sin(a)} stroke="var(--beige-dim)" strokeWidth={i % 5 === 0 ? 1.2 : 0.6} />
    );
  }

  return (
    <div className="panel rivet-corner p-2 flex flex-col items-center">
      <span className="rivet-tl" /><span className="rivet-tr" />
      <div className="text-[9px] text-beige-dim tracking-[0.2em] w-full flex justify-between"><span>{label}</span><span>{unit}</span></div>
      <svg viewBox="0 0 100 60" className="w-full h-20">
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="var(--bezel)" strokeWidth="6" />
        {ticks}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50px 50px", transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
          <line x1="50" y1="50" x2="50" y2="12" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="3.5" fill="var(--bezel-light)" stroke="oklch(0 0 0)" strokeWidth="0.5" />
      </svg>
      <div className={`font-terminal text-lg ${glow} -mt-1`}>{value.toFixed(value < 10 ? 1 : 0)}</div>
    </div>
  );
}

function Sparkline({ data, tone = "phosphor" }: { data: number[]; tone?: "phosphor" | "amber" | "alert" }) {
  let stroke = "var(--phosphor)";
  if (tone === "amber") stroke = "var(--amber)";
  if (tone === "alert") stroke = "var(--alert)";
  if (data.length < 2) return <div className="display-recessed h-10 flex items-center justify-center text-[9px] text-beige-dim">acquiring signal…</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 90 - 5;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="display-recessed h-10 p-1">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={pts} style={{ filter: `drop-shadow(0 0 2px ${stroke})` }} />
      </svg>
    </div>
  );
}

function Bar({ value, tone }: { value: number; tone?: "amber" | "alert" }) {
  let cls = "";
  if (tone === "alert") cls = "alert";
  else if (tone === "amber") cls = "amber";
  return (
    <div className="meter-track">
      <div className={`meter-fill ${cls}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function generateDynamicBroadcasts(tempC: number, aqi: number, hour: number, neighborhoodName: string): string[] {
  const alerts: string[] = [];
  if (tempC > 37) alerts.push(`Heatwave Advisory · ${neighborhoodName} · ${tempC}°C — stay hydrated`);
  if (tempC < 8) alerts.push(`Cold Wave Alert · ${neighborhoodName} — wrap up warm`);
  if (aqi > 300) alerts.push(`AQI EMERGENCY ${aqi} · Wear N95 outdoors`);
  else if (aqi > 200) alerts.push(`AQI Alert ${aqi} · Limit outdoor activity`);
  else if (aqi > 100) alerts.push(`AQI Moderate ${aqi} · Sensitive groups take care`);
  if (hour >= 17 && hour < 18) alerts.push("Shift Change · Evening watch begins");
  if (hour >= 5 && hour < 6) alerts.push("Dawn Patrol · Morning shift commencing");
  if (hour >= 22) alerts.push("Night ops active · Reduced crew");
  if (alerts.length === 0) alerts.push(`${neighborhoodName} · All systems nominal`);
  return alerts;
}

export function HubView({
  state, patch,
}: {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}) {
  const { neighborhood } = useLocation();
  const { snap: live, refresh } = useSectorLive(neighborhood, 15000);
  const [issue, setIssue] = useState("");

  const [showConfig, setShowConfig] = useState(false);
  const [waqiToken, setWaqiToken] = useState<string>(
    () => (typeof window !== "undefined" ? window.localStorage.getItem("republic.waqiToken") || "" : "")
  );
  const [savedFlash, setSavedFlash] = useState(false);
  function saveConfig() {
    if (typeof window !== "undefined") {
      if (waqiToken.trim()) window.localStorage.setItem("republic.waqiToken", waqiToken.trim());
      else window.localStorage.removeItem("republic.waqiToken");
    }
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
    refresh();
  }

  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // --- Auto-update broadcast engine: push a new sector-specific log every 45-60 seconds ---
  const broadcastIndexRef = useRef(0);
  useEffect(() => {
    const sectorId = neighborhood.id;
    broadcastIndexRef.current = 0;

    const pushBroadcast = () => {
      const queue = SECTOR_BROADCASTS[sectorId] || [];
      if (queue.length === 0) return;
      const item = queue[broadcastIndexRef.current % queue.length];
      broadcastIndexRef.current++;
      const entry = { ts: Date.now(), from: "OPS", text: item.text };
      patch({ broadcastLog: [entry, ...(state.broadcastLog || [])].slice(0, 30) });
    };

    // Push one immediately on sector change
    pushBroadcast();

    const delay = 45000 + Math.random() * 15000; // 45-60 seconds
    const t = window.setInterval(pushBroadcast, delay);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood.id]);

  const aqiHistory = useRef<number[]>([]);
  const tempHistory = useRef<number[]>([]);
  const loadHistory = useRef<number[]>([]);
  const windHistory = useRef<number[]>([]);
  const pm25History = useRef<number[]>([]);
  useEffect(() => {
    aqiHistory.current = [...aqiHistory.current, live.aqi].slice(-30);
    tempHistory.current = [...tempHistory.current, live.tempC].slice(-30);
    loadHistory.current = [...loadHistory.current, live.gridLoadMW].slice(-30);
    windHistory.current = [...windHistory.current, live.windKmh].slice(-30);
    pm25History.current = [...pm25History.current, live.pm25].slice(-30);
  }, [live.fetchedAt, live.aqi, live.tempC, live.gridLoadMW, live.windKmh, live.pm25]);

  let aqiTone: "amber" | "phosphor" | "alert" = "phosphor";
  if (live.aqi > 200)      aqiTone = "alert";
  else if (live.aqi > 100) aqiTone = "amber";

  const crew = useMemo(() => Array.from({ length: 5 }).map(() => randomCrewName()), []);

  const istTime = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
  const istDate = now.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const utcTime = now.toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false });
  const uplinkSec = Math.max(0, Math.floor((now.getTime() - live.fetchedAt) / 1000));

  function timeToMinutes(s: string) {
    const [h, m] = s.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }
  const istMins = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = timeToMinutes(live.sunrise);
  const sunsetMin  = timeToMinutes(live.sunset);
  const dayPct = Math.max(0, Math.min(1, (istMins - sunriseMin) / Math.max(1, sunsetMin - sunriseMin)));
  const isDay  = istMins >= sunriseMin && istMins <= sunsetMin;

  const dynamicBroadcasts = useMemo(
    () => generateDynamicBroadcasts(live.tempC, live.aqi, now.getHours(), live.neighborhoodName),
    [live.tempC, live.aqi, now.getHours(), live.neighborhoodName],
  );

  function broadcast(text: string) {
    if (!text.trim()) return;
    const entry = { ts: Date.now(), from: "OPS", text: text.trim() };
    patch({ broadcastLog: [entry, ...state.broadcastLog].slice(0, 30) });
  }

  function deployIssue() {
    if (!issue.trim()) return;
    broadcast("ISSUE · " + issue.trim());
    setIssue("");
  }

  const sectorMissions = useMemo(
    () => MISSIONS.filter((m) => m.sector === neighborhood.id && m.priority === "HIGH"),
    [neighborhood.id],
  );

  return (
    <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 panel rivet-corner p-3">
        <span className="rivet-tl" /><span className="rivet-tr" />

        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="label-tape">{neighborhood.name.toUpperCase()} · LIVE TELEMETRY</div>
            <span className="text-[9px] text-beige-dim normal-case">{neighborhood.lat.toFixed(2)}°N · {neighborhood.lon.toFixed(2)}°E</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={live.source === "LIVE" ? "led" : "led amber"} />
            <span className={`text-[9px] tracking-[0.2em] normal-case ${live.source === "LIVE" ? "glow-phosphor" : "text-beige-dim"}`}>
              {live.source === "LIVE" ? "LIVE FEED" : "FALLBACK SIM"} · SYNC {new Date(live.fetchedAt).toLocaleTimeString("en-GB")}
            </span>
            <button onClick={refresh} className="btn-mech px-2 py-1 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> REFRESH
            </button>
            <button onClick={() => setShowConfig((s) => !s)} className={`btn-mech px-2 py-1 flex items-center gap-1 ${showConfig ? "is-active" : ""}`} title="Configure data sources">
              <SettingsIcon className="w-3 h-3" /> CFG
            </button>
          </div>
        </div>

        {showConfig && (
          <div className="display-recessed p-3 mb-3 space-y-2">
            <div className="text-[9px] text-beige-dim tracking-[0.2em] flex items-center justify-between">
              <span>DATA SOURCE CONFIG · STORED LOCALLY ONLY</span>
              {savedFlash && <span className="glow-phosphor flex items-center gap-1"><Check className="w-3 h-3" /> SAVED</span>}
            </div>
            <div>
              <div className="text-[9px] text-beige-dim normal-case mb-1">WAQI Token (free at aqicn.org/data-platform/token)</div>
              <input type="password" value={waqiToken} onChange={(e) => setWaqiToken(e.target.value)} placeholder="paste token for real ground-station AQI" className="display-recessed px-2 py-1 w-full font-terminal text-[12px] text-phosphor outline-none normal-case" />
            </div>
            <div className="flex justify-end">
              <button onClick={saveConfig} className="btn-mech px-3 py-1 flex items-center gap-1"><Check className="w-3 h-3" /> SAVE</button>
            </div>
            <div className="text-[9px] text-beige-dim normal-case">
              Active feed: <span className="glow-amber">{live.station}</span> · {live.liveFields.filter(f => f.includes("WAQI")).length > 0 ? "WAQI ground station" : "Open-Meteo modeled"}
            </div>
          </div>
        )}

        <div className="display-recessed p-2 mb-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[8px] text-beige-dim tracking-[0.2em] flex items-center justify-center gap-1"><Clock className="w-2.5 h-2.5" /> IST</div>
            <div className="font-terminal text-xl glow-amber">{istTime}</div>
            <div className="text-[8px] text-beige-dim normal-case">{istDate}</div>
          </div>
          <div>
            <div className="text-[8px] text-beige-dim tracking-[0.2em]">UTC</div>
            <div className="font-terminal text-xl glow-phosphor">{utcTime}</div>
            <div className="text-[8px] text-beige-dim normal-case">ZULU TIME</div>
          </div>
          <div>
            <div className="text-[8px] text-beige-dim tracking-[0.2em] flex items-center justify-center gap-1"><Activity className="w-2.5 h-2.5" /> UPLINK</div>
            <div className={`font-terminal text-xl ${uplinkSec > 30 ? "glow-amber" : "glow-phosphor"}`}>T+{String(uplinkSec).padStart(3, "0")}s</div>
            <div className="text-[8px] text-beige-dim normal-case">since last sync</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <Gauge label="TEMP"  value={live.tempC}    min={0}  max={50}  unit="°C"  tone={live.tempC > 40 ? "alert" : "amber"} />
          <Gauge label="AIR"   value={live.aqi}      min={0}  max={500} unit="AQI" tone={aqiTone} />
          <Gauge label="WIND"  value={live.windKmh}  min={0}  max={60}  unit="KMH" tone="phosphor" />
          <Gauge label="HUMID" value={live.humidity} min={0}  max={100} unit="%RH" tone="amber" />
        </div>

        <div className="display-recessed p-2 mb-3 grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-[10px] normal-case">
          <div><div className="text-beige-dim text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"><Thermometer className="w-2.5 h-2.5" />FEELS</div><div className="font-terminal text-base glow-amber">{live.feelsLikeC}°C</div></div>
          <div><div className="text-beige-dim text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"><Compass className="w-2.5 h-2.5" />DIR</div><div className="font-terminal text-base glow-phosphor">{live.windDir}</div></div>
          <div><div className="text-beige-dim text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"><GaugeIcon className="w-2.5 h-2.5" />PRESS</div><div className="font-terminal text-base glow-phosphor">{live.pressureHpa}</div><div className="text-beige-dim text-[8px]">hPa</div></div>
          <div><div className="text-beige-dim text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"><Eye className="w-2.5 h-2.5" />VIS</div><div className="font-terminal text-base glow-phosphor">{live.visibilityKm}</div><div className="text-beige-dim text-[8px]">km</div></div>
          <div><div className="text-beige-dim text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"><Sun className="w-2.5 h-2.5" />UV</div><div className={`font-terminal text-base ${live.uvIndex > 7 ? "glow-alert" : "glow-amber"}`}>{live.uvIndex}</div></div>
          <div><div className="text-beige-dim text-[8px] tracking-[0.2em] flex items-center justify-center gap-1"><CloudRain className="w-2.5 h-2.5" />RAIN</div><div className="font-terminal text-base glow-phosphor">{live.precipMm}</div><div className="text-beige-dim text-[8px]">mm</div></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div><div className="text-[9px] text-beige-dim tracking-[0.2em] mb-1 flex justify-between"><span>AQI</span><span className="glow-amber">{live.aqi}</span></div><Sparkline data={aqiHistory.current} tone={aqiTone} /></div>
          <div><div className="text-[9px] text-beige-dim tracking-[0.2em] mb-1 flex justify-between"><span>TEMP</span><span className="glow-amber">{live.tempC}°</span></div><Sparkline data={tempHistory.current} tone="amber" /></div>
          <div><div className="text-[9px] text-beige-dim tracking-[0.2em] mb-1 flex justify-between"><span>WIND</span><span className="glow-phosphor">{live.windKmh}</span></div><Sparkline data={windHistory.current} tone="phosphor" /></div>
          <div><div className="text-[9px] text-beige-dim tracking-[0.2em] mb-1 flex justify-between"><span>PM 2.5</span><span className="glow-amber">{live.pm25}</span></div><Sparkline data={pm25History.current} tone={aqiTone} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="display-recessed p-2">
            <div className="text-[9px] text-beige-dim tracking-[0.2em] mb-1 flex justify-between normal-case">
              <span>SOLAR ARC · {neighborhood.name.toUpperCase()}</span>
              <span className="glow-amber">{isDay ? "DAYLIGHT" : "NIGHT"}</span>
            </div>
            <svg viewBox="0 0 200 70" className="w-full h-16">
              <path d="M 10 60 A 90 90 0 0 1 190 60" fill="none" stroke="var(--bezel)" strokeWidth="1" strokeDasharray="2 2" />
              <path d="M 10 60 A 90 90 0 0 1 190 60" fill="none" stroke="var(--amber)" strokeWidth="1.5" style={{ strokeDasharray: 283, strokeDashoffset: isDay ? 283 - dayPct * 283 : 283, filter: "drop-shadow(0 0 3px var(--amber))" }} />
              {isDay && <circle cx={10 + 180 * dayPct} cy={60 - Math.sin(dayPct * Math.PI) * 50} r="4" fill="var(--amber)" style={{ filter: "drop-shadow(0 0 6px var(--amber-glow))" }} />}
              <line x1="10" y1="60" x2="190" y2="60" stroke="var(--beige-dim)" strokeWidth="0.5" />
            </svg>
            <div className="flex justify-between text-[9px] normal-case mt-1">
              <span className="flex items-center gap-1 text-beige-dim"><Sunrise className="w-3 h-3" /> {live.sunrise}</span>
              <span className="text-beige-dim">{live.cloudPct}% cloud</span>
              <span className="flex items-center gap-1 text-beige-dim"><Sunset className="w-3 h-3" /> {live.sunset}</span>
            </div>
          </div>
          <div className="display-recessed p-2">
            <div className="text-[9px] text-beige-dim tracking-[0.2em] mb-1 flex justify-between normal-case"><span>POWER GRID · BSES YAMUNA</span><span className="text-beige-dim">SIM MODEL</span></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><div className="text-[8px] text-beige-dim">FREQ</div><div className={`font-terminal text-lg ${Math.abs(live.gridFreqHz - 50) > 0.1 ? "glow-alert" : "glow-phosphor"}`}>{live.gridFreqHz}</div><div className="text-[8px] text-beige-dim">Hz</div></div>
              <div><div className="text-[8px] text-beige-dim">LOAD</div><div className="font-terminal text-lg glow-amber">{live.gridLoadMW}</div><div className="text-[8px] text-beige-dim">MW</div></div>
              <div><div className="text-[8px] text-beige-dim">RISK</div><div className={`font-terminal text-lg ${live.outageRisk === "HIGH" ? "glow-alert" : live.outageRisk === "MED" ? "glow-amber" : "glow-phosphor"}`}>{live.outageRisk}</div><div className="text-[8px] text-beige-dim">outage</div></div>
            </div>
            <div className="mt-1"><Bar value={(live.gridLoadMW - 500) / 10} tone={live.gridLoadMW > 1100 ? "alert" : "amber"} /></div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
          <Tile label="PM 2.5" value={String(live.pm25)} sub="µg/m³" Icon={GaugeIcon} tone={aqiTone} live />
          <Tile label="PM 10"  value={String(live.pm10)} sub="µg/m³" Icon={GaugeIcon} tone={aqiTone} live />
          <Tile label="OZONE"  value={String(live.o3)}   sub="O₃ µg/m³" Icon={Wind} live />
          <Tile label="NO₂"    value={String(live.no2)}  sub="µg/m³" Icon={Wind} live />
          <Tile label="SO₂"    value={String(live.so2)}  sub="µg/m³" Icon={Wind} live />
          <Tile label="CO"     value={String(live.co)}   sub="mg/m³" Icon={Wind} live />
        </div>

        {live.weatherAlert && (
          <div className="mb-3 panel p-2 flex items-start gap-2 border border-alert/40">
            <AlertTriangle className="w-4 h-4 text-alert mt-0.5" />
            <div className="text-[11px] glow-alert leading-tight normal-case">{live.weatherAlert}</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] tracking-[0.25em] text-beige-dim mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Car className="w-3 h-3" /> TRAFFIC · {neighborhood.name.toUpperCase()} CORRIDORS</span>
              <span className="text-beige-dim normal-case">SIM</span>
            </div>
            <div className="space-y-2">
              {live.congestion.map((c) => {
                let tone: "amber" | "alert" | undefined;
                if (c.level > 75) tone = "alert";
                else if (c.level > 55) tone = "amber";
                return (
                  <div key={c.road}>
                    <div className="flex justify-between text-[10px] mb-0.5 normal-case"><span>{c.road}</span><span className="text-beige-dim">{c.level}</span></div>
                    <Bar value={c.level} tone={tone} />
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.25em] text-beige-dim mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Train className="w-3 h-3" /> CITY SERVICES</span>
              <span className="text-beige-dim normal-case">MIXED</span>
            </div>
            <div className="space-y-2 text-[11px] normal-case">
              <div className="flex justify-between"><span>DMRC · {neighborhood.name}</span><span className={live.metroOk ? "glow-phosphor" : "glow-alert"}>{live.metroOk ? "ON TIME" : "DELAY"}</span></div>
              <div className="flex justify-between"><span>Water Supply</span><span className={live.waterOk ? "glow-phosphor" : "glow-alert"}>{live.waterOk ? "OK" : "DISRUPTION"}</span></div>
              <div className="flex justify-between"><span>Conditions</span><span className="glow-phosphor">{live.conditions}</span></div>
              <div className="flex justify-between"><span>AQI Category</span><span className={aqiTone === "alert" ? "glow-alert" : "glow-amber"}>{live.aqiCategory}</span></div>
              <div className="flex justify-between"><span>Outage Risk</span><span className={live.outageRisk === "HIGH" ? "glow-alert" : live.outageRisk === "MED" ? "glow-amber" : "glow-phosphor"}>{live.outageRisk}</span></div>
            </div>
            <div className="mt-2 text-[8px] text-beige-dim normal-case flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" /> Source: Open-Meteo (weather + air)
            </div>
          </div>
        </div>
      </div>

      <div className="panel rivet-corner p-3 flex flex-col gap-3">
        <span className="rivet-tl" /><span className="rivet-tr" />

        <div>
          <div className="label-tape mb-2">ACTION HUB · REPORT AN ISSUE</div>
          <div className="flex gap-2">
            <input value={issue} onChange={(e) => setIssue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") deployIssue(); }} placeholder="Type the issue…" className="display-recessed px-2 py-2 flex-1 font-terminal text-[13px] text-phosphor outline-none normal-case" />
            <button onClick={deployIssue} className="btn-mech px-3 py-2 flex items-center gap-1"><Send className="w-3 h-3" /> DEPLOY</button>
          </div>
        </div>

        <div>
          <div className="text-[9px] tracking-[0.25em] text-beige-dim mb-1">DYNAMIC BROADCAST · {neighborhood.name.toUpperCase()}</div>
          <div className="grid grid-cols-1 gap-2">
            {dynamicBroadcasts.map((t) => (
              <button key={t} className="btn-mech px-2 py-2 text-left normal-case tracking-normal text-[10px]" onClick={() => broadcast(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] tracking-[0.25em] text-beige-dim mb-1">MISSION LOG</div>
          <div className="display-recessed p-2 font-terminal text-[12px] max-h-40 overflow-y-auto">
            {state.broadcastLog.length === 0 ? (
              <div className="text-beige-dim">— silent —</div>
            ) : state.broadcastLog.map((b, i) => (
              <div key={i} className="leading-tight normal-case">
                <span className="text-amber">[{new Date(b.ts).toLocaleTimeString().slice(0, 5)}]</span>{" "}
                {b.text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] tracking-[0.25em] text-beige-dim mb-1">ACTIVE PERSONNEL</div>
          <div className="grid grid-cols-1 gap-1 text-[11px] normal-case">
            {crew.map((n) => (
              <div key={n} className="flex items-center justify-between border-b border-border/40 py-0.5">
                <span>{n}</span><span className="led" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] tracking-[0.25em] text-beige-dim mb-1">PRIORITY MISSIONS · {neighborhood.name.toUpperCase()}</div>
          <div className="space-y-1 text-[10px] normal-case">
            {sectorMissions.length === 0 && <div className="text-beige-dim">No high-priority missions.</div>}
            {sectorMissions.map((m) => (
              <div key={m.id} className="border-l-2 border-alert pl-2">
                <div>{m.title}</div>
                <div className="text-beige-dim text-[9px]">{m.location}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
