import { useEffect, useState, useCallback } from "react";

export type NeighborhoodId =
  | "dwarka"
  | "janakpuri"
  | "vikaspuri"
  | "rajouri-garden"
  | "punjabi-bagh"
  | "tilak-nagar";

export type Neighborhood = {
  id: NeighborhoodId;
  name: string;
  station: string;
  lat: number;
  lon: number;
  waqiStation: string;
};

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "dwarka",         name: "Dwarka",         station: "Dwarka Sector 8 · DPCC",         lat: 28.5921, lon: 77.0460, waqiStation: "@8580" },
  { id: "janakpuri",      name: "Janakpuri",      station: "Janakpuri District Centre",      lat: 28.6219, lon: 77.0878, waqiStation: "@10112" },
  { id: "vikaspuri",      name: "Vikaspuri",      station: "Vikaspuri Block A",              lat: 28.6427, lon: 77.0732, waqiStation: "@10125" },
  { id: "rajouri-garden", name: "Rajouri Garden", station: "Rajouri Garden Metro Hub",       lat: 28.6492, lon: 77.1228, waqiStation: "@10124" },
  { id: "punjabi-bagh",   name: "Punjabi Bagh",   station: "Punjabi Bagh · CPCB",            lat: 28.6742, lon: 77.1313, waqiStation: "@11277" },
  { id: "tilak-nagar",    name: "Tilak Nagar",    station: "Tilak Nagar Market Monitor",     lat: 28.6396, lon: 77.0973, waqiStation: "@10122" },
];

export function neighborhoodById(id: NeighborhoodId): Neighborhood {
  return NEIGHBORHOODS.find((n) => n.id === id) ?? NEIGHBORHOODS[0];
}

function getWaqiToken(): string {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("republic.waqiToken") || "";
  }
  return "";
}

const pmBuffers: Record<string, { pm25: number[]; pm10: number[] }> = {};
function smooth(buf: number[], v: number, keep = 3): number {
  buf.push(v);
  while (buf.length > keep) buf.shift();
  return buf.reduce((s, x) => s + x, 0) / buf.length;
}

export type DwarkaSnapshot = {
  station: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKmh: number;
  windDir: string;
  pressureHpa: number;
  precipMm: number;
  uvIndex: number;
  cloudPct: number;
  visibilityKm: number;
  sunrise: string;
  sunset: string;
  conditions: string;
  aqi: number;
  aqiCategory: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  gridLoadMW: number;
  gridFreqHz: number;
  outageRisk: "LOW" | "MED" | "HIGH";
  trafficIndex: number;
  congestion: { road: string; level: number }[];
  metroOk: boolean;
  waterOk: boolean;
  weatherAlert: string | null;
  fetchedAt: number;
  source: "LIVE" | "SIM";
  liveFields: string[];
  neighborhoodId: NeighborhoodId;
  neighborhoodName: string;
};

function aqiCategory(v: number): string {
  if (v <= 50) return "GOOD";
  if (v <= 100) return "MODERATE";
  if (v <= 200) return "POOR";
  if (v <= 300) return "VERY POOR";
  return "SEVERE";
}

function pm25ToAqi(pm: number): number {
  if (pm <= 30) return Math.round((50 / 30) * pm);
  if (pm <= 60) return Math.round(50 + ((100 - 50) / (60 - 30)) * (pm - 30));
  if (pm <= 90) return Math.round(100 + ((200 - 100) / (90 - 60)) * (pm - 60));
  if (pm <= 120) return Math.round(200 + ((300 - 200) / (120 - 90)) * (pm - 90));
  if (pm <= 250) return Math.round(300 + ((400 - 300) / (250 - 120)) * (pm - 120));
  return Math.round(400 + ((500 - 400) / (500 - 250)) * Math.min(pm, 500));
}
function pm10ToAqi(pm: number): number {
  if (pm <= 50) return Math.round((50 / 50) * pm);
  if (pm <= 100) return Math.round(50 + ((100 - 50) / (100 - 50)) * (pm - 50));
  if (pm <= 250) return Math.round(100 + ((200 - 100) / (250 - 100)) * (pm - 100));
  if (pm <= 350) return Math.round(200 + ((300 - 200) / (350 - 250)) * (pm - 250));
  if (pm <= 430) return Math.round(300 + ((400 - 300) / (430 - 350)) * (pm - 350));
  return Math.round(400 + ((500 - 400) / (600 - 430)) * Math.min(pm, 600));
}

