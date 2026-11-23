import { CAMPAIGN } from './campaign';
import { round2 } from './pricing';
export type PaymentPlan = 'single' | 'split';
export function initialPaymentDue(issuedDate: string) {
  const date = new Date(`${issuedDate}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid_date');
  let days = 0;
  while (days < CAMPAIGN.payment.initialBusinessDays) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days++;
  }
  return date.toISOString().slice(0, 10);
}
export function operationDocumentNumber(sequence: number, plan: PaymentPlan, stage: 'single' | 'advance' | 'final') {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 9999) throw new Error('invalid_sequence');
  if ((plan === 'single') !== (stage === 'single')) throw new Error('invalid_payment_stage');
  return `${plan === 'single' ? 'U' : 'M'}${String(sequence).padStart(4, '0')}${stage === 'advance' ? '.1' : stage === 'final' ? '.2' : ''}`;
}
export function paymentSchedule(total: number, plan: PaymentPlan, reference: string, issuedDate: string) {
  if (!Number.isFinite(total) || total < 0) throw new Error('invalid_total');
  if (plan === 'single') return [{ reference, amount: round2(total), dueDate: initialPaymentDue(issuedDate) }];
  const first = round2(total * CAMPAIGN.payment.depositPct);
  return [{ reference, amount: first, dueDate: initialPaymentDue(issuedDate) }, { reference: `${reference}.2`, amount: round2(total - first), dueDate: CAMPAIGN.payment.balanceDeadlineISO }];
}