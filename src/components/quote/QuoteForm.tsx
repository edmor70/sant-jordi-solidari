import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { buildSummary, type Summary } from "@/lib/pricing";
import { addressSchema } from "@/lib/quote-schema";
import { quoteDestination, submitQuote } from "@/lib/quote.functions";
import { CAMPAIGN } from "@/lib/campaign";
import { billingCopy } from "@/lib/i18n/billing";
import { paymentCopy } from '@/lib/i18n/payment';
import type { PaymentPlan } from '@/lib/payment-plan';
import { QuoteSummary, type ShipView } from "./QuoteSummary";

type Ship =
  | { s: "idle" }
  | { s: "loading"; key: string }
  | { s: "ok"; key: string; cost: number }
  | { s: "pending"; key: string; reason: "not_found" | "out_of_coverage" | "route_failed" };
type Dest = { id: string; street: string; postalCode: string; city: string; roses: string; notes: string; slot: string; ship: Ship };
type Contact = { fullName: string; email: string; phone: string; company: string; notes: string; taxId: string; fiscalAddress: string; billingEmail: string };
type Form = { mode: "pickup" | "delivery"; paymentPlan: PaymentPlan; pickupRoses: string; destinations: Dest[]; contact: Contact; key: string };

const uid = () => crypto.randomUUID();
const newDestBase = () => ({ street: "", postalCode: "", city: "", roses: "", notes: "", slot: "", ship: { s: "idle" } as Ship });
const newDest = (): Dest => ({ id: uid(), street: "", postalCode: "", city: "", roses: "", notes: "", slot: "", ship: { s: "idle" } });
const initial = (ssrSafe = false): Form => ({
  mode: "delivery",
  paymentPlan: 'single',
  pickupRoses: "",
  destinations: [ssrSafe ? { ...newDestBase(), id: "d0" } : newDest()],
  contact: { fullName: "", email: "", phone: "", company: "", notes: "", taxId: "", fiscalAddress: "", billingEmail: "" },
  key: ssrSafe ? "" : uid(),
});
const STORE = "sjs-quote-draft";
const posInt = (v: string) => (/^\d+$/.test(v.trim()) && +v > 0 ? +v : null);
const addrKey = (d: Dest) => `${d.street.trim()}|${d.postalCode.trim()}|${d.city.trim()}`.toLowerCase();

type Errors = Record<string, string>;
type Outcome = null | { kind: "sent"; reference: string; email: string } | { kind: "email_failed"; reference: string } | { kind: "error"; msg: string } | { kind: "changed" };

