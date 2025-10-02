# 1) Node 빌드 단계
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # => dist 폴더 생성

# 2) Nginx 런타임 단계
FROM nginx:stable-alpine

# React SPA 라우팅 대응 (404 → index.html)
RUN sed -i 's#index  index.html;#index index.html;\n    try_files $uri /index.html;#' /etc/nginx/conf.d/default.conf

# 빌드 결과 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 로그를 콘솔로 연결
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]