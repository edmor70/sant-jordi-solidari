// Server-only municipality verification. Never return coordinates to the client.
import { shippingCost } from "./pricing";

const UA = "SantJordiSolidariBarcelona/1.0 (solidaristjordi@gmail.com)";
type Geo = { municipality: string; postcode: string };
export type ShipResult =
  | { status: "ok"; cost: number; inBarcelona: boolean; municipality: string }
  | { status: "pending"; reason: "not_found" | "out_of_coverage" | "route_failed" };

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

async function geocode(params: Record<string, string>): Promise<Geo | null | "error"> {
  const base = process.env["GEOCODER_URL"] || "https://nominatim.openstreetmap.org/search";
  const url = new URL(base);
  for (const [k, v] of Object.entries({ format: "jsonv2", addressdetails: "1", limit: "5", countrycodes: "es", ...params })) url.searchParams.set(k, v);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ca,es" }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return "error";
    const j = (await r.json()) as Array<{ address?: Record<string, string> }>;
    const matches = j.map(item => {
      const a = item.address ?? {};
      return { municipality: a["city"] || a["town"] || a["village"] || a["municipality"] || "", postcode: a["postcode"] || "" };
    }).filter(g => g.municipality && g.postcode === params['postalcode']);
    if (!matches.length || new Set(matches.map(g => norm(g.municipality))).size !== 1) return null;
    return matches[0] ?? null;
  } catch {
    return "error";
  }
}

export async function quoteAddress(addr: { street: string; postalCode: string; city: string }): Promise<ShipResult> {
  if (process.env["SHIPPING_SIMULATE_FAILURE"] === "1") return { status: "pending", reason: "route_failed" };
  let dest = await geocode({ street: addr.street, postalcode: addr.postalCode, city: addr.city });
  if (dest === "error") return { status: "pending", reason: "route_failed" };
  if (!dest) return { status: "pending", reason: "not_found" };
  // The postcode the visitor typed must match the geocoded result, otherwise ask for manual review.
  if (dest.postcode !== addr.postalCode || norm(dest.municipality) !== norm(addr.city)) return { status: "pending", reason: "not_found" };

  if (norm(dest.municipality) === "barcelona") return { status: "ok", cost: shippingCost(true, 0), inBarcelona: true, municipality: dest.municipality };

  return { status: "ok", cost: shippingCost(false), inBarcelona: false, municipality: dest.municipality };
}
