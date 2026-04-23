import { useEffect, useState } from "react";

export type Report   = { ts: number; kind: string; text: string };
export type LogItem  = { ts: number; from: string; text: string };
export type ChatMsg  = { ts: number; role: "you" | "ops"; text: string };
export type Stamp    = { ts: number; name: string; doc: string };
export type LostItem = { ts: number; kind: "LOST" | "FOUND"; text: string; by: string };
export type Carpool  = { ts: number; from: string; to: string; when: string; by: string };
export type Donor    = { ts: number; name: string; group: string; phone: string };
export type Event_   = { ts: number; title: string; where: string; when: string };
export type Petition = { id: string; title: string; signers: string[] };

export type AppState = {
  operatorId: string | null;
  alert: boolean;
  missionTime: number;
  loginTimestamp: number;
  joinedMissions: string[];
  borrowedTools: string[];
  votes: Record<string, "yea" | "nay" | null>;
  broadcastLog: LogItem[];
  commsLog: ChatMsg[];
  notes: string;
  fatigue: number;
  hydration: number;
  reports: Report[];
  stamps: Stamp[];
  lostFound: LostItem[];
  carpools: Carpool[];
  donors: Donor[];
  events: Event_[];
  petitions: Petition[];
};

export const initialState: AppState = {
  operatorId: null,
  alert: false,
  missionTime: 0,
  loginTimestamp: 0,
  joinedMissions: [],
  borrowedTools: [],
  votes: {},
  broadcastLog: [],
  commsLog: [
    { ts: Date.now(), role: "ops", text: "OPS online. How may I help, citizen?" },
  ],
  notes: "",
  fatigue: 22,
  hydration: 78,
  reports: [],
  stamps: [],
  lostFound: [
    { ts: Date.now() - 86400000, kind: "LOST", text: "Black wallet near Sector 12 market", by: "Anonymous" },
    { ts: Date.now() - 43200000, kind: "FOUND", text: "House keys at Sector 21 metro gate", by: "DMRC Staff" },
  ],
  carpools: [
    { ts: Date.now() - 3600000, from: "Sector 10", to: "Connaught Place", when: "Mon-Fri 9 AM", by: "Rohan" },
    { ts: Date.now() - 7200000, from: "Sector 23", to: "IGI T3",         when: "Daily 4 AM",   by: "Meera" },
  ],
  donors: [
    { ts: Date.now(), name: "Aditya S.", group: "O+", phone: "Call OPS to reveal" },
    { ts: Date.now(), name: "Kavya N.",  group: "B-", phone: "Call OPS to reveal" },
  ],
  events: [
    { ts: Date.now(), title: "RWA Open Meeting · Sector 12", where: "Community Hall",  when: "Sat 6 PM" },
    { ts: Date.now(), title: "Plant a Tree Drive",            where: "Sector 11 Park", when: "Sun 7 AM" },
  ],
  petitions: [
    { id: "PET-01", title: "Speed bumps near Sector 9 school", signers: [] },
    { id: "PET-02", title: "Cover open drain on Pankha Road",   signers: [] },
  ],
};

const KEY = "republic-os.v4";

function load(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw);
    return { ...initialState, ...saved };
  } catch {
    return initialState;
  }
}

function save(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function useStore() {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(state);
  }, [state, hydrated]);

  function patch(p: Partial<AppState>) {
    setState((s) => ({ ...s, ...p }));
  }

  return { state, patch, hydrated };
}
