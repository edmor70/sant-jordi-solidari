import { CAMPAIGN } from "../campaign";

// Shared by the legal notice, order terms, form and private draft PDF.
export const paymentCopy = {
  ca: {
    heading: "Facturació i venciment",
    maturity: `Pots triar un pagament únic o dos pagaments del 50 %. El pagament únic i l’anticip vencen en ${CAMPAIGN.payment.initialBusinessDays} dies hàbils des de la sol·licitud de pagament; el segon pagament venç el 7 d’abril de ${CAMPAIGN.year} a les 23:59. La liquidació es prepara després de confirmar l’anticip; les factures fiscals s’expedeixen quan correspon legalment.`,
    short: `Pagament únic o primer 50 %: ${CAMPAIGN.payment.initialBusinessDays} dies hàbils. Segon 50 %: 7 d’abril de ${CAMPAIGN.year}, 23:59.`,
    label: 'Modalitat de pagament', single: 'Un pagament', split: 'Dos pagaments del 50 %', minimum: `El mínim és de ${CAMPAIGN.minRosesPerDestination} roses.`,
  },
  es: {
    heading: "Facturación y vencimiento",
    maturity: `Puedes elegir un pago único o dos pagos del 50 %. El pago único y el anticipo vencen en ${CAMPAIGN.payment.initialBusinessDays} días hábiles desde la solicitud de pago; el segundo pago vence el 7 de abril de ${CAMPAIGN.year} a las 23:59. La liquidación se prepara tras confirmar el anticipo; las facturas fiscales se expiden cuando corresponde legalmente.`,
    short: `Pago único o primer 50 %: ${CAMPAIGN.payment.initialBusinessDays} días hábiles. Segundo 50 %: 7 de abril de ${CAMPAIGN.year}, 23:59.`,
    label: 'Modalidad de pago', single: 'Un pago', split: 'Dos pagos del 50 %', minimum: `El mínimo es de ${CAMPAIGN.minRosesPerDestination} rosas.`,
  },
};
