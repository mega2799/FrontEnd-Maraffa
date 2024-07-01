# Utilizza un'immagine Node come base
FROM node:18 as build

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia il file package.json e package-lock.json
COPY package*.json ./
COPY proxy* ./

# Installa le dipendenze
RUN yarn install

# Copia il resto dell'applicazione
COPY . .

# Costruisci l'app Angular
RUN yarn build
# RUN yarn build --prod

# Usa un'immagine Nginx per servire l'app
FROM nginx:alpine

# Copia i file buildati da Node a Nginx
COPY --from=build /app/dist/maraffa-FE /usr/share/nginx/html

# # Copia il file di configurazione Nginx
# COPY nginx.conf /etc/nginx/nginx.conf

# # Copia il file di configurazione del server Nginx
# COPY default.conf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV API_HOST=http://bho
ENV API_PORT=3003
# Espone la porta 80
EXPOSE 80

# Comando di avvio di Nginx
CMD ["nginx", "-g", "daemon off;"]
