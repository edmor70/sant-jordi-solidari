import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Owner } from "@/components/site/Legal";
import { CAMPAIGN } from "@/lib/campaign";

const PENDING = ["Pendent de revisió", "Pendiente de revisión"];

function text(lang: "ca" | "es") {
  return render(<Owner lang={lang} />).container.textContent ?? "";
}

// The registry entry is verified data: it must be published, never flagged as pending.
describe("Titular del aviso legal", () => {
  it("publica les dades registrals verificades en català", () => {
    const ca = text("ca");
    expect(ca).toContain(
      "Registre Mercantil de Barcelona, full B-666207, inscripció 1a, de data 3 de novembre de 2026. IRUS 1000481369468, foli 0.",
    );
    expect(ca).toContain("SANT JORDI SOLIDARI BARCELONA, S.L.");
    expect(ca).toContain("NIF");
    expect(ca).toContain("B05857750");
    expect(ca).toContain("solidaristjordi@gmail.com");
    for (const p of PENDING) expect(ca).not.toContain(p);
  });

  it("muestra los datos registrales verificados en castellano", () => {
    const es = text("es");
    expect(es).toContain(
      "Registro Mercantil de Barcelona, hoja B-666207, inscripción 1.ª, de fecha 3 de noviembre de 2026. IRUS 1000481369468, folio 0.",
    );
    expect(es).toContain("SANT JORDI SOLIDARI BARCELONA, S.L.");
    expect(es).toContain("NIF");
    expect(es).toContain("B05857750");
    expect(es).toContain("solidaristjordi@gmail.com");
    for (const p of PENDING) expect(es).not.toContain(p);
  });

  it("publica el domicilio social en el idioma de la página", () => {
    expect(text("ca")).toContain("Passatge Maria Llimona, 5, porta 5, 08019 Barcelona");
    expect(text("es")).toContain("Passatge Maria Llimona, 5, puerta 5, 08019 Barcelona");
    expect(CAMPAIGN.company.registry.ca).toContain("B-666207");
    expect(CAMPAIGN.company.registry.es).toContain("B-666207");
  });
});
