import { useEffect, useState } from "react";
import { LogOut, MapPin } from "lucide-react";
import { Login } from "./Login";
import { Sidebar, type TabId } from "./Sidebar";
import { HubView } from "./HubView";
import { OpsView } from "./OpsView";
import { CommsView } from "./CommsView";
import { ToolkitView } from "./ToolkitView";
import { WellnessView } from "./WellnessView";
import { IrisGlitch } from "./IrisGlitch";
import { STATION } from "./types";
import { useStore } from "./store";
import { LocationProvider, useLocation } from "./LocationContext";

function Shell() {
  const { state, patch, hydrated } = useStore();
  const [tab, setTab] = useState<TabId>("hub");
  const { neighborhood, setNeighborhoodId, options } = useLocation();

  useEffect(() => {
    if (!state.operatorId) return;
    const t = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.loginTimestamp) / 1000);
      patch({ missionTime: elapsed });
    }, 1000);
    return () => window.clearInterval(t);
  }, [state.operatorId, state.loginTimestamp]);

  if (!hydrated) return null;

  if (!state.operatorId) {
    return (
      <Login
        onAuth={(username) => patch({ operatorId: username, missionTime: 0, loginTimestamp: Date.now() })}
      />
    );
  }

  const username = state.operatorId;
  const hh = Math.floor(state.missionTime / 3600).toString().padStart(2, "0");
  const mm = Math.floor((state.missionTime % 3600) / 60).toString().padStart(2, "0");
  const ss = (state.missionTime % 60).toString().padStart(2, "0");

  let view: React.ReactNode;
  if (tab === "hub")        view = <HubView      state={state} patch={patch} />;
  else if (tab === "ops")   view = <OpsView      state={state} patch={patch} />;
  else if (tab === "comms") view = <CommsView    state={state} patch={patch} operatorName={username} />;
  else if (tab === "tools") view = <ToolkitView  state={state} patch={patch} />;
  else                       view = <WellnessView state={state} patch={patch} />;

  return (
    <div
      className={`min-h-screen w-screen p-3 grid gap-3 ${state.alert ? "alert-mode" : ""}`}
      style={{ gridTemplateColumns: "120px 1fr", gridTemplateRows: "auto minmax(0, 1fr)", height: "100vh" }}
    >
      <header className="panel rivet-corner col-span-2 flex items-center px-4 py-2.5 gap-4 flex-wrap">
        <span className="rivet-tl" /><span className="rivet-tr" />
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl glow-amber leading-none">REPUBLIC<span className="text-beige">/</span>OS</span>
          <span className="text-[9px] tracking-[0.3em] text-beige-dim">v4.7.2</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="led" />
          <span className="text-[10px] tracking-[0.25em] text-beige-dim normal-case">{STATION}</span>
        </div>

        <label className="flex items-center gap-2 display-recessed px-2 py-1">
          <MapPin className="w-3 h-3 text-beige-dim" />
          <span className="text-[8px] tracking-[0.3em] text-beige-dim">SECTOR</span>
          <select
            value={neighborhood.id}
            onChange={(e) => setNeighborhoodId(e.target.value as typeof neighborhood.id)}
            className="bg-transparent text-phosphor font-terminal text-[13px] outline-none normal-case"
          >
            {options.map((n) => (
              <option key={n.id} value={n.id} className="bg-background text-foreground">{n.name}</option>
            ))}
          </select>
        </label>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-[8px] tracking-[0.3em] text-beige-dim">MISSION CLOCK</span>
            <span className="font-terminal text-[18px] glow-amber leading-none">T+ {hh}:{mm}:{ss}</span>
          </div>
          <div className="display-recessed px-3 py-1.5 hidden sm:flex flex-col items-end">
            <span className="text-[8px] tracking-[0.25em] text-beige-dim">ACTIVE SESSION</span>
            <span className="text-[11px] glow-phosphor leading-tight normal-case tracking-wide">{username} · {neighborhood.name}</span>
          </div>
          <button onClick={() => patch({ operatorId: null })} className="btn-mech px-3 py-2 flex items-center gap-1">
            <LogOut className="w-3 h-3" /> SIGN OFF
          </button>
        </div>
      </header>

      <Sidebar current={tab} onChange={setTab} alert={state.alert} toggleAlert={() => patch({ alert: !state.alert })} />

      <main className="min-h-0 min-w-0 overflow-y-auto">
        <IrisGlitch signal={`${tab}:${neighborhood.id}`}>
          <div className="pb-6">{view}</div>
        </IrisGlitch>
      </main>

      {state.alert && (
        <div className="pointer-events-none fixed inset-0 z-40" style={{ boxShadow: "inset 0 0 200px oklch(0.65 0.26 25 / 0.35)", animation: "tally 1.2s ease-in-out infinite" }} />
      )}
    </div>
  );
}

export function RepublicOS() {
  return (
    <LocationProvider>
      <Shell />
    </LocationProvider>
  );
}
