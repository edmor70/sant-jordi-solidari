import { z } from 'zod';
import { CAMPAIGN } from './campaign';
import { destinationSchema } from './quote-schema';
import { buildSummary } from './pricing';
export const reservationStates = ['pending','confirmed','paid','cancelled','delivered'] as const;
export const reservationEditSchema = z.object({id:z.string().uuid(),revision:z.number().int().positive(),status:z.enum(reservationStates),mode:z.enum(['pickup','delivery']),pickupRoses:z.number().int().min(0).max(100000),destinations:z.array(destinationSchema).max(CAMPAIGN.maxDestinations),notes:z.string().max(1500)}).superRefine((v,c)=>{if(v.mode==='pickup'&&v.pickupRoses<CAMPAIGN.minRosesPerDestination)c.addIssue({code:'custom',path:['pickupRoses'],message:'minimum'});if(v.mode==='delivery'&&!v.destinations.length)c.addIssue({code:'custom',path:['destinations'],message:'required'});});
export function reservationBreakdown(mode:'pickup'|'delivery',roses:number,shipping:(number|null)[],paymentPlan='single'){
 const summary=buildSummary({mode,roses,shipping});const pending:string[]=[];
 shipping.forEach((cost,i)=>{if(cost===null)pending.push(`Transport destí ${i+1}`);});
 if(mode==='delivery'&&!summary.shippingTax&&!summary.shippingPending)pending.push('Tractament fiscal del transport');
 return {summary,pending,paymentPlan};
}
export function submissionIdentity(data:{lang:string;mode:string;paymentPlan?:string;pickupRoses:number;destinations:unknown[];contact:unknown}) {
 return JSON.stringify({lang:data.lang,mode:data.mode,paymentPlan:data.paymentPlan??'single',pickupRoses:data.pickupRoses,destinations:data.destinations,contact:data.contact});
}
