import { useEffect, useRef, useState } from "react";
import { X, Play, Square } from "lucide-react";
import { TOOLS, type Tool } from "./types";
import type { AppState } from "./store";
import { useSectorLive } from "./SectorEngine";
import { useLocation } from "./LocationContext";

function calculate(expr: string): string {
  if (!expr.trim()) return "0";
  if (!/^[\d+\-*/().\s]+$/.test(expr)) return "—";
  const tokens: (number | string)[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " ") { i++; continue; }
    if ("+-*/()".includes(c)) { tokens.push(c); i++; continue; }
    let num = "";
    while (i < expr.length && /[\d.]/.test(expr[i])) { num += expr[i]; i++; }
    if (num === "") return "—";
    tokens.push(parseFloat(num));
  }
  const out: (number | string)[] = [];
  const ops: string[] = [];
  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };
  for (const t of tokens) {
    if (typeof t === "number") out.push(t);
    else if (t === "(") ops.push(t);
    else if (t === ")") { while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop() as string); if (!ops.length) return "—"; ops.pop(); }
    else { while (ops.length && ops[ops.length - 1] !== "(" && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop() as string); ops.push(t); }
  }
  while (ops.length) { const o = ops.pop() as string; if (o === "(") return "—"; out.push(o); }
  const stack: number[] = [];
  for (const t of out) {
    if (typeof t === "number") stack.push(t);
    else { const b = stack.pop(); const a = stack.pop(); if (a === undefined || b === undefined) return "—"; if (t === "+") stack.push(a + b); else if (t === "-") stack.push(a - b); else if (t === "*") stack.push(a * b); else if (t === "/") stack.push(b === 0 ? NaN : a / b); }
  }
  if (stack.length !== 1 || !Number.isFinite(stack[0])) return "—";
  return String(Math.round(stack[0] * 1e6) / 1e6);
}

function nasaDate(d = new Date()): string {
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `T+ ${d.getDate().toString().padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()} · ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")} IST`;
}

function beep() {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = W.AudioContext || W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = 880;
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start(); osc.stop(ctx.currentTime + 0.65);
  } catch { /* ignore */ }
}

