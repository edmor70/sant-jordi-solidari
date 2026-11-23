import { useEffect } from "react";
import { useI18n, type Lang } from "./index";

export const SEO = {
  billing: {
    ca: { title: "Facturació privada · Sant Jordi Solidari Barcelona", description: "Gestió privada de reserves, comandes, pagaments i factures de Sant Jordi Solidari Barcelona." },
    es: { title: "Facturación privada · Sant Jordi Solidari Barcelona", description: "Gestión privada de reservas, pedidos, pagos y facturas de Sant Jordi Solidari Barcelona." },
  },
  auth: {
    ca: { title: "Accés de l'equip · Sant Jordi Solidari Barcelona", description: "Accés privat per a l'equip de Sant Jordi Solidari Barcelona." },
    es: { title: "Acceso del equipo · Sant Jordi Solidari Barcelona", description: "Acceso privado para el equipo de Sant Jordi Solidari Barcelona." },
  },
  collaboration: {
    ca: { title: "Col·laboració solidària · Sant Jordi Solidari Barcelona", description: "El nostre compromís solidari amb la Fundació Josep Carreras: aportacions i transparència." },
    es: { title: "Colaboración solidaria · Sant Jordi Solidari Barcelona", description: "Nuestro compromiso solidario con la Fundación Josep Carreras: aportaciones y transparencia." },
  },
  impact: {
    ca: { title: "Donem 0,20 € per rosa · Sant Jordi Solidari Barcelona", description: "Consulta la donació de 0,20 € per rosa comprada i la taula d'aportacions a la Fundació Josep Carreras contra la Leucèmia." },
    es: { title: "Donamos 0,20 € por rosa · Sant Jordi Solidari Barcelona", description: "Consulta la donación de 0,20 € por rosa comprada y la tabla de aportaciones a la Fundación Josep Carreras contra la Leucemia." },
  },
  certificates: {
    ca: { title: "Certificats de col·laboració · Sant Jordi Solidari Barcelona", description: "Documentació i compromís de transparència de la campanya solidària." },
    es: { title: "Certificados de colaboración · Sant Jordi Solidari Barcelona", description: "Documentación y compromiso de transparencia de la campaña solidaria." },
  },
  contact: {
    ca: { title: "Contacte · Sant Jordi Solidari Barcelona", description: "Contacta amb l'equip d'estudiants d'ESADE per consultar sobre les comandes i la col·laboració solidària." },
    es: { title: "Contacto · Sant Jordi Solidari Barcelona", description: "Contacta con el equipo de estudiantes de ESADE para consultar sobre pedidos y colaboración solidaria." },
  },
  home: {
    ca: { title: "Sant Jordi Solidari Barcelona · Roses solidàries Sant Jordi 2027", description: "Roses solidàries de Sant Jordi 2027 per a empreses, en col·laboració amb la Fundació Josep Carreras contra la Leucèmia." },
    es: { title: "Sant Jordi Solidari Barcelona · Rosas solidarias Sant Jordi 2027", description: "Rosas solidarias de Sant Jordi 2027 para empresas, en colaboración con la Fundació Josep Carreras contra la Leucèmia." },
  },
  about: {
    ca: { title: "Qui som · Sant Jordi Solidari Barcelona", description: "Una iniciativa d'estudiants de Barcelona que porta roses solidàries a empreses per Sant Jordi." },
    es: { title: "Quiénes somos · Sant Jordi Solidari Barcelona", description: "Una iniciativa de estudiantes de Barcelona que lleva rosas solidarias a empresas por Sant Jordi." },
  },
  products: {
    ca: { title: "Roses i punts de llibre · Sant Jordi Solidari Barcelona", description: "Rosa solidària de Sant Jordi preparada individualment, amb preus i condicions, i punt de llibre de la Fundació Josep Carreras que es compra a la botiga de la Fundació." },
    es: { title: "Rosas y puntos de libro · Sant Jordi Solidari Barcelona", description: "Rosa solidaria de Sant Jordi preparada individualmente, con precios y condiciones, y punto de libro de la Fundació Josep Carreras que se compra en la tienda de la Fundación." },
  },
  diada: {
    ca: { title: "La Diada de Sant Jordi a la teva empresa · Sant Jordi Solidari", description: "La tradició del 23 d'abril i com celebrar Sant Jordi a l'empresa amb una rosa solidària, fins i tot a diverses seus." },
    es: { title: "La Diada de Sant Jordi en tu empresa · Sant Jordi Solidari", description: "La tradición del 23 de abril y cómo celebrar Sant Jordi en la empresa con una rosa solidaria, incluso en varias sedes." },
  },
  foundation: {
    ca: { title: "Fundació Josep Carreras · Sant Jordi Solidari Barcelona", description: "Col·laborem amb la Fundació Josep Carreras contra la Leucèmia: recerca, REDMO, experiència del pacient i pisos d'acollida." },
    es: { title: "Fundación Josep Carreras · Sant Jordi Solidari Barcelona", description: "Colaboramos con la Fundació Josep Carreras contra la Leucèmia: investigación, REDMO, experiencia del paciente y alojamientos." },
  },
  letter: {
    ca: { title: "Carta de suport de la Fundació Josep Carreras · Sant Jordi Solidari", description: "Carta de la Fundació Josep Carreras contra la Leucèmia de suport a la campanya de roses solidàries de Sant Jordi 2027." },
    es: { title: "Carta de apoyo de la Fundació Josep Carreras · Sant Jordi Solidari", description: "Carta de la Fundació Josep Carreras contra la Leucèmia de apoyo a la campaña de rosas solidarias de Sant Jordi 2027." },
  },
  quote: {
    ca: { title: "Calcula el teu pressupost · Sant Jordi Solidari Barcelona", description: "Calcula un pressupost orientatiu de roses solidàries, amb recollida o entrega a una o diverses adreces." },
    es: { title: "Calcula tu presupuesto · Sant Jordi Solidari Barcelona", description: "Calcula un presupuesto orientativo de rosas solidarias, con recogida o entrega en una o varias direcciones." },
  },
  legal: {
    ca: { title: "Avís legal · Sant Jordi Solidari Barcelona", description: "Identificació del titular i condicions d'ús del web de Sant Jordi Solidari Barcelona, S.L." },
    es: { title: "Aviso legal · Sant Jordi Solidari Barcelona", description: "Identificación del titular y condiciones de uso de la web de Sant Jordi Solidari Barcelona, S.L." },
  },
  privacy: {
    ca: { title: "Política de privacitat · Sant Jordi Solidari Barcelona", description: "Com tractem les dades de les sol·licituds de pressupost de roses solidàries." },
    es: { title: "Política de privacidad · Sant Jordi Solidari Barcelona", description: "Cómo tratamos los datos de las solicitudes de presupuesto de rosas solidarias." },
  },
  terms: {
    ca: { title: "Condicions de sol·licitud · Sant Jordi Solidari Barcelona", description: "Pressupost orientatiu i definitiu, reserva amb anticip del 50 %, pagament del saldo i cancel·lació de comandes." },
    es: { title: "Condiciones de solicitud · Sant Jordi Solidari Barcelona", description: "Presupuesto orientativo y definitivo, reserva con anticipo del 50 %, pago del saldo y cancelación de pedidos." },
  },
} as const;

