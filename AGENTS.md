<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Route metadata is centralized in bilingual `i18n/seo`; route head tags and language switching share the same generator so social tags cannot stay in the previous language. Canonical and og:url self-reference leaf pages only.
- Editorial content from the supplied site lives in the bilingual i18n dictionaries; the shared Catalog renders both home and products pages to prevent price drift.
- Group project information under collaboration and contact; preserve previous project/about URLs with redirects so existing links remain usable.
- Keep public team contact separate from the legal email and internal notice recipient so adding a contact does not reroute requests.
- Campaign prices, VAT, delivery slots and flags live only in `src/lib/campaign.ts`; pricing math in `src/lib/pricing.ts` (tested) — so values change in one place.
- Invoice maturity copy is shared through `src/lib/i18n/payment.ts` and reads campaign configuration, so the legal notice, terms, form and private drafts cannot disagree.
- Verify each destination municipality and postcode server-side before applying the fixed campaign tariff; ambiguous locations remain pending, and no coordinates reach the client.
- Reservations stay private and use their own reference; saving a reservation never issues or sends an invoice, because fiscal issuance requires a separate taxable operation.
- All UI copy goes through `src/lib/i18n` (ca default, es) — never hardcode visible text.
- Generate draft PDFs server-side from stored request summaries; keep them in private Storage and issue seven-day signed links only for the fixed internal recipient, never in public responses or logs.
- Internal notice envelopes use one reference-based idempotency key and the validated client email only as Reply-To; reuse the stored reference and summary on retries.
- Public documents (e.g. the support letter) are shown on their own page as an image with a PDF download link, never as a direct PDF link — sandboxed tabs refuse to render PDFs.
- Notion sync (`src/lib/notion.server.ts`) upserts by "Identificador de reserva" into the existing fixed data source only when the campaign integration gate is enabled, so reprocessing never duplicates; Notion failures never block a reservation.
- Reservation email and Notion automation gates live in campaign configuration; credential setup alone must not activate external side effects.
- Billing uses immutable fiscal invoices/events; official payment operations use a shared persistent counter and immutable stage documents in database RPCs, with production issuance rejected until fiscal and SIF readiness is verified.
- Billing RPCs require a server-verified billing_admin role; test invoice emails target only a separately authorized fixed test recipient, never the stored client.
- Invoice PDFs are archived privately with content hashes; dispatch leases and invoice-based idempotency keys prevent concurrent reprocessing, and sent status requires provider acceptance.
- Billing test dispatch shares the reservation Resend transport, restricts delivery to the authorized test mailbox, and blocks stale uncertain retries before provider deduplication expires.
- Fill the supplied stage-specific AcroForm PDFs without rebuilding their artwork; nonfiscal requests and test documents are clearly marked because reservation preparation is not fiscal issuance.
- Persist payment plans and immutable summaries; allocate one operation number transactionally, generate the final stage only after a recorded advance, and reuse document IDs and token leases on retries to prevent duplicate numbers and files.

- Reservation writes use transactional RPCs with payload-bound idempotency and optimistic revisions; integration dispatch uses durable token leases and the reservation reference to avoid concurrent duplicates.
- Reservation emails notify only the fixed internal recipient, never customers, and remain gated until credentials and sender are authorized; retries reuse the original reference key.
- Reservation mail snapshots include available archived PDFs and a preparation timestamp; retries stop before provider deduplication expires, and buyer preparation has no enabled dispatch path, preventing uncertain duplicate sends.
- Verified-email signup grants the explicitly authorized reservation manager role; temporary test permissions are revoked after controlled checks.
- Internal modification/error notices are unique per reservation revision and event, dispatched under its durable lease; revision-scoped PDF bundles prevent stale downloads after edits.
- Invoice Notion mapping targets existing properties and a managed detail block, with test writes blocked for the production source; this preserves schema and prevents fictitious fiscal records.
- Reservation document preparation is shared by submission and the private panel; archive individual PDFs before the immutable revision bundle so the initial internal notice can attach the exact stored nonfiscal document.
- Payment operations reuse the stored reservation pricing summary when linked; never rebuild a linked delivery order as pickup, because that loses shipping in the archived PDF snapshot.
