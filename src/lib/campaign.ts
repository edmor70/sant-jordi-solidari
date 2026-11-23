/**
 * Single source of truth for campaign values (prices, VAT, dates, links).
 * Change prices, VAT rates or the campaign date here only.
 * Values marked "validated: false" are shown to visitors as pending confirmation.
 */
import letter from "@/assets/carta-suport.pdf?url";
import bookmarkPhoto from "@/assets/punt-llibre-producte.jpg?url";
import roseIllustrative from "@/assets/rosa-ilustrativa.jpg";

export const CAMPAIGN = {
  integrations: { reservationEmailsEnabled: true, buyerConfirmationsEnabled: true, notionAutomationEnabled: true },
  year: 2027,
  donation: {
    perRose: 0.2,
    profitShare: 0.12,
    tableQuantities: [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000],
  },
  dateISO: "2027-04-23",
  rose: {
    basePrice: 3.0, // € per rose, without VAT
    vatRate: 0.1, // 10 % natural flowers — pending validation for the campaign
    vatValidated: false,
  },
  bookmark: {
    // Sold directly by the Fundació Josep Carreras in its own shop: we neither sell nor invoice it.
    shopUrl: "https://tiendafcarreras.org/es/inicio/207-pack-celebracion-marcapaginas",
    // Product photo from the Fundació Josep Carreras shop (design ceded by Mr. Wonderful).
    photo: bookmarkPhoto.url,
  },
  shipping: {
    barcelonaFlat: 4.0, // € per destination inside the municipality of Barcelona
    outsideBase: 6.0, // € per destination outside Barcelona
    outsidePerKm: 0, // Fixed tariff: no distance surcharge
    taxConfigured: true, // Tariffs explicitly confirmed as before VAT; preserve existing rate
    pricesIncludeVat: false, // only used once taxConfigured = true
    vatRate: 0.1, // transport VAT agreed at 10 %
  },
  // Delivery slots (Diada is 23 April; deliveries happen the days before).
  deliverySlots: ["2027-04-21-pm", "2027-04-22-am", "2027-04-22-pm"] as const,
  // The campaign is exclusively for companies; every order is invoiced to the client company.
  b2bOnly: true,
  payment: {
    depositPct: 0.5, // 50 % deposit by transfer (with the order reference) to confirm the reservation
    balanceDeadlineISO: "2027-04-07",
    initialBusinessDays: 3,
    iban: "ES61 2100 1841 0102 0059 5239",
  },
  minRosesPerDestination: 50,
  maxDestinations: 20,
  maxRosesPerDestination: 5000,
  supplierUrl: "https://www.rosessantjordi.com/",
  foundationUrl: "https://fcarreras.org/",
  // Replace with the copy authorised for public distribution before publishing.
  supportLetter: { url: letter.url, dateISO: "2026-11-12", publicCopyAuthorized: false },
  // Replace with the authorised photo of the prepared rose and set authorized: true.
  roseImage: { src: roseIllustrative, authorized: false },
  publicContact: { email: "solidaristjordi@gmail.com", phone: "+34 665 820 657", phoneHref: "+34665820657" },
  contactEmail: "solidaristjordi@gmail.com",
  company: {
    name: "SANT JORDI SOLIDARI BARCELONA, S.L.",
    nif: "B05857750",
    address: {
      ca: "Passatge Maria Llimona, 5, porta 5, 08019 Barcelona",
      es: "Passatge Maria Llimona, 5, puerta 5, 08019 Barcelona",
    },
    // Verified registry data. Published on the legal pages; the registry PDF stays private.
    registry: {
      ca: "Registre Mercantil de Barcelona, full B-666207, inscripció 1a, de data 3 de novembre de 2026. IRUS 1000481369468, foli 0.",
      es: "Registro Mercantil de Barcelona, hoja B-666207, inscripción 1.ª, de fecha 3 de noviembre de 2026. IRUS 1000481369468, folio 0.",
    },
  },
} as const;
