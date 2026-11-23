import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

// Clipboard API is the fast path; execCommand covers browsers and sandboxed frames
// where it is unavailable or refused, so the address is always reachable by hand.
async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyEmail({ email }: { email: string }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    const ok = await copyText(email);
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <button
        type="button"
        onClick={onCopy}
        aria-label={`${t.common.copyEmail}: ${email}`}
        className="inline-flex items-center rounded-md border border-input px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {t.common.copyEmail}
      </button>
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {status === "copied" ? t.common.copied : status === "failed" ? t.common.copyFailed : ""}
      </span>
    </span>
  );
}
