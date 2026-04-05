# Mapa mental: de la U (SQL/PHP) a empresa (API/Node)

## Idea principal
No aprendiste mal en la U.
Aprendiste una version simplificada del mismo proceso.
Ahora solo esta separado por responsabilidades para escalar mejor.

## Traduccion directa
- Antes: una vista + consultas SQL en el mismo flujo.
- Ahora: frontend (vista) + backend (reglas) + base de datos (persistencia).

## Equivalencias 1 a 1
- Tabla SQL (phpMyAdmin) => Coleccion Mongo (Mongoose model).
- Archivo de consultas => Service + Controller en backend.
- Boton en la vista que hace submit => fetch a un endpoint REST.
- Session PHP/variables de servidor => JWT + registro de sesion en DB.
- Archivo unico con todo => capas separadas (routes, controllers, services, models).

## Como pensar tokens sin estres
- Token = ticket temporal del cliente.
- No reemplaza toda la logica.
- Solo identifica y autoriza la sesion.
- El estado real de negocio sigue en base de datos.

## Flujo equivalente (antes vs ahora)
1. Antes: abrir pagina, ejecutar SQL de la mesa, mostrar datos.
2. Ahora: abrir /menu, llamar GET /t/:qrId, guardar token, mostrar datos.
3. Antes: al guardar cambios, ejecutar UPDATE.
4. Ahora: llamar endpoint POST/PATCH que valida y luego actualiza DB.

## Regla anti-saturacion
- No pensar en 10 archivos a la vez.
- Pensar en cadena de 3 pasos:
1. Que necesita mostrar la pantalla.
2. Que endpoint trae o guarda eso.
3. Que entidad guarda el dato.

## Mini checklist por feature
1. Pantalla: que ve el usuario.
2. Contrato API: request/response.
3. Validacion: que reglas aplica.
4. Persistencia: donde se guarda.
5. Error UX: que mensaje mostrar.

## Ejemplo real en MyFood
- Pantalla: sesion de mesa.
- Endpoint: GET /t/:qrId.
- Regla: mesa activa y QR valido.
- Persistencia: tableSessions.
- UX: mostrar mesa + countdown y errores 400/404/401.
