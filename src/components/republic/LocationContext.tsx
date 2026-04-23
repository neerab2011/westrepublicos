import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { NEIGHBORHOODS, neighborhoodById, type Neighborhood, type NeighborhoodId } from "./SectorEngine";

type Ctx = {
  neighborhood: Neighborhood;
  setNeighborhoodId: (id: NeighborhoodId) => void;
  options: Neighborhood[];
};

const LocationCtx = createContext<Ctx | null>(null);
const KEY = "republic.neighborhoodId";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<NeighborhoodId>(() => {
    if (typeof window === "undefined") return "dwarka";
    const saved = window.localStorage.getItem(KEY) as NeighborhoodId | null;
    return saved && NEIGHBORHOODS.some((n) => n.id === saved) ? saved : "dwarka";
  });

  useEffect(() => {
    try { window.localStorage.setItem(KEY, id); } catch { /* ignore */ }
  }, [id]);

  const setNeighborhoodId = useCallback((n: NeighborhoodId) => setId(n), []);

  const value = useMemo<Ctx>(() => ({
    neighborhood: neighborhoodById(id),
    setNeighborhoodId,
    options: NEIGHBORHOODS,
  }), [id, setNeighborhoodId]);

  return <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>;
}

export function useLocation(): Ctx {
  const c = useContext(LocationCtx);
  if (!c) throw new Error("useLocation must be used inside LocationProvider");
  return c;
}
