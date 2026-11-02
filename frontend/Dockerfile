# Imagen del frontend para docker compose: se compila con Node y se sirve con nginx.
# En Vercel no se usa; allí se publica directamente la carpeta dist.

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Vite mete la URL del backend en el código al compilar, por eso va como argumento de build.
# Este valor manda sobre .env.production; para apuntar a Render: --build-arg VITE_API_URL=https://bioruta-api.onrender.com
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
