FROM node:18 as build
WORKDIR /app
COPY package*.json ./
COPY proxy* ./
RUN yarn install
COPY . .
RUN yarn build


FROM nginx:alpine
COPY --from=build /app/dist/maraffa-FE /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV API_HOST=http://bho
ENV API_PORT=3003
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
