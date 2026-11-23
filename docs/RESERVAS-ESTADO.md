# Circuito de reservas — comprobaciones 19/11/2026

## Verificación adicional de cierre · 23:21 UTC

Esta sección sustituye los importes y límites de las comprobaciones anteriores: el IVA actual es el 10 % de la base conjunta de rosas y transporte. Los apartados inferiores son evidencia histórica, no resultados actuales.

- Calculadora en navegador, escritorio y móvil, con direcciones geocodificadas reales: 50 rosas/Barcelona = 169,40 €; 55/Badalona = 188,10 €; 100/dos Barcelona = 338,80 €; 150/Barcelona+Badalona = 506,00 €; 150/dos Barcelona+Badalona = 510,40 €. Estos cinco casos verifican cálculo, no cinco reservas completas.
- Una reserva ficticia de 50 rosas/Barcelona guardada desde formulario, recuperada en panel y modificada; estado y notas persisten tras recarga. Cuatro reintentos concurrentes devuelven la misma fila; cambio de contenido con igual clave rechazado.
- Documentos U0003, M0004.1 y M0004.2 exclusivamente TEST, archivados privadamente y descargados desde panel tras recarga. Revisión visual de las tres plantillas sin sustitución del diseño. Base conjunta 154 €, IVA 15,40 €, total 169,40 €. Anticipo/saldo: base 77 € + 77 €, IVA 7,70 € + 7,70 €, total 84,70 € + 84,70 €. Saldo bloqueado antes del anticipo; simulación de 84,70 € autorizada por Eduard a las 23:19 UTC y registrada únicamente en comanda ficticia. No hubo pago real ni emisión fiscal.
- Preparación inicial y panel comparten el archivo de PDF por revisión; los PDFs individuales se archivan antes del bundle y del aviso interno.
- Una única prueba interna a solidaristjordi@gmail.com con el PDF privado de reserva adjunto aceptada por Resend; Eduard confirmó recepción y apertura del PDF a las 23:21 UTC. No correos a compradores ni reenvío de la prueba.
- Notion mediante «Eduard's Notion»: creación, actualización y recuperación HTTP 200 de una fila técnica claramente no fiscal en cada base; consulta devuelve una sola fila por referencia. Eso no prueba sincronización automática ni reintento de creación del servidor. PDF Notion no probado. Conexión aún no enlazable al proyecto por falta de acceso del propietario; esquema de facturas actual tiene cuatro campos, no todos los campos solicitados. Integración completa pendiente.
- 113 pruebas automáticas en 27 archivos pasan; última compilación correcta. Rol temporal billing_admin retirado, ninguna autorización temporal restante. Numeración productiva no utilizada, sin publicación ni cambios visuales.

### Pendientes actuales

Revisión adicional del resultado: repetidos los cinco cálculos y paso de contacto en catalán/castellano a 1280×1800 y 390×844 (20 recorridos); los tres PDF descargados desde panel tras recarga en ambas lenguas/tamaños (12 descargas). Sin errores de navegador ni desbordamiento horizontal. Sin sesión se redirige a autenticación; al retirar el rol temporal aparece acceso reservado. No se guardaron nuevas reservas ni se enviaron más correos. Tres PDF TEST descargados preparados para entregar al usuario. La aplicación no ofrece selector de tema oscuro.

1. Compartir/enlazar Notion con propietario y verificar automáticamente ambas bases, relaciones y PDF privado; requiere resolver acceso y destino aislado para documentos TEST.
2. Recepción/apertura del único correo interno confirmadas; no reenviar.
3. Primer acceso del equipo y validaciones fiscales/SIF antes de activar facturación real.
4. Reintentos desatendidos/seguimiento de entrega y recorridos de reserva íntegros de cada combinación múltiple no verificados en esta sesión.

## Resultado del cierre solicitado

