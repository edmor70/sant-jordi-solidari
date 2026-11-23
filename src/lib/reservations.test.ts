import {describe,it,expect} from 'vitest';
import {reservationEditSchema,submissionIdentity,reservationBreakdown} from './reservations';
const base={id:'00000000-0000-0000-0000-000000000001',revision:1,status:'pending',mode:'pickup',pickupRoses:50,destinations:[],notes:''};
describe('reservation management rules',()=>{
 it('rejects pickup below 50',()=>expect(reservationEditSchema.safeParse({...base,pickupRoses:49}).success).toBe(false));
 it('accepts pickup at 50',()=>expect(reservationEditSchema.safeParse(base).success).toBe(true));
 it('rejects an unsupported delivery slot',()=>expect(reservationEditSchema.safeParse({...base,mode:'delivery',destinations:[{street:'Mallorca 1',postalCode:'08001',city:'Barcelona',roses:50,slot:'2027-04-23-am'}]}).success).toBe(false));
 it('requires a destination for delivery',()=>expect(reservationEditSchema.safeParse({...base,mode:'delivery'}).success).toBe(false));
 it('allows all requested reservation states',()=>{for(const status of ['pending','confirmed','paid','cancelled','delivered'])expect(reservationEditSchema.safeParse({...base,status}).success).toBe(true);});
 it('preserves two-payment plan and recalculates concrete pickup totals',()=>{const b=reservationBreakdown('pickup',100,[],'split');expect(b.paymentPlan).toBe('split');expect(b.summary.grandTotal).toBe(330);});
 it('binds idempotency to submitted customer data',()=>{const d={lang:'ca',mode:'pickup',pickupRoses:50,destinations:[],contact:{email:'a@example.invalid'}};expect(submissionIdentity(d)).not.toBe(submissionIdentity({...d,contact:{email:'b@example.invalid'}}));});
});
