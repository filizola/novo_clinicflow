FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json /app/frontend/
WORKDIR /app/frontend
RUN npm ci

COPY frontend /app/frontend
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/build /usr/share/nginx/html

EXPOSE 80

