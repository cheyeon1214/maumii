FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# envsubst를 위해 gettext 설치
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Cloud Run이 주입한 PORT 값을 사용해 실제 conf 생성 후 nginx 실행
CMD sh -c 'envsubst < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g "daemon off;"'