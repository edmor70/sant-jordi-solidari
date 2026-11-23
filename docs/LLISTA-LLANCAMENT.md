# Lista privada antes de publicar

Configuración única de precios, IVA, fechas y franjas: `src/lib/campaign.ts`.

- [ ] **Dominio remitente y correo**: verificar un dominio propio (Lovable → Emails) y conectar el aviso interno a solidaristjordi@gmail.com (Reply-To = solicitante). Hasta entonces el formulario guarda la solicitud y muestra "reintentar". Opcional: acuse al cliente en su idioma.
- [ ] **Prueba real**: enviar una solicitud con remitente verificado y comprobar que llega a solidaristjordi@gmail.com.
- [x] Secreto `SHIPPING_ORIGIN` (configurado). Opcionales: `DELIVERY_MAX_KM` (80 por defecto), `DELIVERY_POSTCODE_PREFIXES` ("08"), `GEOCODER_URL`, `ROUTER_URL`.
- [ ] **Proveedor de rutas y cobertura**: ahora OpenStreetMap Nominatim + OSRM público (uso limitado). Valorar un proveedor con contrato para producción.
- [ ] **IVA y portes**: validar 10 % rosas (`rose.vatValidated`), tratamiento fiscal del transporte (`shipping.taxConfigured`, `pricesIncludeVat`, `vatRate`).
- [ ] **Foto autorizada de la rosa** (`roseImage`, ahora ilustrativa).
- [ ] **Versión pública de la carta** de apoyo (`supportLetter`, ahora el PDF adjunto).
- [x] **Punts de llibre**: no els venem nosaltres; el catàleg enllaça a la botiga de la Fundació (`bookmark.shopUrl`).
- [ ] **Textos legales** marcados "Pendiente de revisión" (conservación, encargados, transferencias, pago, cancelación, desistimiento, entregas).
- [ ] **PDF registral**: mantenerlo fuera de la web pública (los datos registrales ya publicados en el aviso legal son suficientes).
- [ ] Contador de visitas de Lovable: desactivarlo en Ajustes del proyecto si se mantiene "sin analítica".

Solicitudes: More → Database → quote_requests (solo accesible al equipo).
