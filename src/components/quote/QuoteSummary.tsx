import { formatEUR, formatPct, useI18n } from "@/lib/i18n";
import type { Summary } from "@/lib/pricing";

export type ShipView = { label: string; state: "idle" | "loading" | "ok" | "pending"; cost?: number | undefined };

export function QuoteSummary({ summary, ships }: { summary: Summary; ships: ShipView[] }) {
  const { t, lang } = useI18n();
  const q = t.quote;
  const e = (n: number) => formatEUR(n, lang);
  const r = summary.roses;
  const row = "flex items-baseline justify-between gap-4 py-1.5";
  return (
    <div className="text-sm">
      <dl>
        <div className={row}><dt>{q.totalRoses}</dt><dd className="font-semibold tabular-nums">{r.qty} {q.units}</dd></div>
        <div className={row}><dt>{q.unitPrice}</dt><dd className="tabular-nums">{e(r.unitBase)} {t.common.plusVat} · {e(r.unitGross)}</dd></div>
        <div className={row}><dt>{q.rosesBase}</dt><dd className="tabular-nums">{e(r.base)}</dd></div>
        <div className={row}><dt>{q.rosesVat(formatPct(r.vatRate, lang))}</dt><dd className="tabular-nums">{e(r.vat)}</dd></div>
        <div className={`${row} border-t border-border pt-2 font-semibold`}><dt>{q.rosesTotal}</dt><dd className="tabular-nums">{e(r.total)}</dd></div>
      </dl>

      <div className="mt-4 border-t border-border pt-3">
        {summary.mode === "pickup" ? (
          <p className="text-muted-foreground">{q.noTransport}</p>
        ) : (
          <>
            <p className="font-semibold">{q.shipEstimated}</p>
            <ul className="mt-1">
              {ships.map((s, i) => (
                <li key={i} className={row}>
                  <span className="min-w-0 break-words">{s.label || q.destination(i + 1)}</span>
                  <span className="shrink-0 tabular-nums">
                    {s.state === "ok" && s.cost !== undefined ? e(s.cost) : s.state === "loading" ? q.shipLoading : s.state === "pending" ? <span className="text-warning-foreground">{q.shipPending}</span> : "—"}
                  </span>
                </li>
              ))}
            </ul>
            <div className={`${row} font-semibold`}><span>{q.shipEstimated}</span><span className="tabular-nums">{e(summary.shippingKnown)}{summary.shippingPending ? " + …" : ""}</span></div>
            {summary.shippingTax ? (
              <>
                <div className={row}><span>{q.shipBase}</span><span className="tabular-nums">{e(summary.shippingTax.base)}</span></div>
                <div className={row}><span>{q.shipVat}</span><span className="tabular-nums">{e(summary.shippingTax.vat)}</span></div>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{q.shipEstimateNote}</p>
            )}
          </>
        )}
      </div>

      {summary.grandTotal !== null && (
        <div className="mt-3 flex items-baseline justify-between border-t-2 border-foreground pt-3 text-base font-bold">
          <span>{q.total}</span><span className="tabular-nums">{e(summary.grandTotal)}</span>
        </div>
      )}
      {summary.shippingPending && <p className="mt-2 rounded-md bg-warning px-3 py-2 text-xs text-warning-foreground">{q.pendingReview}</p>}
    </div>
  );
}