function degToCompass(d: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round((d % 360) / 22.5) % 16];
}

function feelsLike(tC: number, rh: number): number {
  if (tC < 27) return tC;
  const T = tC * 9 / 5 + 32;
  const HI = -42.379 + 2.04901523 * T + 10.14333127 * rh
    - 0.22475541 * T * rh - 0.00683783 * T * T - 0.05481717 * rh * rh
    + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
  return +(((HI - 32) * 5) / 9).toFixed(1);
}

function jitter(v: number, pct: number) {
  return v * (1 + (Math.random() - 0.5) * pct);
}

function congestionForNeighborhood(nb: Neighborhood, idx: number) {
  const base: Record<NeighborhoodId, string[]> = {
    "dwarka":         ["Dwarka Expressway · Bijwasan", "Sector 21 Metro Roundabout", "Sector 6 Inner Ring", "Najafgarh Road · Sector 9"],
    "janakpuri":      ["Pankha Road · C-Block",        "District Centre Loop",        "Outer Ring Rd · JNU Gate", "Janakpuri West Metro"],
    "vikaspuri":      ["Vikas Marg · Block A",         "Outer Ring Road · KK Tower",  "Mohan Garden Road",        "Najafgarh Road · Uttam Nagar"],
    "rajouri-garden": ["Ring Road · Rajouri Metro",     "Najafgarh Rd · Tagore Garden","TDI Mall Junction",        "Mayapuri Industrial Crossing"],
    "punjabi-bagh":   ["Ring Road · Club Area",         "Rohtak Road · Madipur",       "Outer Ring Rd · Shivaji Pl","Saraswati Vihar Link"],
    "tilak-nagar":    ["Tilak Nagar Metro Crossing",    "Najafgarh Rd · Subhash Nagar","Kirti Nagar Industrial Rd", "Ring Road · Janakpuri East"],
  };
  const roads = base[nb.id];
  return [
    { road: roads[0], level: Math.min(100, idx + 8) },
    { road: roads[1], level: Math.max(20, idx - 4) },
    { road: roads[2], level: idx },
    { road: roads[3], level: Math.max(15, idx - 12) },
  ];
}

function simulate(nb: Neighborhood): DwarkaSnapshot {
  const now = new Date();
  const m = now.getMonth();
  const hour = now.getHours() + now.getMinutes() / 60;
  const monthlyMaxC = [21, 24, 30, 36, 40, 39, 35, 34, 34, 33, 28, 22][m];
  const monthlyMinC = [7, 10, 15, 21, 26, 28, 27, 26, 24, 19, 13, 8][m];
  const dayPhase = Math.cos(((hour - 15) / 24) * Math.PI * 2);
  const tempC = +(monthlyMinC + (monthlyMaxC - monthlyMinC) * (0.5 + 0.5 * dayPhase)).toFixed(1);

  const winterBoost = m <= 1 || m >= 9 ? 80 : 0;
  const aqi = Math.round(60 + 30 * Math.cos(((hour - 8) / 24) * Math.PI * 2) + winterBoost);
  const humidity = Math.round(35 + 15 * Math.sin((hour / 24) * Math.PI * 2));
  const windKmh = +(4 + Math.random() * 18).toFixed(1);

  return finalize(nb, {
    tempC, humidity, windKmh, aqi,
    windDeg: 270, pressureHpa: 1008, precipMm: 0, uvIndex: 6, cloudPct: 30,
    visibilityKm: aqi > 200 ? 2.5 : 6, sunrise: "05:42", sunset: "18:54",
    pm25Direct: null, pm10Direct: null, o3: 38, no2: 28, so2: 6, co: 0.8,
    source: "SIM", liveFields: [],
  });
}

type FinalizeInput = {
  tempC: number; humidity: number; windKmh: number; aqi: number;
  windDeg: number; pressureHpa: number; precipMm: number; uvIndex: number;
  cloudPct: number; visibilityKm: number; sunrise: string; sunset: string;
  pm25Direct: number | null; pm10Direct: number | null;
  o3: number; no2: number; so2: number; co: number;
  source: "LIVE" | "SIM"; liveFields: string[];
  stationName?: string;
};

