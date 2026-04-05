# Reglas de negocio - MyFood

## Objetivo
Digitalizar la experiencia de mesa: escaneo QR, sesion de mesa, pedido, seguimiento y pago.

## Roles
- Cliente en mesa: escanea QR, ve menu, arma pedido, solicita pago.
- Mesero: valida pedido, ayuda al cliente, confirma entrega.
- Cocina: recibe pedidos en estado enviado y actualiza progreso.
- Caja/Admin: gestiona cobro y cierre de sesion.

## Reglas de sesion de mesa
- Una sesion inicia con GET /t/:qrId sobre mesa activa.
- La sesion tiene timeout por inactividad (hoy 30 min, configurable).
- La sesion se renueva solo con interaccion real del usuario.
- La sesion tiene duracion maxima (hoy 180 min, configurable).
- Al pagar, la sesion se cierra con razon paid.
- Una sesion cerrada no se puede reutilizar.

## Reglas de menu
- Un producto inactivo no se puede pedir.
- Un producto sin stock visible no se debe mostrar como disponible.
- El menu se muestra por categorias ordenadas.

## Reglas de pedido
- Solo se puede crear pedido con sesion activa.
- Un pedido inicia en estado draft.
- Un pedido pasa a sent cuando cliente confirma envio.
- Al estar sent, no se permiten cambios libres (solo por politica definida).
- Estados sugeridos: draft, sent, preparing, ready, delivered, canceled, paid.

## Reglas de pago
- El total se calcula por lineas de pedido + impuestos/cargos.
- Al confirmar pago: pedido pasa a paid y sesion se cierra.
- No se acepta nueva actividad de sesion tras pago.

## Reglas tecnicas base
- Front y back se acceden desde el mismo origen en Docker (localhost:3000).
- Variables de entorno controlan timeouts y secretos.
- Toda accion critica deja trazabilidad minima (fecha, usuario/mesa, estado).
