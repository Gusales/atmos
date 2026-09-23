FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Necessárias só neste estágio: a rota "**" é pré-renderada (RenderMode.Prerender)
# durante o build, então o app faz uma chamada real às APIs de clima/geocoding
# nesse momento. Sem elas o build ainda passa, mas a página estática gerada
# fica vazia (o cliente busca os dados de novo na hidratação, em runtime).
ARG WEATHER_API_URL
ARG WEATHER_API_KEY
ARG GEOCODING_API_URL

RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/dist/app ./dist/app

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Runtime env vars (passar via `docker run -e`/`--env-file`, docker-compose
# `environment`, ou secrets do orquestrador — NUNCA copiar um .env pra imagem):
#   WEATHER_API_URL, WEATHER_API_KEY, GEOCODING_API_URL — lidas por
#     src/app/server/env.ts só se existir um .env no filesystem; como não
#     copiamos nenhum, essas variáveis reais do ambiente são usadas direto.
#   NG_ALLOWED_HOSTS — allowlist de hostnames que o Angular SSR aceita no
#     header Host (proteção contra Host header injection). Sem isso, QUALQUER
#     porta/host mapeado externamente (ex: -p 8080:4000) recebe 400. Defina
#     como o(s) hostname(s) reais usados pra acessar o container (ex:
#     "localhost" em dev, "meuapp.com" em produção), sem porta e sem scheme.

CMD ["node", "dist/app/server/server.mjs"]