El circuito NO puede considerarse plenamente operativo: la conexión «Eduard's Notion» funciona para llamadas de prueba desde el chat, pero no está enlazada al proyecto. El servidor recibió HTTP 401 `Credential not found`. Compartirla con el propietario con permiso Can use y enlazarla al proyecto sigue pendiente. No se cambió ninguna credencial ni se publicó.

- Transporte centralizado: 4 € Barcelona municipio y 6 € fuera, por destino, antes de IVA; conserva 10 % configurado. Municipio/código postal ambiguos dejan importe pendiente.
- Panel: búsqueda y filtro de estado, desglose por dirección, edición persistente, estados de integraciones, historial de avisos y preparación/descarga privada de documentos.
- Reserva ficticia SJ27-0575E33A9BFF48238007AA04D33AD853 recuperada tras recarga, modificada a confirmada, revisión 2. 50 rosas: base 150 €, IVA rosas 15 €, transporte 4 € + 0,84 €, total 169,84 €.
- PDF descargado desde esa reserva y revisado visualmente; datos y transporte correctos, marca NO ES UNA FACTURA FISCAL. Archivo por revisión evita recuperar PDFs de una versión anterior.
- Avisos internos de nueva reserva, modificación y fallo Notion aceptados por Resend y guardados como enviados. Esto demuestra aceptación del proveedor, no recepción de esos avisos en el buzón. No se enviaron correos a compradores.
- Permiso billing_admin temporal retirado; navegador confirmó «Accés reservat a l’equip autoritzat» después de retirarlo.
- 108 pruebas automatizadas superadas en 26 archivos; última comprobación del proyecto sin errores.
- Revisión adicional: formulario CA/ES a 1280×1800, 390×844 y 1068×639; 49 rosas bloqueadas, 50 aceptadas para avanzar, pago único y fraccionado conservados en la revisión previa. Capturas revisadas, sin desbordamiento ni errores de navegador. Acceso sin sesión redirige a /auth. No se pulsó la confirmación final ni se enviaron nuevos avisos. Existe una sola paleta, sin selector de tema oscuro. El panel autorizado y el PDF se comprobaron en la sesión anterior; no se restauraron permisos temporales para repetirlos.

## Las 14 comprobaciones obligatorias

| Nº | Prueba | Resultado y alcance real |
|---|---|---|
| 1 | Un local Barcelona | Navegador → reserva persistente → panel → PDF: 4 € + IVA 0,84 €. |
| 2 | Un local fuera | Prueba automática con geocodificador simulado Badalona: 6 €. No recorrido completo real en esta sesión. |
| 3 | Dos locales Barcelona | Prueba de cálculo: 8 € antes de IVA. No reserva real integral en esta sesión. |
| 4 | Barcelona y fuera | Prueba de cálculo: 10 € antes de IVA; IVA transporte 2,10 €. |
| 5 | Varios locales/cantidades | Prueba de cálculo con 150 rosas y tarifas 4/6; total 507,10 €. No recorrido integral real. |
| 6 | Pago único | Reserva de prueba persistente y documento descargado: 169,84 €. |
| 7 | Fraccionado | Prueba de reparto: 253,55 € + 253,55 € del total 507,10 €; generación de modelos anticipo/final probada automáticamente. No envío externo. |
| 8 | Modificación | Estado y notas guardados, revisión 2 recuperada en panel tras recarga. |
| 9 | Persistencia Cloud | Lectura directa y recuperación en navegador coinciden. |
| 10 | Notion crear/actualizar | Llamadas directas de prueba HTTP 200: creación, actualización 50→100 y consulta por referencia devolvieron un solo registro. Página ficticia archivada. Sincronización del servidor BLOQUEADA. |
| 11 | PDF | Generación, archivo privado, descarga de reserva y revisión visual satisfactorios. |
| 12 | Numeración/duplicados | Contador global U/M existente sin cambios; pruebas anteriores reales documentadas debajo. Nuevas pruebas de reintento y protección pasan; no se emitieron facturas reales. |
| 13 | Resend interno | Proveedor aceptó avisos y estados persistidos. Recepción en buzón no verificada en esta sesión. |
| 14 | Móvil/escritorio | Panel con reserva a 390×844 y 1280×1800, sin desbordamiento horizontal ni errores de navegador. |