export function QuoteForm() {
  const { t, lang } = useI18n();
  const q = t.quote;
  const [form, setForm] = useState<Form>(() => initial(true));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [acceptChanges, setAcceptChanges] = useState(false);
  const [hp, setHp] = useState("");
  const loaded = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const quoteFn = useServerFn(quoteDestination);
  const submitFn = useServerFn(submitQuote);

  // Restore / persist draft (session only, this browser tab).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) {
        const f = JSON.parse(raw) as Form;
        f.paymentPlan = f.paymentPlan === 'split' ? 'split' : 'single';
        f.destinations = f.destinations.map((d) => ({ ...d, slot: d.slot ?? "", ship: { s: "idle" } }));
        f.contact = { ...f.contact, taxId: f.contact.taxId ?? "", fiscalAddress: f.contact.fiscalAddress ?? "", billingEmail: f.contact.billingEmail ?? "" };
        setForm(f);
      }
    } catch { /* ignore */ }
    setForm((f) => (f.key ? f : { ...f, key: uid() }));
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current && outcome?.kind !== "sent") sessionStorage.setItem(STORE, JSON.stringify(form));
  }, [form, outcome]);

  // Transport quote per destination (debounced, stale-safe).
  const keys = form.destinations.map((d) => `${d.id}::${addrKey(d)}::${d.ship.s}`).join("~");
  useEffect(() => {
    if (form.mode !== "delivery") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const d of form.destinations) {
      if (d.ship.s !== "idle") continue;
      const parsed = addressSchema.safeParse(d);
      if (!parsed.success) continue;
      const key = addrKey(d);
      timers.push(
        setTimeout(async () => {
          setForm((f) => ({ ...f, destinations: f.destinations.map((x) => (x.id === d.id && addrKey(x) === key ? { ...x, ship: { s: "loading", key } } : x)) }));
          let ship: Ship;
          try {
            const r = await quoteFn({ data: parsed.data });
            ship = r.status === "ok" ? { s: "ok", key, cost: r.cost } : { s: "pending", key, reason: r.reason };
          } catch {
            ship = { s: "pending", key, reason: "route_failed" };
          }
          setForm((f) => ({ ...f, destinations: f.destinations.map((x) => (x.id === d.id && addrKey(x) === key ? { ...x, ship } : x)) }));
        }, 700),
      );
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, form.mode]);

  const totalRoses = form.mode === "pickup" ? posInt(form.pickupRoses) ?? 0 : form.destinations.reduce((a, d) => a + (posInt(d.roses) ?? 0), 0);
  const shippingArr = form.destinations.map((d) => (d.ship.s === "ok" ? d.ship.cost : null));
  const summary: Summary = useMemo(
    () => buildSummary({ mode: form.mode, roses: totalRoses, shipping: shippingArr }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.mode, totalRoses, shippingArr.join(",")],
  );
  const ships: ShipView[] = form.destinations.map((d) => ({
    label: [d.street, d.city, d.slot ? q.slots[d.slot] : ""].filter(Boolean).join(", "),
    state: d.ship.s,
    cost: d.ship.s === "ok" ? d.ship.cost : undefined,
  }));
  const anyLoading = form.mode === "delivery" && form.destinations.some((d) => d.ship.s === "loading");

  const setDest = (id: string, patch: Partial<Dest>) => {
    setErrors((e) => { const n = { ...e }; for (const k of Object.keys(patch)) delete n[`${id}-${k}`]; return n; });
    setForm((f) => ({
      ...f,
      destinations: f.destinations.map((d) => {
        if (d.id !== id) return d;
        const next = { ...d, ...patch };
        // Editing the address invalidates the previous transport quote.
        if (("street" in patch || "postalCode" in patch || "city" in patch) && addrKey(next) !== addrKey(d)) next.ship = { s: "idle" };
        return next;
      }),
    }));
  };
  const setContact = (patch: Partial<Contact>) => setForm((f) => ({ ...f, contact: { ...f.contact, ...patch } }));
  const touch = () => { setOutcome((o) => (o?.kind === "sent" ? o : null)); setAcceptChanges(false); };

  function validate(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (form.mode === "pickup") {
        if ((posInt(form.pickupRoses) ?? 0) < CAMPAIGN.minRosesPerDestination) e["pickupRoses"] = paymentCopy[lang].minimum;
      } else {
        form.destinations.forEach((d) => {
          if (d.street.trim().length < 3) e[`${d.id}-street`] = q.errors.required;
          if (!/^\d{5}$/.test(d.postalCode.trim())) e[`${d.id}-postalCode`] = q.errors.postal;
          if (d.city.trim().length < 2) e[`${d.id}-city`] = q.errors.required;
          if ((posInt(d.roses) ?? 0) < CAMPAIGN.minRosesPerDestination) e[`${d.id}-roses`] = paymentCopy[lang].minimum;
          if (!(CAMPAIGN.deliverySlots as readonly string[]).includes(d.slot)) e[`${d.id}-slot`] = q.errors.slot;
        });
      }
    }
    if (s === 1) {
      const c = form.contact;
      if (c.fullName.trim().length < 3) e["fullName"] = q.errors.name;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e["email"] = q.errors.email;
      const ph = c.phone.replace(/\s/g, "");
      if ((form.mode === "delivery" || ph) && !/^\+?\d{9,15}$/.test(ph)) e["phone"] = q.errors.phone;
      if (c.company.trim().length < 2) e["company"] = q.errors.company;
      if (c.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.billingEmail)) e["billingEmail"] = q.errors.email;
    }
    return e;
  }

  function go(next: number) {
    if (next > step) {
      for (let s = step; s < next; s++) {
        const e = validate(s);
        if (Object.keys(e).length) {
          setErrors(e);
          setStep(s);
          const first = Object.keys(e)[0];
          if (first) requestAnimationFrame(() => document.getElementById(first)?.focus());
          return;
        }
      }
    }
    setErrors({});
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function submit() {
    if (busy || anyLoading) return;
    for (const s of [0, 1]) { const e = validate(s); if (Object.keys(e).length) { setErrors(e); setStep(s); return; } }
    setBusy(true);
    setOutcome(null);
    try {
      const c = form.contact;
      const r = await submitFn({
        data: {
          idempotencyKey: form.key,
          lang,
          mode: form.mode,
          paymentPlan: form.paymentPlan,
          pickupRoses: form.mode === "pickup" ? posInt(form.pickupRoses) ?? 0 : 0,
          destinations:
            form.mode === "delivery"
              ? form.destinations.map((d) => ({ street: d.street, postalCode: d.postalCode, city: d.city, roses: posInt(d.roses) ?? 0, notes: d.notes, slot: d.slot as (typeof CAMPAIGN.deliverySlots)[number] }))
              : [],
          contact: { ...c, phone: c.phone.trim() },
          shownShipping: form.mode === "delivery" ? shippingArr : [],
          acceptChanges,
          website: hp,
        },
      });
      if (r.status === "sent") {
        setOutcome({ kind: "sent", reference: r.reference, email: c.email.trim() });
        sessionStorage.removeItem(STORE);
      } else if (r.status === "email_failed") setOutcome({ kind: "email_failed", reference: r.reference });
      else if (r.status === "changed") {
        setForm((f) => ({
          ...f,
          destinations: f.destinations.map((d, i) => {
            const cost = r.shipping[i];
            const key = addrKey(d);
            return { ...d, ship: cost === null || cost === undefined ? { s: "pending", key, reason: "route_failed" } : { s: "ok", key, cost } };
          }),
        }));
        setAcceptChanges(true);
        setOutcome({ kind: "changed" });
      } else if (r.status === "rate_limited") setOutcome({ kind: "error", msg: q.rateLimited });
      else setOutcome({ kind: "error", msg: q.genericError });
    } catch {
      setOutcome({ kind: "error", msg: q.genericError });
    } finally {
      setBusy(false);
    }
  }

  if (outcome?.kind === "sent") {
    return (
      <div className="rounded-lg border border-border bg-paper p-8 md:p-12" role="status" aria-live="polite">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-leaf-foreground"><Check aria-hidden /></div>
        <h2 className="mt-5 font-display text-4xl">{q.successTitle}</h2>
        <p className="mt-3 max-w-xl text-lg">{q.success(outcome.reference, outcome.email)}</p>
        <button type="button" className="btn btn-outline mt-8" onClick={() => { setForm(initial()); setStep(0); setOutcome(null); }}>{q.newRequest}</button>
      </div>
    );
  }

  const err = (id: string) => errors[id];
  const summaryBox = <QuoteSummary summary={summary} ships={ships} />;

  return (
    <div className="grid gap-8 pb-20 lg:grid-cols-[1fr_22rem] lg:pb-0">
      <div>
        <ol className="mb-6 grid grid-cols-3 gap-2 text-xs sm:text-sm" aria-label={q.title}>
          {q.steps.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined} className={`border-t-4 pt-2 ${i <= step ? "border-primary font-semibold" : "border-border text-muted-foreground"}`}>
              <span className="block text-[0.7rem] uppercase tracking-wider">{i + 1}</span>{label}
            </li>
          ))}
        </ol>

        <details id="resum-mobil" className="mb-6 rounded-lg border border-border bg-paper p-4 lg:hidden">
          <summary className="cursor-pointer font-semibold">{q.showSummary}</summary>
          <div className="mt-3">{summaryBox}</div>
        </details>

        <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < 2) go(step + 1); else submit(); }} onChange={touch} className="rounded-lg border border-border bg-paper p-5 md:p-8">
          <p className="text-xs text-muted-foreground">{q.stepOf(step + 1, 3)}</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1 font-display text-3xl outline-none">{q.steps[step]}</h2>
          {Object.keys(errors).length > 0 && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{q.errors.fixAbove}</p>}

          {step === 0 && (
            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="font-semibold">{q.modeLegend}</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["pickup", "delivery"] as const).map((m) => (
                    <label key={m} className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 ${form.mode === m ? "border-primary bg-accent" : "border-border"}`}>
                      <input type="radio" name="mode" value={m} checked={form.mode === m} onChange={() => setForm((f) => ({ ...f, mode: m }))} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
                      <span><span className="block font-semibold">{m === "pickup" ? q.pickup : q.delivery}</span><span className="text-sm text-muted-foreground">{m === "pickup" ? q.pickupDesc : q.deliveryDesc}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {form.mode === "pickup" ? (
                <div className="space-y-3">
                  <Field id="pickupRoses" label={q.pickupRoses} error={err("pickupRoses")}>
                    <input id="pickupRoses" type="number" min={CAMPAIGN.minRosesPerDestination} step="1" inputMode="numeric" className="field max-w-40" value={form.pickupRoses} onChange={(e) => setForm((f) => ({ ...f, pickupRoses: e.target.value }))} aria-invalid={!!err("pickupRoses")} aria-describedby={err("pickupRoses") ? "pickupRoses-err" : undefined} />
                  </Field>
                  <p className="rounded-md bg-muted p-3 text-sm">{q.pickupNote}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {form.destinations.map((d, i) => (
                    <fieldset key={d.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <legend className="font-semibold">{q.destination(i + 1)}</legend>
                        {form.destinations.length > 1 && (
                          <button type="button" className="btn btn-ghost min-h-9 text-sm" onClick={() => setForm((f) => ({ ...f, destinations: f.destinations.filter((x) => x.id !== d.id) }))}>
                            <Trash2 className="h-4 w-4" aria-hidden /> {q.removeDest}
                          </button>
                        )}
                      </div>
                      <div className="mt-3 grid gap-4 sm:grid-cols-6">
                        <div className="sm:col-span-6"><Field id={`${d.id}-street`} label={q.street} error={err(`${d.id}-street`)}><input id={`${d.id}-street`} autoComplete="street-address" className="field" value={d.street} onChange={(e) => setDest(d.id, { street: e.target.value })} aria-invalid={!!err(`${d.id}-street`)} aria-describedby={err(`${d.id}-street`) ? `${d.id}-street-err` : undefined} /></Field></div>
                        <div className="sm:col-span-2"><Field id={`${d.id}-postalCode`} label={q.postalCode} error={err(`${d.id}-postalCode`)}><input id={`${d.id}-postalCode`} inputMode="numeric" autoComplete="postal-code" maxLength={5} className="field" value={d.postalCode} onChange={(e) => setDest(d.id, { postalCode: e.target.value })} aria-invalid={!!err(`${d.id}-postalCode`)} aria-describedby={err(`${d.id}-postalCode`) ? `${d.id}-postalCode-err` : undefined} /></Field></div>
                        <div className="sm:col-span-4"><Field id={`${d.id}-city`} label={q.city} error={err(`${d.id}-city`)}><input id={`${d.id}-city`} autoComplete="address-level2" className="field" value={d.city} onChange={(e) => setDest(d.id, { city: e.target.value })} aria-invalid={!!err(`${d.id}-city`)} aria-describedby={err(`${d.id}-city`) ? `${d.id}-city-err` : undefined} /></Field></div>
                        <div className="sm:col-span-2"><Field id={`${d.id}-roses`} label={q.roses} error={err(`${d.id}-roses`)}><input id={`${d.id}-roses`} type="number" min={CAMPAIGN.minRosesPerDestination} step="1" inputMode="numeric" className="field" value={d.roses} onChange={(e) => setDest(d.id, { roses: e.target.value })} aria-invalid={!!err(`${d.id}-roses`)} aria-describedby={err(`${d.id}-roses`) ? `${d.id}-roses-err` : undefined} /></Field></div>
                        <div className="sm:col-span-6"><Field id={`${d.id}-slot`} label={q.slot} help={q.slotNote} error={err(`${d.id}-slot`)}>
                          <select id={`${d.id}-slot`} className="field" required value={d.slot} onChange={(e) => setDest(d.id, { slot: e.target.value })} aria-invalid={!!err(`${d.id}-slot`)} aria-describedby={`${d.id}-slot-help${err(`${d.id}-slot`) ? ` ${d.id}-slot-err` : ""}`}>
                            <option value="">{q.slotChoose}</option>
                            {CAMPAIGN.deliverySlots.map((s) => <option key={s} value={s}>{q.slots[s]}</option>)}
                          </select>
                        </Field></div>
                        <div className="sm:col-span-4"><Field id={`${d.id}-notes`} label={q.notes}><input id={`${d.id}-notes`} className="field" maxLength={300} value={d.notes} onChange={(e) => setDest(d.id, { notes: e.target.value })} /></Field></div>
                      </div>
                      <p className="mt-3 text-sm" aria-live="polite">
                        {d.ship.s === "idle" && <span className="text-muted-foreground">{q.shipIdle}</span>}
                        {d.ship.s === "loading" && <span className="text-muted-foreground">{q.shipLoading}</span>}
                        {d.ship.s === "ok" && <span><span className="font-semibold">{q.shipOk}:</span> {new Intl.NumberFormat(lang === "ca" ? "ca-ES" : "es-ES", { style: "currency", currency: "EUR" }).format(d.ship.cost)}</span>}
                        {d.ship.s === "pending" && <span className="block rounded-md bg-warning px-3 py-2 text-warning-foreground"><strong>{q.shipPending}.</strong> {q.shipReasons[d.ship.reason]}</span>}
                      </p>
                    </fieldset>
                  ))}
                  {form.destinations.length < CAMPAIGN.maxDestinations && (
                    <button type="button" className="btn btn-outline" onClick={() => setForm((f) => ({ ...f, destinations: [...f.destinations, newDest()] }))}>
                      <Plus className="h-4 w-4" aria-hidden /> {q.addDest}
                    </button>
                  )}
                  <div className="max-w-40">
                    <label htmlFor="totalRoses" className="block text-sm font-medium">{q.totalRoses}</label>
                    <input id="totalRoses" readOnly value={totalRoses} className="field mt-1 bg-muted" />
                  </div>
                  <p className="text-sm text-muted-foreground">{q.deliveryNote}</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field id="company" label={q.companyName} error={err("company")}><input id="company" autoComplete="organization" className="field" value={form.contact.company} onChange={(e) => setContact({ company: e.target.value })} aria-invalid={!!err("company")} aria-describedby={err("company") ? "company-err" : undefined} required /></Field></div>
              <div className="sm:col-span-2"><Field id="fullName" label={q.fullName} error={err("fullName")}><input id="fullName" autoComplete="name" className="field" value={form.contact.fullName} onChange={(e) => setContact({ fullName: e.target.value })} aria-invalid={!!err("fullName")} aria-describedby={err("fullName") ? "fullName-err" : undefined} required /></Field></div>
              <Field id="email" label={q.email} error={err("email")}><input id="email" type="email" autoComplete="email" className="field" value={form.contact.email} onChange={(e) => setContact({ email: e.target.value })} aria-invalid={!!err("email")} aria-describedby={err("email") ? "email-err" : undefined} required /></Field>
              <Field id="phone" label={form.mode === "delivery" ? q.phone : q.phoneOptional} error={err("phone")}><input id="phone" type="tel" autoComplete="tel" className="field" value={form.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} aria-invalid={!!err("phone")} aria-describedby={err("phone") ? "phone-err" : undefined} required={form.mode === "delivery"} /></Field>
              <p className="rounded-md bg-muted p-3 text-sm sm:col-span-2">{q.fiscalNote}</p>
              <Field id="taxId" label={billingCopy[lang].taxId}><input id="taxId" className="field" maxLength={30} value={form.contact.taxId} onChange={e => setContact({ taxId: e.target.value })} /></Field>
              <Field id="billingEmail" label={billingCopy[lang].email} error={err("billingEmail")}><input id="billingEmail" type="email" className="field" value={form.contact.billingEmail} onChange={e => setContact({ billingEmail: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field id="fiscalAddress" label={billingCopy[lang].address}><input id="fiscalAddress" className="field" maxLength={300} value={form.contact.fiscalAddress} onChange={e => setContact({ fiscalAddress: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field id="obs" label={q.observations}><textarea id="obs" rows={4} maxLength={1500} className="field" value={form.contact.notes} onChange={(e) => setContact({ notes: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field id="paymentPlan" label={paymentCopy[lang].label}><select id="paymentPlan" className="field" value={form.paymentPlan} onChange={e => setForm(f => ({ ...f, paymentPlan: e.target.value === 'split' ? 'split' : 'single' }))}><option value="single">{paymentCopy[lang].single}</option><option value="split">{paymentCopy[lang].split}</option></select></Field><p className="mt-2 text-sm text-muted-foreground">{paymentCopy[lang].short}</p></div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-6">
              <Review title={q.steps[0] ?? ""} onEdit={() => go(0)} editLabel={q.edit}>
                {form.mode === "pickup" ? (
                  <p>{q.pickupTitle} · {totalRoses} {q.units}<br /><span className="text-sm text-muted-foreground">{q.pickupNote}</span></p>
                ) : (
                  <ul className="space-y-2">
                    {form.destinations.map((d, i) => (
                      <li key={d.id}><span className="font-medium">{q.destination(i + 1)}:</span> {d.street}, {d.postalCode} {d.city} · {d.roses} {q.units} · {q.slots[d.slot] ?? ""}{d.notes ? ` · ${d.notes}` : ""}</li>
                    ))}
                  </ul>
                )}
              </Review>
              <Review title={q.steps[1] ?? ""} onEdit={() => go(1)} editLabel={q.edit}>
                <p className="font-medium">{form.contact.company}</p>
                <p>{form.contact.fullName} · {form.contact.email}{form.contact.phone ? ` · ${form.contact.phone}` : ""}</p>
                <p className="mt-2">{paymentCopy[lang].label}: {form.paymentPlan === 'split' ? paymentCopy[lang].split : paymentCopy[lang].single}</p>
                {form.contact.notes && <p className="mt-1 text-sm text-muted-foreground">{form.contact.notes}</p>}
              </Review>
              <div className="rounded-lg border border-border p-4 lg:hidden">
                <h3 className="font-semibold">{q.summary}</h3>
                <div className="mt-3">{summaryBox}</div>
              </div>
              <p className="text-sm">{q.submitNote}</p>
              <p className="rounded-md bg-accent p-3 text-sm font-medium">{q.submitLegal} <Link to="/condicions" className="link">{t.footer.terms}</Link>.</p>
              <p className="rounded-md bg-muted p-3 text-xs leading-relaxed">{q.privacy} <Link to="/privacitat" className="link">{q.privacyLink}</Link>.</p>
              <div className="hidden" aria-hidden><label>Website<input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label></div>
            </div>
          )}

          {outcome && (
            <div role="alert" className={`mt-6 rounded-md px-4 py-3 text-sm ${outcome.kind === "changed" ? "bg-warning text-warning-foreground" : "bg-destructive/10 text-destructive"}`}>
              {outcome.kind === "changed" && q.changed}
              {outcome.kind === "email_failed" && q.emailFailed(outcome.reference)}
              {outcome.kind === "error" && outcome.msg}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {step > 0 ? <button type="button" className="btn btn-outline" onClick={() => go(step - 1)}>{q.back}</button> : <span />}
            {step < 2 ? (
              <button type="submit" className="btn btn-primary">{q.next}</button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={busy || anyLoading} aria-busy={busy}>
                {busy ? q.submitting : outcome?.kind === "email_failed" ? q.retry : q.submit}
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="hidden lg:block" aria-label={q.summary}>
        <div className="sticky top-24 rounded-lg border border-border bg-paper p-6">
          <h2 className="font-display text-2xl">{q.summary}</h2>
          <div className="mt-4">{summaryBox}</div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 backdrop-blur lg:hidden">
        <div className="container-page flex items-center justify-between gap-3 py-2.5 text-sm">
          <div className="min-w-0 leading-tight">
            <span className="block text-xs text-muted-foreground">{summary.grandTotal !== null ? q.total : q.rosesTotal}</span>
            <span className="font-semibold tabular-nums">
              {new Intl.NumberFormat(lang === "ca" ? "ca-ES" : "es-ES", { style: "currency", currency: "EUR" }).format(summary.grandTotal ?? summary.roses.total)}
              {summary.grandTotal === null && form.mode === "delivery" ? <span className="font-normal text-muted-foreground"> + {q.shipEstimated.toLowerCase()}</span> : null}
            </span>
          </div>
          <a href="#resum-mobil" className="link shrink-0" onClick={() => { const d = document.getElementById("resum-mobil") as HTMLDetailsElement | null; if (d) d.open = true; }}>{q.showSummary}</a>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, help, error, children }: { id: string; label: string; help?: string | undefined; error?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {help && <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">{help}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

function Review({ title, onEdit, editLabel, children }: { title: string; onEdit: () => void; editLabel: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <button type="button" className="btn btn-ghost min-h-9 text-sm" onClick={onEdit}>{editLabel}</button>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
