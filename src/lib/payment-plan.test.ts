import { expect, it } from 'vitest';
import { paymentSchedule } from './payment-plan';
import { buildSummary } from './pricing';
it('single payment is due in three business days',()=>expect(paymentSchedule(165,'single','SJ27-ABC','2026-11-18')).toEqual([{reference:'SJ27-ABC',amount:165,dueDate:'2026-11-23'}]));
it('two payments use equal halves and .2 on the second reference',()=>expect(paymentSchedule(165,'split','SJ27-ABC','2026-11-18').map(x=>[x.reference,x.amount])).toEqual([['SJ27-ABC',82.5],['SJ27-ABC.2',82.5]]));
it('first half is due in three business days, second on 7 April',()=>expect(paymentSchedule(165,'split','SJ27-ABC','2026-11-18').map(x=>x.dueDate)).toEqual(['2026-11-23','2027-04-07']));
it('rounding preserves the exact order total',()=>expect(paymentSchedule(165.01,'split','SJ27-ABC','2026-11-18').reduce((n,x)=>n+x.amount,0)).toBe(165.01));
it('splits the complete order including 4/6 € net shipping and 10 % VAT',()=>{
 const total=buildSummary({mode:'delivery',roses:150,shipping:[4,6]}).grandTotal;
 expect(total).toBe(506);
 expect(paymentSchedule(total??0,'split','PRUEBA','2026-11-19').map(p=>p.amount)).toEqual([253,253]);
});it('split halves base and VAT so advance + balance equal the order exactly',()=>{
 const s=buildSummary({mode:'delivery',roses:55,shipping:[4]});
 expect(s.grandTotal).toBe(185.9);
 expect(paymentSchedule(s.grandTotal??0,'split','P','2026-11-19').map(p=>p.amount)).toEqual([92.95,92.95]);
});
