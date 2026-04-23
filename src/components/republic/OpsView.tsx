import { useMemo, useState } from "react";
import { Search, Users, Wrench, Vote, FileText, Download } from "lucide-react";
import { MISSIONS, PROPOSALS, RECORDS, TOOL_KIT, randomCrewName } from "./types";
import type { AppState } from "./store";
import { useLocation } from "./LocationContext";

export function OpsView({
  state, patch,
}: {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
}) {
  const [tab, setTab] = useState<"missions" | "tools" | "records" | "vote">("missions");
  const [q, setQ] = useState("");
  const { neighborhood } = useLocation();

  const filteredMissions = useMemo(
    () => MISSIONS.filter((m) => m.sector === neighborhood.id),
    [neighborhood.id],
  );

  const filteredRecords = useMemo(
    () => RECORDS.filter((r) => r.sector === neighborhood.id).filter((r) =>
      [r.title, r.tag, String(r.year)].join(" ").toLowerCase().includes(q.toLowerCase()),
    ),
    [q, neighborhood.id],
  );

  function toggleMission(id: string) {
    const has = state.joinedMissions.includes(id);
    patch({ joinedMissions: has ? state.joinedMissions.filter((x) => x !== id) : [...state.joinedMissions, id] });
  }

  function toggleTool(id: string) {
    const has = state.borrowedTools.includes(id);
    patch({ borrowedTools: has ? state.borrowedTools.filter((x) => x !== id) : [...state.borrowedTools, id] });
  }

  function vote(id: string, v: "yea" | "nay") {
    const cur = state.votes[id];
    patch({ votes: { ...state.votes, [id]: cur === v ? null : v } });
  }

  function tabBtn(id: typeof tab, label: string) {
    return (
      <button onClick={() => setTab(id)} className={`btn-mech px-3 py-1.5 ${tab === id ? "is-active" : ""}`}>
        {label}
      </button>
    );
  }

  return (
    <div className="panel rivet-corner p-3">
      <span className="rivet-tl" /><span className="rivet-tr" />
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="label-tape">FIELD WORK & PUBLIC RECORDS · {neighborhood.name.toUpperCase()}</div>
        <div className="flex gap-1">
          {tabBtn("missions", "Missions")}
          {tabBtn("tools",    "Tool Loans")}
          {tabBtn("records",  "Records")}
          {tabBtn("vote",     "Vote")}
        </div>
      </div>

      {tab === "missions" && (
        <div className="space-y-2">
          {filteredMissions.length === 0 && <div className="text-beige-dim text-[11px]">No active missions in {neighborhood.name}.</div>}
          {filteredMissions.map((m) => {
            const joined = state.joinedMissions.includes(m.id);
            return (
              <div key={m.id} className="panel p-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[9px] text-beige-dim tracking-[0.2em]">
                      {m.id} · {m.category} ·{" "}
                      <span className={m.priority === "HIGH" ? "glow-alert" : m.priority === "MED" ? "glow-amber" : "glow-phosphor"}>
                        {m.priority}
                      </span>
                    </div>
                    <div className="font-terminal text-[16px] glow-amber mt-0.5 normal-case">{m.title}</div>
                    <div className="text-[10px] text-beige-dim normal-case">{m.location}</div>
                    <div className="text-[11px] mt-1 normal-case">{m.details}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] flex items-center gap-1">
                      <Users className="w-3 h-3" /> {(joined ? 1 : 0) + (m.id.charCodeAt(4) % m.needCrew)}/{m.needCrew}
                    </span>
                    <button onClick={() => toggleMission(m.id)} className={`btn-mech px-3 py-1.5 ${joined ? "is-active" : ""}`}>
                      {joined ? "WITHDRAW" : "JOIN"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "tools" && (
        <div>
          <div className="text-[10px] text-beige-dim normal-case mb-2">
            Borrowed: {state.borrowedTools.length} / {TOOL_KIT.length}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {TOOL_KIT.map((t) => {
              const out = state.borrowedTools.includes(t.id);
              return (
                <div key={t.id} className="panel p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 normal-case text-[12px]">
                    <Wrench className="w-3 h-3 text-amber" /> {t.name}
                    <span className={`text-[9px] ml-1 ${out ? "glow-alert" : "glow-phosphor"}`}>
                      {out ? "OUT" : "READY"}
                    </span>
                  </div>
                  <button onClick={() => toggleTool(t.id)} className={`btn-mech px-3 py-1.5 ${out ? "is-active" : ""}`}>
                    {out ? "RETURN" : "BORROW"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "records" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-3 h-3 text-beige-dim" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search records..."
              className="display-recessed px-2 py-1.5 flex-1 font-terminal text-[13px] text-phosphor outline-none normal-case"
            />
          </div>
          <div className="space-y-1">
            {filteredRecords.map((r) => (
              <div key={r.id} className="panel p-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 normal-case">
                  <FileText className="w-3 h-3 text-amber" />
                  <span className="text-[12px]">{r.title}</span>
                  <span className="text-[9px] text-beige-dim tracking-[0.2em]">{r.tag} · {r.year}</span>
                </div>
                <button
                  className="btn-mech px-2 py-1 flex items-center gap-1"
                  onClick={() => {
                    const blob = new Blob(
                      [`Record: ${r.title}\nID: ${r.id}\nYear: ${r.year}\nTag: ${r.tag}`],
                      { type: "text/plain" },
                    );
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${r.id}.txt`;
                    a.click();
                  }}
                >
                  <Download className="w-3 h-3" /> Get
                </button>
              </div>
            ))}
            {filteredRecords.length === 0 && <div className="text-beige-dim text-[11px]">No matches.</div>}
          </div>
        </div>
      )}

      {tab === "vote" && (
        <div className="space-y-3">
          {PROPOSALS.map((p) => {
            const cast = state.votes[p.id];
            const seed = p.id.charCodeAt(p.id.length - 1);
            const yea = (seed * 7) % 60 + 20 + (cast === "yea" ? 1 : 0);
            const nay = (seed * 5) % 40 + 10 + (cast === "nay" ? 1 : 0);
            const pct = Math.round((yea / (yea + nay)) * 100);
            return (
              <div key={p.id} className="panel p-3">
                <div className="text-[9px] text-beige-dim tracking-[0.2em]">{p.id} · COMMUNITY PROPOSAL</div>
                <div className="font-terminal text-[15px] glow-amber normal-case">{p.title}</div>
                <div className="text-[11px] mt-1 normal-case">{p.body}</div>
                <div className="mt-2">
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1 text-beige-dim">
                    <span>YEA {yea}</span><span>{pct}%</span><span>NAY {nay}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => vote(p.id, "yea")} className={`btn-mech px-3 py-1.5 ${cast === "yea" ? "is-active" : ""}`}>
                    <Vote className="w-3 h-3 inline mr-1" /> YEA
                  </button>
                  <button onClick={() => vote(p.id, "nay")} className={`btn-mech px-3 py-1.5 ${cast === "nay" ? "is-active" : ""}`}>
                    <Vote className="w-3 h-3 inline mr-1" /> NAY
                  </button>
                  <span className="text-[10px] text-beige-dim self-center">By {randomCrewName()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
