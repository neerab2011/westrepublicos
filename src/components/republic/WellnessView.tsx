import { useEffect, useRef, useState } from "react";
import { Droplet, HeartPulse, Bell, Play, Square } from "lucide-react";
import type { AppState } from "./store";

function beep() {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = W.AudioContext || W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch { /* ignore */ }
}

const TWENTY_MIN = 20 * 60;

export function WellnessView({
  state, patch,
}: {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}) {
  const [secsLeft, setSecsLeft] = useState<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => {
      patch({
        fatigue:   Math.min(100, state.fatigue + 0.4),
        hydration: Math.max(0,   state.hydration - 0.3),
      });
    }, 8000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fatigue, state.hydration]);

  useEffect(() => {
    if (secsLeft === null) return;
    if (secsLeft <= 0) {
      beep();
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { (navigator as Navigator & { vibrate?: (p: number) => void }).vibrate?.(400); } catch { /* ignore */ }
      }
      setSecsLeft(null);
      return;
    }
    tickRef.current = window.setTimeout(() => setSecsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [secsLeft]);

  function fmt(s: number | null) {
    if (s === null) return "20:00";
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="panel rivet-corner p-3">
        <span className="rivet-tl" /><span className="rivet-tr" />
        <div className="label-tape mb-3">YOUR VITALS</div>
        <div className="space-y-3 text-[12px] normal-case">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Fatigue</span>
              <span>{Math.round(state.fatigue)}%</span>
            </div>
            <div className="meter-track">
              <div className={`meter-fill ${state.fatigue > 70 ? "alert" : "amber"}`} style={{ width: `${state.fatigue}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1"><Droplet className="w-3 h-3" /> Hydration</span>
              <span>{Math.round(state.hydration)}%</span>
            </div>
            <div className="meter-track">
              <div className={`meter-fill ${state.hydration < 30 ? "alert" : ""}`} style={{ width: `${state.hydration}%` }} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => patch({ hydration: Math.min(100, state.hydration + 18) })} className="btn-mech px-3 py-2 flex-1">DRINK WATER</button>
          <button onClick={() => patch({ fatigue:   Math.max(0,   state.fatigue - 22) })}    className="btn-mech px-3 py-2 flex-1">REST 5 MIN</button>
        </div>
      </div>

      <div className="panel rivet-corner p-3">
        <span className="rivet-tl" /><span className="rivet-tr" />
        <div className="label-tape mb-3 flex items-center gap-2"><Bell className="w-3 h-3" /> HYDRATION ALARM · 20 MIN</div>
        <div className="display-recessed p-4 text-center">
          <div className="font-terminal text-5xl glow-amber leading-none">{fmt(secsLeft)}</div>
          <div className="text-[10px] text-beige-dim mt-2 normal-case">
            {secsLeft === null ? "Press START to begin a 20-minute countdown." : "Beep will sound when timer ends."}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setSecsLeft(TWENTY_MIN)} className="btn-mech px-3 py-2 flex-1 flex items-center justify-center gap-1">
            <Play className="w-3 h-3" /> START
          </button>
          <button onClick={() => setSecsLeft(null)} className="btn-mech px-3 py-2 flex-1 flex items-center justify-center gap-1">
            <Square className="w-3 h-3" /> STOP
          </button>
          <button onClick={beep} className="btn-mech px-3 py-2">TEST BEEP</button>
        </div>
      </div>
    </div>
  );
}
