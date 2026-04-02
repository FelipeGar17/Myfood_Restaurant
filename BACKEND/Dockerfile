# Usa una imagen oficial de Node.js como imagen base.
# La etiqueta 'lts' se refiere a la versión de Soporte a Largo Plazo (Long-Term Support), que es estable y recomendada.
FROM node:lts

# Establece el directorio de trabajo dentro del contenedor.
# Todas las acciones posteriores (como COPY o RUN) se ejecutarán desde esta ruta.
WORKDIR /usr/src/app

# Copia los archivos 'package.json' y 'package-lock.json' (si existe) al directorio de trabajo.
# Hacemos esto en un paso separado para aprovechar el cache de Docker.
# Si estos archivos no cambian, Docker no volverá a instalar las dependencias en la siguiente construcción.
COPY package*.json ./

# Instala las dependencias del proyecto definidas en package.json.
RUN npm install

# Copia el resto del código fuente de tu aplicación al directorio de trabajo.
COPY . .

# Expone el puerto 3000. Le dice a Docker que el contenedor escuchará en este puerto en tiempo de ejecución.
# Este es el puerto donde correrá nuestro servidor Express.
EXPOSE 3000

# El comando para ejecutar la aplicación cuando se inicie el contenedor.
# Usará 'node' para ejecutar el archivo 'index.js'.
CMD [ "node", "src/index.js" ]
