import { afterEach, describe, expect, it, vi } from 'vitest';
import { quoteAddress } from './shipping.server';
afterEach(() => vi.unstubAllGlobals());
const response = (addresses: Record<string,string>[]) => vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(addresses.map(address => ({address}))))));
describe('verified municipal tariffs', () => {
  it('charges 4 € for a verified Barcelona address', async () => {
    response([{city:'Barcelona',postcode:'08007'}]);
    expect(await quoteAddress({street:'Passeig de Gràcia 43',postalCode:'08007',city:'Barcelona'})).toMatchObject({status:'ok',cost:4});
  });
  it('charges 6 € for an outside municipality in Barcelona province', async () => {
    response([{city:'Badalona',postcode:'08911'}]);
    expect(await quoteAddress({street:'Carrer del Mar 1',postalCode:'08911',city:'Badalona'})).toMatchObject({status:'ok',cost:6});
  });
  it('never assumes Barcelona from the user city alone', async () => {
    response([{city:'Badalona',postcode:'08911'}]);
    expect(await quoteAddress({street:'Carrer del Mar 1',postalCode:'08911',city:'Barcelona'})).toEqual({status:'pending',reason:'not_found'});
  });
  it('requires a verified postcode', async () => {
    response([{city:'Barcelona'}]);
    expect(await quoteAddress({street:'Passeig de Gràcia 43',postalCode:'08007',city:'Barcelona'})).toEqual({status:'pending',reason:'not_found'});
  });
  it('requests review for ambiguous municipalities', async () => {
    response([{city:'Barcelona',postcode:'08007'},{city:'Badalona',postcode:'08007'}]);
    expect(await quoteAddress({street:'Carrer 1',postalCode:'08007',city:'Barcelona'})).toEqual({status:'pending',reason:'not_found'});
  });
});