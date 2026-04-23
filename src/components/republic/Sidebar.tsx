import { LayoutGrid, Wrench, Radio, ShieldAlert, Boxes, HeartPulse } from "lucide-react";

export type TabId = "hub" | "ops" | "comms" | "tools" | "wellness";

const TABS: { id: TabId; label: string; sub: string; Icon: typeof LayoutGrid }[] = [
  { id: "hub",      label: "MAIN HUB",        sub: "01", Icon: LayoutGrid },
  { id: "ops",      label: "FIELD & RECORDS", sub: "02", Icon: Wrench },
  { id: "comms",    label: "HELP DESK",       sub: "03", Icon: Radio },
  { id: "tools",    label: "TOOLKIT",         sub: "04", Icon: Boxes },
  { id: "wellness", label: "WELLNESS",        sub: "05", Icon: HeartPulse },
];

export function Sidebar({
  current,
  onChange,
  alert,
  toggleAlert,
}: {
  current: TabId;
  onChange: (t: TabId) => void;
  alert: boolean;
  toggleAlert: () => void;
}) {
  return (
    <aside className="panel rivet-corner flex flex-col p-3 gap-3">
      <span className="rivet-tl" /><span className="rivet-tr" />
      <div className="text-center pb-2 border-b border-border">
        <div className="font-display text-[11px] glow-amber leading-none">R/OS</div>
        <div className="text-[8px] tracking-[0.3em] text-beige-dim mt-1">NAV · 01</div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {TABS.map(({ id, label, sub, Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`sidebar-tile ${active ? "is-active" : ""}`}
              aria-pressed={active}
            >
              <Icon className="w-5 h-5" strokeWidth={1.6} />
              <div className="text-center leading-tight">
                <div className="text-[9px] font-bold tracking-[0.15em]">{label}</div>
                <div className="text-[8px] opacity-60 mt-0.5">CH-{sub}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="pt-3 border-t border-border flex flex-col items-center gap-2">
        <span className="text-[8px] tracking-[0.25em] text-beige-dim text-center leading-tight">
          CRISIS<br />MODE
        </span>
        <button
          onClick={toggleAlert}
          aria-pressed={alert}
          className={`w-12 h-12 rounded-full border-4 transition-all flex items-center justify-center ${
            alert
              ? "border-alert bg-alert shadow-[0_0_20px_var(--alert-glow)]"
              : "border-bezel-light bg-bezel-dark hover:bg-bezel"
          }`}
          style={{
            background: alert
              ? "radial-gradient(circle at 30% 30%, oklch(0.78 0.27 27), oklch(0.4 0.22 25))"
              : undefined,
          }}
        >
          <ShieldAlert
            className={`w-5 h-5 ${alert ? "text-background" : "text-beige-dim"}`}
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
}
