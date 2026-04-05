// BACKEND/src/index.js

// 1. Importaciones
// Importamos 'dotenv' para cargar las variables de entorno desde un archivo .env
// Es importante hacerlo al principio para que las variables estén disponibles en todo el proyecto.
require('dotenv').config();

// Importamos la función de conexión a la base de datos que creamos antes.
const connectDB = require('./config/database');

// Importamos Express, el framework para construir nuestro servidor.
const express = require('express');
const path = require('path');

const tableAccessRoutes = require('./routes/tableAccess.routes');

// 2. Conexión a la Base de Datos
// Ejecutamos la función para conectar con MongoDB.
// La aplicación no continuará hasta que esta conexión sea exitosa.
connectDB();

// 3. Inicialización de la App
// Creamos una instancia de la aplicación Express.
const app = express();

// 4. Middlewares
// Le decimos a Express que use su middleware integrado para parsear JSON.
// Esto permitirá que nuestra API entienda los cuerpos de las peticiones que vengan en formato JSON.
app.use(express.json());
app.use('/qrs', express.static(path.join(__dirname, '../public/qrs')));

// Ruta de acceso por QR: /t/:qrId
app.use('/t', tableAccessRoutes);

// 5. Ruta de Prueba
// Creamos una ruta simple en la raíz ('/') para verificar que el servidor funciona.
// Cuando alguien acceda a 'http://localhost:3000/', recibirá un mensaje JSON.
app.get('/', (req, res) => {
    res.json({ message: 'API de MyFood funcionando!' });
});

// 6. Puesta en Marcha del Servidor
// Obtenemos el puerto desde las variables de entorno. Si no está definido, usamos el 5000 por defecto.
const PORT = process.env.PORT || 5000;

// Le decimos a la aplicación que escuche las peticiones en el puerto especificado.
// Cuando el servidor esté listo, mostrará un mensaje en la consola.
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