## Bloqueos y límites pendientes

1. Compartir y enlazar Notion con el propietario, después repetir el recorrido automático completo. Acceso desde chat NO equivale a acceso del servidor.
2. Facturas Notion: ambas bases pueden leerse; mapeo a propiedades existentes y actualización idempotente preparados y probados con simulaciones. No conectados a un envío productivo ni verificados con PDF subido a Notion. Las facturas ficticias están bloqueadas para esa base de producción; falta destino aislado para comprobarlas.
3. Completar recorridos reales para destinos externos/múltiples y pago fraccionado; hoy esos casos están probados automáticamente, no integralmente.
4. Los avisos de errores de documentos tienen tipo y almacenamiento preparados; no todos los generadores los disparan aún. Sin reintento programado desatendido ni seguimiento de entregas por eventos.
5. Primer acceso del equipo autorizado y validación fiscal/SIF antes de cualquier activación fiscal. Compradores y emisión fiscal siguen desactivados.

## Historial de verificaciones anteriores (no repetir como pruebas de esta sesión)

- Verificado en navegador: formulario → guardado → referencia → panel autenticado → estado/notas → lectura tras recarga → Notion.
- Verificado: cambio a entrega, dirección de Barcelona y franja 22/04 mañana, recuperación y sincronización en una sola página Notion.
- Concurrencia real: cuatro llamadas con misma clave devolvieron una misma reserva; contenido distinto rechazado; dos ediciones concurrentes produjeron un ganador; dos procesadores produjeron una sola concesión.
- 66 pruebas unitarias superadas. Correos desactivados y cero envíos; fallos de integración conservan reserva y se reintentan desde el panel. No hay reintento programado desatendido.
- Notion activado y fuente existente intacta. Reservas ficticias eliminadas; sus páginas Notion archivadas. Auditoría de operaciones de prueba conservada.
- Avisos internos conectados con destinatario fijo, Reply-To del contacto, sobre original conservado y clave basada en referencia; envío real no verificado.
- Actualización Resend 18/11 15:33 UTC: prueba real con PDF desde pedidos@santjordisolidari.es a eduard.moreira@alumni.esade.edu aceptada HTTP 200, ID 01a1ef4b-4762-7676-9d50-429716097d2a. Recepción confirmada por Eduard a las 15:35 UTC. Clave válida para enviar. Consulta de dominios y de entrega rechazadas HTTP 401 restricted_api_key: «This API key is restricted to only send emails». No requiere sustitución para enviar; seguimiento por API requiere permisos de lectura o eventos de entrega.
- Avisos internos activados y conectados, únicamente a solidaristjordi@gmail.com; no se han probado envíos reales de reservas en esta actualización. Confirmaciones bilingües al comprador preparadas pero sin envío habilitado, incluida protección del camino histórico de correos.
- Facturación ficticia conectada al mismo transporte con PDF y destinatario de prueba fijo eduard.moreira@alumni.esade.edu; sin emitir facturas reales ni probar el circuito fiscal completo.
- PDF: se adjunta el conjunto privado ya archivado si existe al preparar el aviso; no genera ni emite facturas al reservar. Documentos archivados después no provocan otro correo. Sobre y adjuntos conservados para reintentos idénticos.
- Reintentos automáticos limitados para 429/5xx; reintento manual desde panel para fallos. Resultados inciertos de más de 23 horas requieren revisión para no sobrepasar las 24 horas de deduplicación de Resend. No hay tarea programada de reintento ni seguimiento de entregas implementados.
- Acceso permanente preparado para correo verificado solidaristjordi@gmail.com; requiere primer inicio de sesión Google/Lovable. Cuenta temporal usada y rol retirado; denegación sin rol comprobada.
- Sin cambios visuales de la web pública ni publicación. Facturación y documentos no forman parte de esta corrección.