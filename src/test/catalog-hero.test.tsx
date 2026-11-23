import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The hero only needs the Link's destination, so render it as a plain anchor.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
    <a href={to} {...rest}>{children}</a>
  ),
}));

import { CatalogHero } from "@/components/site/Bits";
import { I18nProvider, formatEUR } from "@/lib/i18n";
import { roseLine } from "@/lib/pricing";

// The price must come from the campaign configuration, never from a hardcoded number.
const GROSS_CA = formatEUR(roseLine(1).unitGross, "ca");
const GROSS_ES = formatEUR(roseLine(1).unitGross, "es");

// Intl puts a non-breaking space before the euro sign, so match the raw text of the element.
const price = (value: string) => screen.getByText((_, node) => node?.textContent === value);

afterEach(() => {
  localStorage.removeItem("sjs-lang");
});

describe("Cabecera del catálogo de roses", () => {
  it("muestra título, precio de la configuración y botón de reserva en català", () => {
    render(
      <I18nProvider>
        <CatalogHero />
      </I18nProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Aquest Sant Jordi, regaleu roses. Feu costat a la Fundació Josep Carreras.",
    );
    expect(screen.getByText("Roses naturals vermelles")).toBeTruthy();
    expect(price(GROSS_CA)).toBeTruthy();
    expect(screen.getByText(/per unitat/)).toHaveTextContent("IVA inclòs");
    const cta = screen.getByRole("link", { name: "Calcula el pressupost" });
    expect(cta.getAttribute("href")).toBe("/pressupost");
  });

  it("muestra título, precio y botón de reserva en castellano", async () => {
    localStorage.setItem("sjs-lang", "es");
    render(
      <I18nProvider>
        <CatalogHero />
      </I18nProvider>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: /Este Sant Jordi/ })).toHaveTextContent(
      "Este Sant Jordi, regalad rosas. Apoyad a la Fundació Josep Carreras.",
    );
    expect(price(GROSS_ES)).toBeTruthy();
    expect(screen.getByText("Rosas naturales rojas")).toBeTruthy();
    expect(screen.getByText(/por unidad/)).toHaveTextContent("IVA incluido");
    const cta = screen.getByRole("link", { name: "Calcula el presupuesto" });
    expect(cta.getAttribute("href")).toBe("/pressupost");
  });
});
