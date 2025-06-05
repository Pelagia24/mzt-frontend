FROM node:20  as build

WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm ci

# Копируем исходный код и собираем приложение
COPY . .
RUN npm run build

# Шаг 2: Serve the React app
FROM nginx:stable-alpine

# Копируем конфиг файл nginx
COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Удаляем дефолтные nginx статику
RUN rm -rf ./*

# Копируем нашу статику из builder стадии
COPY --from=build /app/dist .

# Контейнер запускаеи nginx с global directives и daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]