FROM node:18 as build
WORKDIR /app
COPY package*.json ./
COPY proxy* ./
RUN yarn install
COPY . .
RUN yarn build


FROM nginx:alpine

# RUN wget https://github.com/open-telemetry/opentelemetry-cpp-contrib/releases/download/webserver%2Fv1.0.3/opentelemetry-webserver-sdk-x64-linux.tgz \
#     && tar -xzf opentelemetry-webserver-sdk-x64-linux.tgz \
#     && cp -r opentelemetry-webserver-sdk/conf /opt/opentelemetry/ \
#     && cp opentelemetry-webserver-sdk/WebServerModule/Apache/libmod_opentelemetry.so /opt/opentelemetry/ \
#     && rm -rf opentelemetry-webserver-sdk*

COPY --from=build /app/dist/maraffa-FE /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV API_HOST=http://bho
ENV API_PORT=3003
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
