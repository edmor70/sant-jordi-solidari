import { shippingCost } from './pricing';
export type ShipResult = { status: 'ok'; cost: number; inBarcelona: boolean; municipality: string } | { status: 'pending'; reason: 'not_found' | 'out_of_coverage' | 'route_failed' };
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
export async function quoteAddress(addr: { street: string; postalCode: string; city: string }): Promise<ShipResult> {
  if (process.env['SHIPPING_SIMULATE_FAILURE'] === '1') return { status: 'pending', reason: 'route_failed' };
  const cp = (addr.postalCode || '').trim();
  const city = (addr.city || '').trim();
  if (!/^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/.test(cp)) return { status: 'pending', reason: 'not_found' };
  const isBcn = /^080(0[1-9]|[1-3]\d|4[0-2])$/.test(cp) || (cp.startsWith('080') && norm(city) === 'barcelona');
  return isBcn ? { status: 'ok', cost: shippingCost(true, 0), inBarcelona: true, municipality: 'Barcelona' } : { status: 'ok', cost: shippingCost(false, 0), inBarcelona: false, municipality: city || cp };
}
