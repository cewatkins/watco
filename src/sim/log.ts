export type LandingKind = "full stop" | "crash" | "reset";
export type FlightRecord = {
  startedAt: string;
  airborneSeconds: number;
  landingKind: LandingKind;
  maxAltitudeFt: number;
};
export const LOG_KEY = "field28-flight-log-v1";
export type LogStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function readFlightLog(storage: LogStorage): FlightRecord[] {
  const raw = storage.getItem(LOG_KEY);
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(isFlightRecord)) throw new Error("Flight log is invalid. Forget the local log to start fresh.");
  return data.slice(-50);
}
export function isFlightRecord(value: unknown): value is FlightRecord {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return typeof p.startedAt === "string" && Number.isFinite(Date.parse(p.startedAt))
    && typeof p.airborneSeconds === "number" && Number.isFinite(p.airborneSeconds) && p.airborneSeconds >= 0
    && typeof p.maxAltitudeFt === "number" && Number.isFinite(p.maxAltitudeFt)
    && ["full stop", "crash", "reset"].includes(String(p.landingKind));
}
export function appendFlight(storage: LogStorage, record: FlightRecord) {
  if (!isFlightRecord(record)) throw new Error("Cannot save invalid flight record.");
  const log = [...readFlightLog(storage), record].slice(-50);
  storage.setItem(LOG_KEY, JSON.stringify(log));
  return log;
}
export function forgetFlights(storage: LogStorage) {
  storage.removeItem(LOG_KEY);
}
