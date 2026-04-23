import { useEffect, useState, type ReactNode } from "react";

export function IrisGlitch({ signal, children }: { signal: string; children: ReactNode }) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setGlitch(true);
    const t = window.setTimeout(() => setGlitch(false), 260);
    return () => window.clearTimeout(t);
  }, [signal]);

  return (
    <div className="relative w-full h-full">
      <div key={signal} className="iris-open w-full h-full">
        {children}
      </div>
      {glitch && <div className="glitch-overlay" />}
    </div>
  );
}
