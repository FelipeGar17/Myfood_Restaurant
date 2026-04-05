# Plan front-first (sin saturarte de backend)

## Regla de trabajo
No se crea backend nuevo hasta cerrar primero contrato visual y flujo de pantalla.

## Sprint A (actual)
- [x] Pantalla /menu abre sesion por QR
- [x] Mostrar mesa y countdown
- [x] Renovar sesion por interaccion
- [ ] Agregar estado visual de sesion (activa, expirada, cerrada)

## Sprint B (siguiente recomendado)
- [ ] UI de menu por categorias (mock local)
- [ ] Carrito (sumar, restar, eliminar)
- [ ] Resumen subtotal y total
- [ ] Boton Enviar pedido (sin pegar aun al backend)

## Sprint C (conexion backend minima)
- [ ] Definir endpoint POST /orders (contrato)
- [ ] Enviar carrito real desde front
- [ ] Confirmacion visual de pedido enviado

## Definicion de terminado por sprint
- Flujo completo clickable
- Errores visibles para usuario
- Sin romper flujo de sesion de mesa
- Checklist de pruebas manuales basicas
