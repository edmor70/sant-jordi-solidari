import type { ReactNode } from "react";
import { CAMPAIGN } from "@/lib/campaign";
import { useI18n, type Lang } from "@/lib/i18n";
import { CopyEmail } from "@/components/site/CopyEmail";
import { paymentCopy } from "@/lib/i18n/payment";

export function Pending({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  return <mark className="rounded bg-warning px-1.5 py-0.5 text-sm text-warning-foreground">[{t.legalPending}{children ? `: ${children}` : ""}]</mark>;
}

const C = CAMPAIGN.company;
const mail = <a className="link" href={`mailto:${CAMPAIGN.contactEmail}`}>{CAMPAIGN.contactEmail}</a>;

export function Owner({ lang }: { lang: Lang }) {
  const L = lang === "ca"
    ? { o: "Titular", n: "NIF", a: "Domicili social", e: "Correu electrònic", r: "Dades registrals" }
    : { o: "Titular", n: "NIF", a: "Domicilio social", e: "Correo electrónico", r: "Datos registrales" };
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-xl bg-paper p-5 sm:grid-cols-[12rem_1fr]">
      <dt className="font-semibold">{L.o}</dt><dd>{C.name}</dd>
      <dt className="font-semibold">{L.n}</dt><dd>{C.nif}</dd>
      <dt className="font-semibold">{L.a}</dt><dd>{C.address[lang]}</dd>
      <dt className="font-semibold">{L.e}</dt><dd className="flex flex-wrap items-center gap-x-3 gap-y-1">{mail}<CopyEmail email={CAMPAIGN.contactEmail} /></dd>
      <dt className="font-semibold">{L.r}</dt><dd>{C.registry[lang]}</dd>
    </dl>
  );
}

const S = ({ h, children }: { h: string; children: ReactNode }) => (
  <section className="mt-10"><h2 className="font-display text-2xl">{h}</h2><div className="mt-3 space-y-3 leading-relaxed">{children}</div></section>
);

export function LegalNotice({ lang }: { lang: Lang }) {
  if (lang === "es")
    return (
      <>
        <S h="1. Identificación del titular"><p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa de los datos del titular de esta web:</p><Owner lang="es" /></S>
        <S h="2. Objeto"><p>Esta web presenta la campaña de rosas solidarias de Sant Jordi {CAMPAIGN.year} y permite enviar solicitudes de presupuesto. El envío de una solicitud no constituye un pedido ni implica ningún pago.</p></S>
        <S h="3. Condiciones de uso"><p>La persona usuaria se compromete a hacer un uso adecuado de la web y a facilitar información veraz en las solicitudes.</p></S>
        <S h="4. Propiedad intelectual e industrial"><p>Los textos y el diseño de la web pertenecen a {C.name}. El logotipo de la Fundació Josep Carreras contra la Leucèmia pertenece a dicha Fundación y se utiliza en el marco de la colaboración para esta campaña.</p></S>
        <S h="5. Enlaces externos"><p>La web incluye enlaces a sitios de terceros (Fundació Josep Carreras, proveedor de referencia). {C.name} no se responsabiliza de sus contenidos.</p></S>
        <S h="6. Legislación aplicable"><p>Se aplica la legislación española. <Pending>fuero y cláusulas adicionales</Pending></p></S>
        <S h={`7. ${paymentCopy.es.heading}`}><p>{paymentCopy.es.maturity}</p></S>
      </>
    );
  return (
    <>
      <S h="1. Identificació del titular"><p>En compliment de la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE), s'informa de les dades del titular d'aquest web:</p><Owner lang="ca" /></S>
      <S h="2. Objecte"><p>Aquest web presenta la campanya de roses solidàries de Sant Jordi {CAMPAIGN.year} i permet enviar sol·licituds de pressupost. L'enviament d'una sol·licitud no constitueix una comanda ni implica cap pagament.</p></S>
      <S h="3. Condicions d'ús"><p>La persona usuària es compromet a fer un ús adequat del web i a facilitar informació veraç a les sol·licituds.</p></S>
      <S h="4. Propietat intel·lectual i industrial"><p>Els textos i el disseny del web pertanyen a {C.name}. El logotip de la Fundació Josep Carreras contra la Leucèmia pertany a aquesta Fundació i s'utilitza en el marc de la col·laboració per a aquesta campanya.</p></S>
      <S h="5. Enllaços externs"><p>El web inclou enllaços a llocs de tercers (Fundació Josep Carreras, proveïdor de referència). {C.name} no es fa responsable dels seus continguts.</p></S>
      <S h="6. Legislació aplicable"><p>S'aplica la legislació espanyola. <Pending>fur i clàusules addicionals</Pending></p></S>
      <S h={`7. ${paymentCopy.ca.heading}`}><p>{paymentCopy.ca.maturity}</p></S>
    </>
  );
}

