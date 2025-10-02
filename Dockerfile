# --- build ---
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- run ---
FROM nginx:alpine

# 빌드 산출물
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run: 환경변수 치환용 템플릿 사용
COPY default.conf.template /etc/nginx/templates/default.conf.template

# 기본 conf 제거(충돌 방지)
RUN rm -f /etc/nginx/conf.d/default.conf

# 로그를 콘솔로
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

CMD ["nginx", "-g", "daemon off;"]