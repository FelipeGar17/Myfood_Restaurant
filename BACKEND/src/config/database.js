
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Obtenemos la URL de conexión desde las variables de entorno
    // que definimos en nuestro docker-compose.yml
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/myfood';

    // Mongoose se conectará a la base de datos.
    // La opción { useNewUrlParser: true, useUnifiedTopology: true } ya no son necesarias
    // en las versiones recientes de Mongoose, pero no hace daño tenerlas por compatibilidad.
    const conn = await mongoose.connect(mongoURI);

    // Si la conexión es exitosa, mostramos un mensaje en la consola.
    // `conn.connection.host` nos dice a qué servidor nos hemos conectado.
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    // Si hay un error en la conexión, lo mostramos en la consola.
    console.error(`Error en la conexión a MongoDB: ${error.message}`);

    // Y terminamos la ejecución de la aplicación, porque sin base de datos, no puede funcionar.
    process.exit(1);
  }
};

// Exportamos la función para poder usarla en nuestro archivo principal (index.js)
module.exports = connectDB;