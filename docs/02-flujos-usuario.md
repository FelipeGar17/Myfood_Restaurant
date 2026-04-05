# Flujos de usuario - MyFood

## Flujo 1: Abrir mesa por QR (ya implementado)
1. Cliente escanea QR de mesa.
2. Front abre /menu y solicita GET /t/:qrId.
3. Back valida mesa activa y crea sesion.
4. Front muestra numero de mesa y tiempo restante.
5. Si hay interaccion, front envia POST /t/session/activity.

## Flujo 2: Navegar menu y armar carrito (siguiente)
1. Cliente ve categorias y productos.
2. Cliente agrega/quita productos en carrito local.
3. Front recalcula subtotal en tiempo real.
4. Cliente confirma pedido.

## Flujo 3: Enviar pedido a cocina (siguiente)
1. Front envia pedido con sesion activa.
2. Back valida sesion y menu.
3. Back crea pedido en estado sent.
4. Cocina ve pedido y lo mueve a preparing/ready.

## Flujo 4: Cierre por pago (ya base implementada)
1. Cliente solicita pagar.
2. Front llama POST /t/session/pay.
3. Back cierra sesion (closeReason: paid).
4. Front vuelve a vista inicial.

## Casos borde
- QR invalido: mostrar error claro.
- Mesa inactiva: bloquear acceso y mostrar mensaje.
- Sesion expirada: pedir reescaneo QR.
- Sesion cerrada por pago: no permitir actividad nueva.
