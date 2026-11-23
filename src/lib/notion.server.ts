// Server-only Notion client. NOTION_API_KEY is the workspace's internal integration token
// ("Roses Sòlidaries - Lovable"); it is sent straight to Notion and never leaves the server.
import { NOTION_DATA_SOURCE_ID, notionProperties, type ReservationRow } from "./notion-sync";

const NOTION_API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";
function notionKey() {
  const key = process.env["NOTION_API_KEY"];
  if (!key) throw new Error("NOTION_API_KEY missing");
  return key;
}

export async function notion(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${notionKey()}`, "Notion-Version": VERSION, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

/** Uploads a file to Notion's own storage and returns the file_upload id, ready to attach to a files property. */
export async function notionUploadFile(bytes: Uint8Array, filename: string, contentType = "application/pdf"): Promise<string> {
  const created = await notion("/file_uploads", "POST", { mode: "single_part", filename, content_type: contentType });
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: contentType }), filename);
  const res = await fetch(`${NOTION_API}/file_uploads/${created.id}/send`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Bearer ${notionKey()}`, "Notion-Version": VERSION },
    body: form,
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const sent = await res.json();
  if (sent.status !== "uploaded") throw new Error("notion_file_upload_incomplete");
  return created.id as string;
}

/** Creates or updates the Notion row for a reservation; keyed on the reservation identifier so reprocessing never duplicates. */
export async function syncReservation(row: ReservationRow): Promise<string> {
  const id = row.reference;
  if (row.notion_page_id) return (await notion(`/pages/${row.notion_page_id}`, "PATCH", { properties: notionProperties(row) })).id;
  const q = await notion(`/data_sources/${NOTION_DATA_SOURCE_ID}/query`, "POST", { filter: { property: "Identificador de reserva", rich_text: { equals: id } }, page_size: 1 });
  const properties = notionProperties(row);
  if (q.results[0]) return (await notion(`/pages/${q.results[0].id}`, "PATCH", { properties })).id;
  return (await notion("/pages", "POST", { parent: { type: "data_source_id", data_source_id: NOTION_DATA_SOURCE_ID }, properties })).id;
}
