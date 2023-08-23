FROM node:16 as build
WORKDIR /app

FROM nginx:mainline-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