export function ToolkitView({ state, patch }: { state: AppState; patch: (p: Partial<AppState>) => void }) {
  const [open, setOpen] = useState<Tool | null>(null);
  const { neighborhood } = useLocation();
  const { snap: live, refresh } = useSectorLive(neighborhood, 60000);
  const [calc, setCalc] = useState("12 * (3 + 4)");
  const [reportText, setReportText] = useState("");
  const [reportKind, setReportKind] = useState("Pothole");
  const [signName, setSignName] = useState("");
  const [signDoc, setSignDoc] = useState("RWA No-Objection Letter");
  const [lfKind, setLfKind] = useState<"LOST" | "FOUND">("LOST");
  const [lfText, setLfText] = useState("");
  const [cpFrom, setCpFrom] = useState(""); const [cpTo, setCpTo] = useState(""); const [cpWhen, setCpWhen] = useState("");
  const [dnName, setDnName] = useState(""); const [dnGroup, setDnGroup] = useState("O+"); const [dnPhone, setDnPhone] = useState("");
  const [evTitle, setEvTitle] = useState(""); const [evWhere, setEvWhere] = useState(""); const [evWhen, setEvWhen] = useState("");
  const [focusMin, setFocusMin] = useState(25);
  const [focusLeft, setFocusLeft] = useState<number | null>(null);
  const focusRef = useRef<number | null>(null);
  useEffect(() => { if (focusLeft === null) return; if (focusLeft <= 0) { beep(); setFocusLeft(null); return; } focusRef.current = window.setTimeout(() => setFocusLeft((s) => (s === null ? null : s - 1)), 1000); return () => { if (focusRef.current) window.clearTimeout(focusRef.current); }; }, [focusLeft]);
  const [hydLeft, setHydLeft] = useState<number | null>(null);
  const hydRef = useRef<number | null>(null);
  useEffect(() => { if (hydLeft === null) return; if (hydLeft <= 0) { beep(); setHydLeft(null); return; } hydRef.current = window.setTimeout(() => setHydLeft((s) => (s === null ? null : s - 1)), 1000); return () => { if (hydRef.current) window.clearTimeout(hydRef.current); }; }, [hydLeft]);

  function fmt(s: number | null, fallback = "00:00") { if (s === null) return fallback; return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`; }
  function submitReport() { if (!reportText.trim()) return; patch({ reports: [{ ts: Date.now(), kind: reportKind, text: reportText.trim() }, ...state.reports].slice(0, 50), broadcastLog: [{ ts: Date.now(), from: "OPS", text: `${reportKind.toUpperCase()} REPORT · ${reportText.trim()}` }, ...state.broadcastLog].slice(0, 30) }); setReportText(""); }
  function stampDoc() { if (!signName.trim()) return; patch({ stamps: [{ ts: Date.now(), name: signName.trim(), doc: signDoc }, ...state.stamps].slice(0, 50) }); setSignName(""); }
  function addLF() { if (!lfText.trim()) return; patch({ lostFound: [{ ts: Date.now(), kind: lfKind, text: lfText.trim(), by: "You" }, ...state.lostFound].slice(0, 30) }); setLfText(""); }
  function addCarpool() { if (!cpFrom.trim() || !cpTo.trim()) return; patch({ carpools: [{ ts: Date.now(), from: cpFrom.trim(), to: cpTo.trim(), when: cpWhen.trim() || "Flexible", by: "You" }, ...state.carpools].slice(0, 30) }); setCpFrom(""); setCpTo(""); setCpWhen(""); }
  function addDonor() { if (!dnName.trim() || !dnPhone.trim()) return; patch({ donors: [{ ts: Date.now(), name: dnName.trim(), group: dnGroup, phone: dnPhone.trim() }, ...state.donors].slice(0, 30) }); setDnName(""); setDnPhone(""); }
  function addEvent() { if (!evTitle.trim()) return; patch({ events: [{ ts: Date.now(), title: evTitle.trim(), where: evWhere.trim() || "TBD", when: evWhen.trim() || "TBD" }, ...state.events].slice(0, 30) }); setEvTitle(""); setEvWhere(""); setEvWhen(""); }
  function signPetition(id: string) { patch({ petitions: state.petitions.map((p) => p.id === id && !p.signers.includes("You") ? { ...p, signers: [...p.signers, "You"] } : p) }); }

  const groups = Array.from(new Set(TOOLS.map((t) => t.group)));

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g} className="panel rivet-corner p-3">
          <span className="rivet-tl" /><span className="rivet-tr" />
          <div className="label-tape mb-2">{g.toUpperCase()}</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {TOOLS.filter((t) => t.group === g).map((t) => (
              <button key={t.id} onClick={() => setOpen(t)} className="btn-mech px-2 py-3 text-left normal-case tracking-normal text-[11px]">{t.label}</button>
            ))}
          </div>
        </div>
      ))}

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/80 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="panel rivet-corner p-4 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <span className="rivet-tl" /><span className="rivet-tr" />
            <div className="flex items-center justify-between mb-2">
              <div className="label-tape">{open.label}</div>
              <button onClick={() => setOpen(null)} className="btn-mech p-1"><X className="w-3 h-3" /></button>
            </div>

            {open.id === "calc" && (<div><input value={calc} onChange={(e) => setCalc(e.target.value)} className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><div className="font-terminal text-2xl glow-amber mt-2">= {calculate(calc)}</div><div className="grid grid-cols-4 gap-1 mt-2">{["7","8","9","/","4","5","6","*","1","2","3","-","0",".","(","+"].map((k) => (<button key={k} className="btn-mech py-2" onClick={() => setCalc((c) => c + k)}>{k}</button>))}<button className="btn-mech py-2 col-span-2" onClick={() => setCalc("")}>CLEAR</button><button className="btn-mech py-2 col-span-2" onClick={() => setCalc((c) => c.slice(0, -1))}>DEL</button></div></div>)}
            {open.id === "notes" && (<textarea value={state.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Your notes are saved on this device…" className="display-recessed px-2 py-2 w-full h-40 font-terminal text-phosphor outline-none normal-case text-[13px]" />)}
            {open.id === "timer" && (<div className="space-y-2"><div className="display-recessed p-4 text-center"><div className="font-terminal text-4xl glow-amber leading-none">{fmt(focusLeft, `${focusMin.toString().padStart(2, "0")}:00`)}</div></div><div className="flex items-center gap-2"><span className="text-[10px] text-beige-dim normal-case">Minutes:</span><input type="number" min={1} max={120} value={focusMin} onChange={(e) => setFocusMin(Math.max(1, Math.min(120, Number(e.target.value) || 1)))} className="display-recessed px-2 py-1 w-20 font-terminal text-phosphor outline-none" /><button onClick={() => setFocusLeft(focusMin * 60)} className="btn-mech px-3 py-1.5 flex items-center gap-1 ml-auto"><Play className="w-3 h-3" /> START</button><button onClick={() => setFocusLeft(null)} className="btn-mech px-3 py-1.5 flex items-center gap-1"><Square className="w-3 h-3" /> STOP</button></div></div>)}
            {open.id === "hydration" && (<div className="space-y-2"><div className="display-recessed p-4 text-center"><div className="font-terminal text-4xl glow-amber leading-none">{fmt(hydLeft, "20:00")}</div><div className="text-[10px] text-beige-dim mt-2 normal-case">{hydLeft === null ? "20-minute countdown." : "Counting down…"}</div></div><div className="flex gap-2"><button onClick={() => setHydLeft(20 * 60)} className="btn-mech px-3 py-2 flex-1 flex items-center justify-center gap-1"><Play className="w-3 h-3" /> START</button><button onClick={() => setHydLeft(null)} className="btn-mech px-3 py-2 flex-1 flex items-center justify-center gap-1"><Square className="w-3 h-3" /> STOP</button><button onClick={beep} className="btn-mech px-3 py-2">TEST</button></div></div>)}
            {open.id === "signer" && (<div className="space-y-2"><select value={signDoc} onChange={(e) => setSignDoc(e.target.value)} className="display-recessed px-2 py-1.5 w-full text-[12px]">{["RWA No-Objection Letter","Address Proof Slip","Volunteer Pledge","Tanker Receipt","Event Permission"].map((d) => <option key={d}>{d}</option>)}</select><input value={signName} onChange={(e) => setSignName(e.target.value)} placeholder="Type your full name…" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><button onClick={stampDoc} className="btn-mech px-3 py-2 w-full">STAMP DOCUMENT</button>{state.stamps.length > 0 && (<div className="display-recessed p-2 max-h-40 overflow-y-auto font-terminal text-[12px]">{state.stamps.map((s, i) => (<div key={i} className="leading-tight normal-case border-b border-border/40 py-1"><div className="glow-amber">{s.doc}</div><div>Signed by: {s.name}</div><div className="text-beige-dim text-[10px]">{nasaDate(new Date(s.ts))}</div></div>))}</div>)}</div>)}
            {open.id === "report" && (<div className="space-y-2"><select value={reportKind} onChange={(e) => setReportKind(e.target.value)} className="display-recessed px-2 py-1.5 w-full text-[12px]">{["Pothole","Garbage","Street Light","Water Leak","Stray Animal","Power Outage"].map((k) => <option key={k}>{k}</option>)}</select><textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Describe the problem and location…" className="display-recessed px-2 py-2 w-full h-24 text-[13px] normal-case font-terminal text-phosphor outline-none" /><button onClick={submitReport} className="btn-mech px-3 py-2 w-full">FILE REPORT</button>{state.reports.length > 0 && (<div className="display-recessed p-2 max-h-40 overflow-y-auto font-terminal text-[12px]">{state.reports.map((r, i) => (<div key={i} className="leading-tight normal-case"><span className="text-amber">[{r.kind}]</span> {r.text}</div>))}</div>)}</div>)}
            {open.id === "petition" && (<div className="space-y-2">{state.petitions.map((p) => { const signed = p.signers.includes("You"); return (<div key={p.id} className="panel p-2"><div className="text-[9px] text-beige-dim tracking-[0.2em]">{p.id}</div><div className="text-[12px] normal-case">{p.title}</div><div className="flex items-center justify-between mt-1"><span className="text-[10px] text-beige-dim normal-case">{p.signers.length} signer{p.signers.length === 1 ? "" : "s"}</span><button disabled={signed} onClick={() => signPetition(p.id)} className={`btn-mech px-3 py-1.5 ${signed ? "is-active" : ""}`}>{signed ? "SIGNED" : "SIGN"}</button></div></div>); })}</div>)}
            {open.id === "lostfound" && (<div className="space-y-2"><div className="flex gap-1"><button onClick={() => setLfKind("LOST")} className={`btn-mech px-3 py-1.5 flex-1 ${lfKind === "LOST" ? "is-active" : ""}`}>I LOST</button><button onClick={() => setLfKind("FOUND")} className={`btn-mech px-3 py-1.5 flex-1 ${lfKind === "FOUND" ? "is-active" : ""}`}>I FOUND</button></div><input value={lfText} onChange={(e) => setLfText(e.target.value)} placeholder="What and where?" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><button onClick={addLF} className="btn-mech px-3 py-2 w-full">POST</button><div className="display-recessed p-2 max-h-48 overflow-y-auto text-[12px]">{state.lostFound.map((l, i) => (<div key={i} className="leading-tight normal-case border-b border-border/40 py-1"><span className={l.kind === "LOST" ? "glow-alert" : "glow-phosphor"}>[{l.kind}]</span> {l.text}<div className="text-beige-dim text-[10px]">By {l.by}</div></div>))}</div></div>)}
            {open.id === "carpool" && (<div className="space-y-2"><input value={cpFrom} onChange={(e) => setCpFrom(e.target.value)} placeholder="From" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><input value={cpTo} onChange={(e) => setCpTo(e.target.value)} placeholder="To" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><input value={cpWhen} onChange={(e) => setCpWhen(e.target.value)} placeholder="When" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><button onClick={addCarpool} className="btn-mech px-3 py-2 w-full">OFFER RIDE</button><div className="display-recessed p-2 max-h-40 overflow-y-auto text-[12px]">{state.carpools.map((c, i) => (<div key={i} className="leading-tight normal-case border-b border-border/40 py-1"><div><span className="glow-amber">{c.from}</span> → <span className="glow-amber">{c.to}</span></div><div className="text-beige-dim text-[10px]">{c.when} · By {c.by}</div></div>))}</div></div>)}
            {open.id === "blood" && (<div className="space-y-2"><input value={dnName} onChange={(e) => setDnName(e.target.value)} placeholder="Your name" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><select value={dnGroup} onChange={(e) => setDnGroup(e.target.value)} className="display-recessed px-2 py-1.5 w-full text-[12px]">{["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((g) => <option key={g}>{g}</option>)}</select><input value={dnPhone} onChange={(e) => setDnPhone(e.target.value)} placeholder="Phone number" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><button onClick={addDonor} className="btn-mech px-3 py-2 w-full">ADD ME</button><div className="display-recessed p-2 max-h-40 overflow-y-auto text-[12px]">{state.donors.map((d, i) => (<div key={i} className="flex justify-between border-b border-border/40 py-1 normal-case"><span>{d.name} · <span className="glow-amber">{d.group}</span></span><span className="text-beige-dim text-[10px]">{d.phone}</span></div>))}</div></div>)}
            {open.id === "events" && (<div className="space-y-2"><input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Event title" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><input value={evWhere} onChange={(e) => setEvWhere(e.target.value)} placeholder="Where" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><input value={evWhen} onChange={(e) => setEvWhen(e.target.value)} placeholder="When" className="display-recessed px-2 py-2 w-full font-terminal text-phosphor outline-none normal-case" /><button onClick={addEvent} className="btn-mech px-3 py-2 w-full">ADD EVENT</button><div className="display-recessed p-2 max-h-40 overflow-y-auto text-[12px]">{state.events.map((ev, i) => (<div key={i} className="leading-tight normal-case border-b border-border/40 py-1"><div className="glow-amber">{ev.title}</div><div className="text-beige-dim text-[10px]">{ev.where} · {ev.when}</div></div>))}</div></div>)}
            {open.id === "weather" && (<div className="font-terminal text-[14px] space-y-1"><div>Temperature: <span className="glow-amber">{live.tempC}°C</span></div><div>Humidity: <span className="glow-amber">{live.humidity}%</span></div><div>Wind: <span className="glow-amber">{live.windKmh} km/h</span></div><div>Conditions: <span className="glow-phosphor normal-case">{live.conditions}</span></div><div className="text-[10px] text-beige-dim normal-case mt-2">Source: {live.source === "LIVE" ? `Open-Meteo · ${live.neighborhoodName}` : "Local simulation"}</div>{live.weatherAlert && <div className="glow-alert mt-2 normal-case">{live.weatherAlert}</div>}<button onClick={refresh} className="btn-mech px-3 py-2 mt-2 w-full">REFRESH</button></div>)}
            {open.id === "aqi" && (<div className="font-terminal text-[14px] space-y-1"><div>AQI: <span className="glow-amber">{live.aqi}</span> · {live.aqiCategory}</div><div>PM 2.5: {live.pm25} µg/m³</div><div>PM 10: {live.pm10} µg/m³</div><div className="text-[10px] text-beige-dim mt-2 normal-case">{live.neighborhoodName}</div><button onClick={refresh} className="btn-mech px-3 py-2 mt-2 w-full">REFRESH</button></div>)}
            {open.id === "traffic" && (<div className="space-y-1 text-[11px] normal-case">{live.congestion.map((c) => (<div key={c.road} className="flex justify-between border-b border-border/40 py-1"><span>{c.road}</span><span className={c.level > 75 ? "glow-alert" : c.level > 55 ? "glow-amber" : "glow-phosphor"}>{c.level}</span></div>))}<button onClick={refresh} className="btn-mech px-3 py-2 mt-2 w-full">REFRESH</button></div>)}
            {open.id === "power" && (<div className="font-terminal text-[14px] space-y-1"><div>Frequency: <span className="glow-amber">{live.gridFreqHz} Hz</span></div><div>Load: <span className="glow-amber">{live.gridLoadMW} MW</span></div><div>Outage Risk: <span className={live.outageRisk === "HIGH" ? "glow-alert" : "glow-phosphor"}>{live.outageRisk}</span></div><button onClick={refresh} className="btn-mech px-3 py-2 mt-2 w-full">REFRESH</button></div>)}
            {(open.id === "police" || open.id === "fire" || open.id === "ambulance" || open.id === "women" || open.id === "child" || open.id === "cyber") && (<div><div className="font-terminal text-3xl glow-amber text-center py-3">Dial: {open.label.split(":")[1]?.trim()}</div><a href={`tel:${open.label.split(":")[1]?.trim()}`} className="btn-mech px-3 py-2 w-full text-center block">CALL NOW</a></div>)}
          </div>
        </div>
      )}
    </div>
  );
}
