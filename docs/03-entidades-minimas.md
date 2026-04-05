# Entidades minimas (modelo funcional)

## Vision rapida
Piensalo como SQL pero en Mongo:
- Table = tabla de mesas
- TableSession = sesion viva de la mesa
- Category = categoria de menu
- Product = item de menu
- Order = pedido con lineas embebidas

## Colecciones

### tables
- tableNumber (unique)
- qrId (unique, immutable)
- status (active/inactive)

### tableSessions
- sessionId (unique)
- tableId (ref tables)
- createdAt
- lastActivityAt
- maxExpiresAt
- expiresAt (TTL)
- active
- closedAt
- closeReason

### categories
- name
- sortOrder
- active

### products
- categoryId
- name
- description
- price
- active
- stockStatus (in_stock, low_stock, out_of_stock)

### orders
- tableId
- sessionId
- status
- items [{ productId, nameSnapshot, priceSnapshot, qty, notes }]
- subtotal
- taxes
- total
- createdAt
- updatedAt

## Indices sugeridos
- tables: tableNumber, qrId
- tableSessions: sessionId, tableId, expiresAt TTL, active
- products: categoryId, active
- orders: tableId, sessionId, status, createdAt