function finalize(nb: Neighborhood, p: FinalizeInput): DwarkaSnapshot {
  const aqi = Math.max(1, Math.round(p.aqi));
  const pm25 = p.pm25Direct !== null ? Math.round(p.pm25Direct) : Math.max(5, Math.round(aqi * 0.45));
  const pm10 = p.pm10Direct !== null
    ? Math.min(600, Math.max(15, Math.round(p.pm10Direct)))
    : Math.max(pm25 + 10, Math.round(pm25 * 1.8));

  const conditions =
    p.precipMm > 1 ? "Rain"
      : aqi > 250 ? "Smog · Hazy"
      : p.humidity > 80 ? "Humid · Overcast"
      : p.tempC > 38 ? "Hot · Clear"
      : p.tempC < 12 ? "Cold · Foggy"
      : p.cloudPct > 60 ? "Overcast"
      : "Clear";

  const now = new Date();
  const peakHour = now.getHours() >= 18 && now.getHours() <= 22;
  const gridLoadMW = +jitter(peakHour ? 1180 : 820, 0.06).toFixed(0);
  const gridFreqHz = +(50 + (Math.random() - 0.5) * 0.18).toFixed(2);

  let outageRisk: DwarkaSnapshot["outageRisk"] = "LOW";
  if (p.tempC > 41 || (peakHour && Math.random() > 0.7)) outageRisk = "HIGH";
  else if (peakHour) outageRisk = "MED";

  const rush = (now.getHours() >= 8 && now.getHours() <= 11) ||
    (now.getHours() >= 17 && now.getHours() <= 21);
  const trafficIndex = Math.round(jitter(rush ? 78 : 42, 0.15));
  const congestion = congestionForNeighborhood(nb, trafficIndex);

  let weatherAlert: string | null = null;
  if (p.tempC > 42) weatherAlert = "HEATWAVE WATCH · Stay hydrated. Avoid 12:00-16:00.";
  else if (aqi > 300) weatherAlert = "AIR QUALITY EMERGENCY · Wear N95 outdoors.";
  else if (aqi > 200) weatherAlert = "AIR QUALITY ALERT · Limit outdoor activity.";
  else if (p.humidity > 88 && p.tempC > 28) weatherAlert = "HEAT-INDEX ADVISORY · Heavy exertion not advised.";
  else if (p.tempC < 6) weatherAlert = "COLD WAVE · Aid distribution active.";

  return {
    station: p.stationName && p.stationName.length > 0 ? p.stationName : nb.station,
    tempC: p.tempC,
    feelsLikeC: feelsLike(p.tempC, p.humidity),
    humidity: p.humidity,
    windKmh: p.windKmh,
    windDir: degToCompass(p.windDeg),
    pressureHpa: Math.round(p.pressureHpa),
    precipMm: +p.precipMm.toFixed(1),
    uvIndex: +p.uvIndex.toFixed(1),
    cloudPct: Math.round(p.cloudPct),
    visibilityKm: +p.visibilityKm.toFixed(1),
    sunrise: p.sunrise,
    sunset: p.sunset,
    conditions,
    aqi,
    aqiCategory: aqiCategory(aqi),
    pm25,
    pm10,
    o3: Math.round(p.o3),
    no2: Math.round(p.no2),
    so2: Math.round(p.so2),
    co: +p.co.toFixed(2),
    gridLoadMW,
    gridFreqHz,
    outageRisk,
    trafficIndex,
    congestion,
    metroOk: Math.random() > 0.05,
    waterOk: Math.random() > 0.08,
    weatherAlert,
    fetchedAt: Date.now(),
    source: p.source,
    liveFields: p.liveFields,
    neighborhoodId: nb.id,
    neighborhoodName: nb.name,
  };
}