export function Privacy({ lang }: { lang: Lang }) {
  if (lang === "es")
    return (
      <>
        <S h="1. Responsable del tratamiento"><Owner lang="es" /></S>
        <S h="2. Datos que tratamos"><p>Solo los que nos facilitas en el formulario de presupuesto: razón social de la empresa, nombre y apellidos, correo electrónico y teléfono de la persona de contacto, direcciones de entrega con sus cantidades, franjas y detalles de acceso, y observaciones. Para limitar envíos abusivos guardamos una huella cifrada e irreversible de la dirección IP, no la IP.</p></S>
        <S h="3. Finalidad"><p>Tramitar tu solicitud de presupuesto, calcular el transporte, contactar contigo para confirmar disponibilidad, importe y entrega o recogida, y gestionar el pedido si lo confirmas. No enviamos comunicaciones comerciales.</p></S>
        <S h="4. Base jurídica"><p>La aplicación de medidas precontractuales a petición tuya y, en su caso, la ejecución del contrato (art. 6.1.b RGPD). La huella de IP se trata por interés legítimo en proteger el formulario (art. 6.1.f RGPD).</p></S>
        <S h="5. Conservación"><p>Durante la gestión de la campaña de Sant Jordi {CAMPAIGN.year} y, si se formaliza un pedido, durante los plazos legales de conservación. <Pending>periodo concreto de conservación de solicitudes no confirmadas</Pending></p></S>
        <S h="6. Destinatarios y encargados del tratamiento"><p>No cedemos tus datos a terceros salvo obligación legal. Utilizamos estos proveedores como encargados del tratamiento:</p>
          <ul className="list-disc pl-6"><li>Lovable (alojamiento de la web, base de datos privada y envío de correos).</li><li>OpenStreetMap Nominatim y OSRM: reciben la dirección de entrega (sin nombre ni contacto) para localizarla y calcular la ruta.</li></ul>
          <p><Pending>contratos de encargo y proveedores definitivos de correo y rutas</Pending></p></S>
        <S h="7. Transferencias internacionales"><p><Pending>verificar si algún proveedor trata datos fuera del Espacio Económico Europeo y las garantías aplicables</Pending></p></S>
        <S h="8. Tus derechos"><p>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {mail}. Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (<a className="link" href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).</p></S>
        <S h="9. Cookies y almacenamiento local"><p>Esta web no utiliza cookies de analítica, publicidad ni otras cookies opcionales. Solo guarda en tu navegador tu preferencia de idioma (almacenamiento local) y, mientras rellenas el formulario, un borrador que se elimina al cerrar la pestaña o al enviar la solicitud (almacenamiento de sesión). Son necesarios para el funcionamiento solicitado y no se comparten.</p></S>
      </>
    );
  return (
    <>
      <S h="1. Responsable del tractament"><Owner lang="ca" /></S>
      <S h="2. Dades que tractem"><p>Només les que ens facilites al formulari de pressupost: raó social de l'empresa, nom i cognoms, correu electrònic i telèfon de la persona de contacte, adreces d'entrega amb les quantitats, franges i detalls d'accés, i observacions. Per limitar enviaments abusius desem una empremta xifrada i irreversible de l'adreça IP, no la IP.</p></S>
      <S h="3. Finalitat"><p>Tramitar la teva sol·licitud de pressupost, calcular el transport, contactar amb tu per confirmar disponibilitat, import i entrega o recollida, i gestionar la comanda si la confirmes. No enviem comunicacions comercials.</p></S>
      <S h="4. Base jurídica"><p>L'aplicació de mesures precontractuals a petició teva i, si escau, l'execució del contracte (art. 6.1.b RGPD). L'empremta d'IP es tracta per interès legítim en protegir el formulari (art. 6.1.f RGPD).</p></S>
      <S h="5. Conservació"><p>Durant la gestió de la campanya de Sant Jordi {CAMPAIGN.year} i, si es formalitza una comanda, durant els terminis legals de conservació. <Pending>període concret de conservació de sol·licituds no confirmades</Pending></p></S>
      <S h="6. Destinataris i encarregats del tractament"><p>No cedim les teves dades a tercers excepte per obligació legal. Utilitzem aquests proveïdors com a encarregats del tractament:</p>
        <ul className="list-disc pl-6"><li>Lovable (allotjament del web, base de dades privada i enviament de correus).</li><li>OpenStreetMap Nominatim i OSRM: reben l'adreça d'entrega (sense nom ni contacte) per localitzar-la i calcular la ruta.</li></ul>
        <p><Pending>contractes d'encàrrec i proveïdors definitius de correu i rutes</Pending></p></S>
      <S h="7. Transferències internacionals"><p><Pending>verificar si algun proveïdor tracta dades fora de l'Espai Econòmic Europeu i les garanties aplicables</Pending></p></S>
      <S h="8. Els teus drets"><p>Pots exercir els drets d'accés, rectificació, supressió, oposició, limitació i portabilitat escrivint a {mail}. Si consideres que no hem tractat bé les teves dades, pots presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (<a className="link" href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).</p></S>
      <S h="9. Galetes i emmagatzematge local"><p>Aquest web no utilitza galetes d'analítica, publicitat ni altres galetes opcionals. Només desa al navegador la teva preferència d'idioma (emmagatzematge local) i, mentre omples el formulari, un esborrany que s'elimina en tancar la pestanya o en enviar la sol·licitud (emmagatzematge de sessió). Són necessaris per al funcionament sol·licitat i no es comparteixen.</p></S>
    </>
  );
}

