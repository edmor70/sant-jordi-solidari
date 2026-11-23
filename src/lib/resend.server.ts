import { z } from 'zod';

export type MailPayload = { from: string; to: string[]; reply_to?: string; subject: string; text: string; attachments?: { filename: string; content: string }[] };
export class MailError extends Error {
  constructor(public code: string, public status?: number) { super(code); }
}
export function resendSender() {
  const from = process.env['RESEND_FROM_EMAIL'];
  if (!from || from !== 'pedidos@santjordisolidari.es') throw new MailError('email_not_configured');
  return from;
}
export async function sendResend(payload: MailPayload, idempotencyKey: string) {
  const key = process.env['RESEND_API_KEY'];
  if (!key) throw new MailError('email_not_configured');
  if (payload.from !== resendSender()) throw new MailError('sender_not_authorized');
  z.array(z.string().email()).min(1).parse(payload.to);
  if (payload.reply_to) z.string().email().parse(payload.reply_to);
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(15000),
      });
    } catch { throw new MailError('provider_response_unknown'); }
    if (response.ok) {
      const result = await response.json() as { id?: string };
      if (!result.id) throw new MailError('provider_response_unknown');
      return result.id;
    }
    // Do not log provider bodies: they can echo private request content.
    await response.text();
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
      continue;
    }
    throw new MailError(`resend_${response.status}`, response.status);
  }
  throw new MailError('provider_response_unknown');
}