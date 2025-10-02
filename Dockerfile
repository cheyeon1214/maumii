# 1) build
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # dist 생성

# 2) nginx runtime
FROM nginx:alpine

# 정적 파일
COPY --from=build /app/dist /usr/share/nginx/html

# ✅ 템플릿 경로에 복사 (env 치환 사용)
COPY default.conf.template /etc/nginx/templates/default.conf.template

# ⚠️ 기본 conf 제거(중복/충돌 방지)
RUN rm -f /etc/nginx/conf.d/default.conf

# 로그를 콘솔로
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

CMD ["nginx", "-g", "daemon off;"]