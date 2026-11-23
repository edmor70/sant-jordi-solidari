import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyEmail } from "@/components/site/CopyEmail";
import { Owner } from "@/components/site/Legal";
import { I18nProvider } from "@/lib/i18n";

const EMAIL = "solidaristjordi@gmail.com";

function setClipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem("sjs-lang");
});

// The button is the fallback when the mail app does not open: it must copy this exact address.
describe("Copiar el correo de contacto", () => {
  it("copia la dirección exacta y lo confirma en català", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    const { getByRole, getByText } = render(<CopyEmail email={EMAIL} />);

    fireEvent.click(getByRole("button", { name: `Copia el correu: ${EMAIL}` }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(EMAIL));
    expect(getByText("Correu copiat")).toBeTruthy();
  });

  it("lo confirma en castellano", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    localStorage.setItem("sjs-lang", "es");
    const { findByRole, getByText } = render(
      <I18nProvider>
        <CopyEmail email={EMAIL} />
      </I18nProvider>,
    );

    fireEvent.click(await findByRole("button", { name: `Copia el correo: ${EMAIL}` }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(EMAIL));
    expect(getByText("Correo copiado")).toBeTruthy();
  });

  it("avisa si no puede copiar", async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    document.execCommand = vi.fn(() => false);
    const { getByRole, getByText } = render(<CopyEmail email={EMAIL} />);

    fireEvent.click(getByRole("button", { name: `Copia el correu: ${EMAIL}` }));

    await waitFor(() => expect(getByText("No s'ha pogut copiar. Escriu-lo a mà.")).toBeTruthy());
  });

  it("está junto al enlace de correo del aviso legal", () => {
    const { getByRole, container } = render(<Owner lang="ca" />);
    expect(getByRole("button", { name: `Copia el correu: ${EMAIL}` })).toBeTruthy();
    expect(container.querySelector('a[href="mailto:solidaristjordi@gmail.com"]')).toBeTruthy();
  });
});