async function fetchLive(nb: Neighborhood): Promise<DwarkaSnapshot> {
  if (!pmBuffers[nb.id]) pmBuffers[nb.id] = { pm25: [], pm10: [] };
  const buf = pmBuffers[nb.id];

  try {
    const token = getWaqiToken();
    let waqiPm25: number | null = null;
    let waqiPm10: number | null = null;
    let waqiO3: number | null = null;
    let waqiNo2: number | null = null;
    let waqiSo2: number | null = null;
    let waqiCo: number | null = null;
    let waqiAqi: number | null = null;
    let waqiStation = "";
    if (token) {
      try {
        const wq = await fetch(`https://api.waqi.info/feed/${nb.waqiStation}/?token=${token}`);
        if (wq.ok) {
          const j = await wq.json();
          if (j?.status === "ok" && j.data) {
            const iaqi = j.data.iaqi || {};
            waqiAqi = Number(j.data.aqi);
            waqiPm25 = iaqi.pm25?.v ?? null;
            waqiPm10 = iaqi.pm10?.v ?? null;
            waqiO3 = iaqi.o3?.v ?? null;
            waqiNo2 = iaqi.no2?.v ?? null;
            waqiSo2 = iaqi.so2?.v ?? null;
            waqiCo = iaqi.co?.v ?? null;
            waqiStation = j.data.city?.name || "";
          }
        }
      } catch { /* fall through */ }
    }

    const wxUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${nb.lat}&longitude=${nb.lon}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,uv_index,cloud_cover,visibility` +
      `&daily=sunrise,sunset&timezone=auto&wind_speed_unit=kmh`;
    const aqUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${nb.lat}&longitude=${nb.lon}` +
      `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

    const [wxR, aqR] = await Promise.all([fetch(wxUrl), fetch(aqUrl)]);
    if (!wxR.ok) throw new Error("weather fetch failed");
    const wx = await wxR.json();
    const aq = aqR.ok ? await aqR.json() : { current: {} };

    const omPm25 = Number(aq?.current?.pm2_5 ?? 60);
    const omPm10Raw = Number(aq?.current?.pm10 ?? omPm25 * 1.8);
    const omPm10Capped = Math.min(500, omPm10Raw);

    const pm25Raw = waqiPm25 !== null ? waqiPm25 : omPm25;
    const pm10Raw = waqiPm10 !== null ? waqiPm10 : omPm10Capped;
    const pm25Smooth = smooth(buf.pm25, pm25Raw);
    const pm10Smooth = smooth(buf.pm10, pm10Raw);

    const aqiVal = waqiAqi !== null
      ? waqiAqi
      : Math.max(pm25ToAqi(pm25Smooth), pm10ToAqi(pm10Smooth));

    const sunrise = String(wx?.daily?.sunrise?.[0] ?? "").slice(11, 16) || "05:42";
    const sunset = String(wx?.daily?.sunset?.[0] ?? "").slice(11, 16) || "18:54";

    const liveFields = [
      "temperature","humidity","wind","pressure","precipitation",
      "uv","cloud","visibility","sunrise","sunset",
    ];
    if (waqiPm25 !== null) liveFields.push("pm2.5·WAQI"); else liveFields.push("pm2.5");
    if (waqiPm10 !== null) liveFields.push("pm10·WAQI"); else liveFields.push("pm10");
    liveFields.push("ozone","no2","so2","co");

    return finalize(nb, {
      tempC: Number(wx?.current?.temperature_2m ?? 30),
      humidity: Number(wx?.current?.relative_humidity_2m ?? 50),
      windKmh: Number(wx?.current?.wind_speed_10m ?? 8),
      windDeg: Number(wx?.current?.wind_direction_10m ?? 270),
      pressureHpa: Number(wx?.current?.surface_pressure ?? 1008),
      precipMm: Number(wx?.current?.precipitation ?? 0),
      uvIndex: Number(wx?.current?.uv_index ?? 5),
      cloudPct: Number(wx?.current?.cloud_cover ?? 30),
      visibilityKm: Number(wx?.current?.visibility ?? 6000) / 1000,
      sunrise, sunset,
      aqi: aqiVal,
      pm25Direct: pm25Smooth,
      pm10Direct: pm10Smooth,
      o3: waqiO3 !== null ? waqiO3 : Number(aq?.current?.ozone ?? 38),
      no2: waqiNo2 !== null ? waqiNo2 : Number(aq?.current?.nitrogen_dioxide ?? 28),
      so2: waqiSo2 !== null ? waqiSo2 : Number(aq?.current?.sulphur_dioxide ?? 6),
      co: waqiCo !== null ? waqiCo : Number(aq?.current?.carbon_monoxide ?? 800) / 1000,
      source: "LIVE",
      liveFields,
      stationName: waqiStation,
    });
  } catch {
    return simulate(nb);
  }
}

export function useSectorLive(neighborhood: Neighborhood, intervalMs = 60000) {
  const [snap, setSnap] = useState<DwarkaSnapshot>(() => simulate(neighborhood));

  const refresh = useCallback(async () => {
    const live = await fetchLive(neighborhood);
    setSnap(live);
  }, [neighborhood]);

  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs, refresh]);

  return { snap, refresh };
}
