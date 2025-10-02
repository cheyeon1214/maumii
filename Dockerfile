# 1) build 단계
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2) nginx 런타임
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 템플릿으로 넣기
COPY default.conf.template /etc/nginx/templates/default.conf.template

# (선택) 로그를 콘솔로
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

CMD ["nginx", "-g", "daemon off;"]