export type SeoKey = keyof typeof SEO;

const PAGE_PATHS: Partial<Record<SeoKey, string>> = {
  home: "/", collaboration: "/colaboracio", impact: "/impacte",
  certificates: "/certificats", contact: "/contacte", foundation: "/fundacio",
  products: "/roses", letter: "/carta-de-suport", quote: "/pressupost",
  legal: "/avis-legal", privacy: "/privacitat", terms: "/condicions",
};

export function seoHead(key: SeoKey, lang: Lang = "ca") {
  const { title, description } = SEO[key][lang];
  const path = PAGE_PATHS[key];
  const url = path === undefined ? undefined : `https://santjordisolidari.lovable.app${path}`;
  return {
    links: url ? [{ rel: "canonical", href: url }] : [],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: lang === "ca" ? "ca_ES" : "es_ES" },
      { property: "og:locale:alternate", content: lang === "ca" ? "es_ES" : "ca_ES" },
      ...(url ? [{ property: "og:url", content: url }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  };
}

/** Sync every existing route head tag, including social tags, with the chosen language. */
export function usePageSeo(key: SeoKey) {
  const { lang } = useI18n();
  useEffect(() => {
    const head = seoHead(key, lang);
    for (const tag of head.meta) {
      if ("title" in tag && tag.title) {
        document.title = tag.title;
      } else if ("content" in tag && tag.content) {
        const selector = "property" in tag
          ? `meta[property="${tag.property}"]`
          : "name" in tag ? `meta[name="${tag.name}"]` : undefined;
        if (selector) document.querySelector(selector)?.setAttribute("content", tag.content);
      }
    }
  }, [key, lang]);
}
