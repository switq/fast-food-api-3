# Production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Instalar dependências do sistema necessárias para o Prisma
RUN apk add --no-cache openssl && \
    apk upgrade --no-cache

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo dev dependencies para build)
RUN npm ci

# Copiar o resto do código
COPY . .

# Build stage
RUN npm run db:generate
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Instalar dependências do sistema necessárias para o Prisma
RUN apk add --no-cache openssl && \
    apk upgrade --no-cache

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado do builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copiar Prisma schema e migrations para o stage de produção
COPY --from=builder /usr/src/app/src/infrastructure/database/prisma ./src/infrastructure/database/prisma

# Ajustar permissões para o usuário node (que já existe no Alpine)
RUN chown -R node:node /usr/src/app

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
USER node
CMD ["node", "./dist/index.js"]
