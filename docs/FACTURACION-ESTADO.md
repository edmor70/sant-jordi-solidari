# Facturación — estado de implementación y pruebas

## Resultado
Actualización comprobada el 19/11/2026: los tres modelos oficiales se rellenan y aplanan conservando su diseño e IBAN. Se generaron, archivaron y descargaron desde una sesión autorizada U0001 (165 €), M0002.1 (82,50 €) y M0002.2 (82,50 €); el saldo incluye la referencia M0002.1 y el importe abonado. La liquidación fue rechazada antes de registrar el anticipo y admitida después. Cuatro reintentos simultáneos conservaron únicamente tres documentos y el contador en 2; la recarga recuperó el archivo. Son documentos ficticios sin validez fiscal, conservados como registros inmutables de pruebas para no reutilizar su numeración. Se retiró el permiso temporal. No se emitieron facturas reales, enviaron correos ni publicó en esta actualización.

Las 90 pruebas automatizadas pasan. Se revisaron visualmente los tres PDF: se detectó un resto del domicilio anterior bajo el anticipo, se corrigió la zona cubierta y se regeneraron los tres sin solapamientos. El panel se comprobó también en móvil sin desbordamiento. El pago inicial vence en tres días hábiles (lunes a viernes); el saldo, el 07/04/2027 a las 23:59. Los nuevos modelos son los originales castellanos; la web mantiene CA/ES.

Pendiente: validación fiscal/IVA/transporte y SIF, circuito completo de reserva a emisión oficial y automatización real. El transporte de correo y adaptador Notion de los nuevos documentos están preparados, pero no se ejecutaron: falta un destino Notion separado de pruebas y habilitación explícita para probar envíos. Compradores desactivados. Resend ya aceptó una prueba anterior y Eduard confirmó su recepción; no se repitió en esta tarea.

## Auditoría histórica del 18/11/2026 (no representa las comprobaciones nuevas)

| Funcionalidad | Implementación | Pruebas | Pendiente / datos necesarios |
|---|---|---|---|
| Reserva independiente de factura | Guardado con referencia propia, sin emisión ni envío | Formulario recorrido hasta revisión; no envío de datos ficticios | Probar guardado y lectura con sesión autorizada |
| Datos fiscales | NIF, domicilio y correo de facturación opcionales en reserva; completos para preparar pedido | Campos comprobados en pantalla | Confirmar domicilio del emisor como fiscal; ya existe dirección en configuración |
| Pedidos y operaciones | Estados separados, confirmación, anticipo, entrega, cancelación y devolución | Reglas unitarias; no operaciones reales | Correo del equipo y prueba autenticada |
| Numeración | Contadores transaccionales por serie/ejercicio, prefijo TEST; restricción única por evento | Formato unitario comprobado; concurrencia no comprobada en vivo | Ensayo concurrente con usuario autorizado; numeración real no habilitada |
| IVA y descuentos | Cálculos sobre precios actuales: 3,00 € sin IVA; 10 % orientativo | Cálculos concretos comprobados | Validación fiscal de rosa preparada y transporte; no se ha adoptado el precio de 2,50 € del ejemplo |
| Anticipos | Factura ficticia de anticipo; deducción en entrega | Regla de obligación comprobada; operación completa pendiente | Probar reparto y redondeo multiconcepto, rectificación y devolución con sesión |
| Rectificativas | Serie R, vínculo con original y motivo; sin edición de emitidas | No comprobado en base de datos | Probar devoluciones parciales/totales y ajustes no monetarios; no implementados todos los supuestos legales |
| PDF | Plantilla castellana, opción catalana, fechas y totales; archivo privado y huella | Generación local comprobada sin logo histórico | Archivo y descarga desde panel pendientes; recuperar logo y fuente originales (404) |
| Notion | Reservas existentes accesibles; adaptador de factura ficticia preparado | Lectura de la base de reservas: 200 | Crear/verificar base de facturas separada; adaptador aún no incluye todos los campos solicitados ni relación Notion completa |
| Resend | Adjunto, aceptación del proveedor y destinatario fijo de prueba preparados | Consulta de dominios rechazada: clave inválida | Clave válida, remitente verificado y destinatario expresamente autorizado |
| Reintentos | Evento único, factura única, bloqueo temporal de envío y clave idempotente por factura | No comprobado de extremo a extremo | Gestionar aceptación incierta y caducidad de idempotencia Resend antes de producción |
| Panel privado | Acceso Google/Lovable, rol de facturación validado en servidor, búsqueda y descarga/reintento | Redirección a acceso verificada; no probado como equipo autorizado | Usuario del equipo; ningún rol asignado. Usuario ficticio rechazado |
| Integridad | Facturas, eventos y auditoría no admiten modificación/borrado directo; permisos privados | Esquema aplicado y consultado | Verificar con sesión; copias/exportación, conservación y controles SIF completos pendientes |
| Producción y VeriFactu | Bloqueo de emisión real en base de datos | No se han emitido documentos reales | No se afirma cumplimiento SIF/VeriFactu; faltan registros reglamentarios, QR, modalidad y requisitos técnicos verificados |

## Revisión normativa (18/11/2026)
- [RD 1619/2012, texto consolidado](https://boe.es/buscar/act.php?id=BOE-A-2012-14696): contenido de facturas (art. 6), plazos B2B (art. 11), rectificativas con serie separada (art. 15) y conservación (arts. 19–23). Una confirmación sin operación/anticipo no es una factura. La fecha de expedición se toma del reloj del servidor, no del cliente.
- [Ley 37/1992](https://boe.es/buscar/act.php?id=BOE-A-1992-28740): devengo de entrega/anticipos (art. 75), conceptos incluidos en base (art. 78), modificación de base (art. 80), flores naturales al tipo reducido (art. 91). No se resta la aportación solidaria de la base ni se declara donación deducible del comprador. Tratamiento del transporte accesorio y aportación de la sociedad pendiente de asesoría.
- [AEAT: SIF y VeriFactu](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html): incluye aviso de previsión de ampliación de octubre de 2026. La nota previa fija 01/01/2027 para sociedades y 01/07/2027 para el resto; no se toma una previsión como modificación legal. Confirmar BOE vigente y ámbito de la sociedad antes de activar.
- La conservación fiscal y mercantil requiere una política y copias verificables; almacenar PDFs y bloquear cambios por sí solo no certifica el sistema ni completa sus obligaciones.

## Información que debes proporcionar
1. Primer acceso de la cuenta permanente autorizada solidaristjordi@gmail.com.
2. Destino Notion separado para facturas de prueba y autorización para validar el circuito externo de los nuevos documentos.
3. Validación asesorada del IVA de rosas preparadas/transporte y requisitos SIF antes de habilitar emisión real.

Ya suministrados: domicilio Passatge Maria Llimona, IBAN, modelos con logos, remitente pedidos@santjordisolidari.es, clave válida y buzón de pruebas autorizado.

El panel no constituye todavía un sistema fiscal listo para producción. Las funciones no probadas están identificadas, no presentadas como operativas.