export function Terms({ lang }: { lang: Lang }) {
  if (lang === "es")
    return (
      <>
        <S h="1. Campaña para empresas y facturación"><p>La campaña de Sant Jordi {CAMPAIGN.year} se dirige exclusivamente a empresas. Todos los pedidos se facturan a la empresa cliente. En el formulario te pedimos la razón social y el nombre y el correo de la persona de contacto; si faltan el NIF, el domicilio fiscal o el correo de facturación, te los pediremos al preparar el presupuesto definitivo.</p></S>
        <S h="2. Presupuesto orientativo"><p>El importe que muestra la web es una estimación calculada con los precios vigentes de la campaña. El tipo de IVA aplicable, el transporte y su tratamiento fiscal están sujetos a confirmación. Los puntos de libro los vende directamente la Fundació Josep Carreras en su tienda; no forman parte de nuestros pedidos ni de nuestras facturas. Enviar la solicitud es gratuito y no implica ningún pago ni reserva.</p></S>
        <S h="3. Presupuesto definitivo y reserva"><p>Al revisar tu solicitud, te enviamos por correo un presupuesto definitivo con las unidades, el precio total con IVA y el transporte aplicable, las condiciones de entrega o recogida y los importes exactos del anticipo y del saldo. Para reservar, la empresa acepta por escrito el presupuesto y sus condiciones y abona por transferencia el 50 % del total, indicando la referencia del pedido. Confirmamos la reserva por correo una vez recibido el anticipo.</p><p>En cuanto confirmamos tu pedido, encargamos las rosas y abonamos su coste a nuestro proveedor. El anticipo del 50 % nos permite cubrir ese desembolso y hace viable la campaña.</p></S>
        <S h={`4. ${paymentCopy.es.heading}`}><p>{paymentCopy.es.maturity}</p></S>
        <S h="5. Cancelación de pedidos confirmados"><p>Puedes comunicar una cancelación total o parcial escribiendo a {mail} e indicando la referencia del pedido. Desde la confirmación de la reserva, toda cancelación a iniciativa de la empresa conlleva una compensación del 50 % del importe definitivo de la parte cancelada. Si cancelas el pedido completo, se retiene el anticipo íntegro. Si cancelas solo una parte, se retiene el 50 % del importe de esa parte y se recalcula el saldo del pedido que sigue en vigor. Si ya habías pagado más de lo que corresponde a la parte cancelada tras aplicar la compensación, te devolvemos la diferencia.</p><p>Si {C.name} cancela o no puede cumplir todo o parte del pedido, te devolvemos íntegramente lo abonado por la parte que no podamos suministrar, salvo que aceptes una alternativa.</p></S>
        <S h="6. Entrega, recogida y comunicaciones"><p>Te comunicaremos por correo electrónico la disponibilidad, los impuestos aplicables, el coste de los portes y la confirmación de las franjas de reparto solicitadas, que están sujetas a disponibilidad. En caso de recogida, el punto y el horario se definirán en función de la demanda y te los confirmaremos antes de cerrar el pedido.</p></S>
        <S h="7. Cambios e incidencias"><p>Para cualquier cambio o incidencia, escríbenos a {mail} indicando la referencia de tu solicitud.</p></S>
      </>
    );
  return (
    <>
      <S h="1. Campanya per a empreses i facturació"><p>La campanya de Sant Jordi {CAMPAIGN.year} s'adreça exclusivament a empreses. Totes les comandes es facturen a l'empresa clienta. Al formulari et demanem la raó social i el nom i el correu de la persona de contacte; si falten el NIF, el domicili fiscal o el correu de facturació, te'ls demanarem en preparar el pressupost definitiu.</p></S>
      <S h="2. Pressupost orientatiu"><p>L'import que mostra el web és una estimació calculada amb els preus vigents de la campanya. El tipus d'IVA aplicable, el transport i el seu tractament fiscal estan subjectes a confirmació. Els punts de llibre els ven directament la Fundació Josep Carreras a la seva botiga; no formen part de les nostres comandes ni de les nostres factures. Enviar la sol·licitud és gratuït i no implica cap pagament ni reserva.</p></S>
      <S h="3. Pressupost definitiu i reserva"><p>En revisar la teva sol·licitud, t'enviem per correu un pressupost definitiu amb les unitats, el preu total amb IVA i el transport aplicable, les condicions d'entrega o recollida i els imports exactes de l'anticip i del saldo. Per reservar, l'empresa accepta per escrit el pressupost i les seves condicions i abona per transferència el 50 % del total, indicant la referència de la comanda. Confirmem la reserva per correu un cop rebut l'anticip.</p><p>Tan bon punt confirmem la teva comanda, encarreguem les roses i en abonem el cost al nostre proveïdor. L'anticip del 50 % ens permet cobrir aquest desemborsament i fa viable la campanya.</p></S>
      <S h={`4. ${paymentCopy.ca.heading}`}><p>{paymentCopy.ca.maturity}</p></S>
      <S h="5. Cancel·lació de comandes confirmades"><p>Pots comunicar una cancel·lació total o parcial escrivint a {mail} i indicant la referència de la comanda. Des de la confirmació de la reserva, tota cancel·lació a iniciativa de l'empresa comporta una compensació del 50 % de l'import definitiu de la part cancel·lada. Si cancel·les la comanda completa, es reté l'anticip íntegre. Si només en cancel·les una part, es reté el 50 % de l'import d'aquesta part i es recalcula el saldo de la comanda que segueix en vigor. Si ja havies pagat més del que correspon a la part cancel·lada després d'aplicar la compensació, et tornem la diferència.</p><p>Si {C.name} cancel·la o no pot complir tota o part de la comanda, et tornem íntegrament allò abonat per la part que no puguem subministrar, llevat que acceptis una alternativa.</p></S>
      <S h="6. Entrega, recollida i comunicacions"><p>Et comunicarem per correu electrònic la disponibilitat, els impostos aplicables, el cost dels ports i la confirmació de les franges de repartiment sol·licitades, que estan subjectes a disponibilitat. En cas de recollida, el punt i l'horari es definiran en funció de la demanda i te'ls confirmarem abans de tancar la comanda.</p></S>
      <S h="7. Canvis i incidències"><p>Per a qualsevol canvi o incidència, escriu-nos a {mail} indicant la referència de la teva sol·licitud.</p></S>
    </>
  );
}
