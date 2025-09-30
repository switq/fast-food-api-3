# Fast Food API

Uma API REST completa para gerenciamento de restaurante fast food, desenvolvida com TypeScript, Express, Prisma e integração com Mercado Pago para pagamentos.

## 🎞️ Vídeo de demostração pode ser encontrado neste [link](https://youtu.be/HK6JHgzT8BY)
- https://youtu.be/HK6JHgzT8BY

## 📚 Índice

- [🚀 Início Rápido](#-início-rápido)
- [📋 Endpoints da API](#-endpoints-da-api)
- [🔄 Fluxo de Uso da API](#-fluxo-de-uso-da-api)
- [⚙️ Configuração Detalhada](#️-configuração-detalhada)
- [🐳 Docker & Kubernetes](#-docker--kubernetes)
- [💳 Integração com Mercado Pago](#-integração-com-mercado-pago)
- [🧪 Testes e Validação](#-testes-e-validação)

## 📁 Documentação do Projeto

Este repositório contém documentação organizada por contexto:

- **[README.md](./README.md)** (este arquivo): Documentação principal com API, desenvolvimento e uso
- **[src/domain/repositories/README.md](./src/domain/repositories/README.md)**: 🏗️ **Arquitetura Clean** - Documentação detalhada da estrutura de repositórios, camadas e princípios SOLID
- **[k8s/README.md](./k8s/README.md)**: Documentação específica para deploy em Kubernetes
- **[k8s/desenho-arquitetura.md](./k8s/desenho-arquitetura.md)**: Arquitetura completa e diagramas da solução
- **[collections/](./collections/)**: Collections do Postman para teste da API

## 🚀 Início Rápido

### Para desenvolvedores que querem testar rapidamente:

1. **Clone e inicie a aplicação:**

```bash
git clone <url-do-repositório>
cd fast-food-api
docker compose --profile dev up --build
```

2. **Acesse a documentação interativa:**

```text
http://localhost:3000/api-docs
```

3. **Teste o health check:**

```bash
curl http://localhost:3000/health
```

4. **Importe as coleções do Postman** (disponíveis em `/collections/`) para testar todos os endpoints.

### 📚 Collections do Postman

O projeto inclui collections completas do Postman para facilitar o teste da API:

#### 1. **fast-food-api-complete.postman_collection.json** - Collection Completa

Esta é a collection principal que contém todos os endpoints organizados por categoria:

- **🏠 Health & Docs**: Health check e documentação Swagger
- **👤 Customers**: CRUD completo de clientes
- **📦 Categories**: CRUD completo de categorias
- **🍔 Products**: CRUD completo de produtos
- **📋 Orders**: Gestão completa de pedidos
- **🍳 Kitchen**: Endpoints específicos da cozinha
- **💳 Payments**: Gestão de pagamentos
- **🔔 Webhooks**: Webhooks do Mercado Pago
- **🚀 Full Order Flow**: **Fluxo completo passo a passo**

#### 2. **🚀 Full Order Flow** - Grupo Especial

Este grupo foi criado especificamente para testar o **ciclo de vida completo** de um pedido. As requisições são numeradas e devem ser executadas em ordem:

1. **Identify Customer by CPF** - Identifica cliente pelo CPF (opcional)
2. **Create a New Customer (Optional)** - Cria um cliente e salva o `customerId`
3. **Create a New Order (PENDING)** - Cria um pedido usando o cliente
4. **Identify Customer by CPF** - Segunda verificação do cliente pelo CPF
5. **Checkout the Order (CONFIRMED)** - Confirma o pedido e gera número do pedido
6. **Check Order Status** - Verifica o status atual do pedido
7. **Create Payment (Generates QR Code)** - Gera o QR Code de pagamento
8. **Confirm Payment (PAYMENT_CONFIRMED)** - Simula confirmação do pagamento
9. **Start Preparing (PREPARING)** - Inicia o preparo na cozinha
10. **Mark as Ready (READY)** - Marca como pronto para retirada
11. **Mark as Delivered (DELIVERED)** - Finaliza o pedido

**Recursos especiais do grupo:**

- **Scripts automáticos**: Passa automaticamente `customerId` e `orderId` entre requisições
- **Sem necessidade de copiar IDs manualmente**: Tudo é feito automaticamente
- **Fluxo realista**: Simula exatamente o que acontece em produção
- **Fácil de testar**: Apenas execute uma requisição após a outra

#### 3. **Collections Auxiliares**

- **mercado-pago-monitoring.postman_collection.json**: Monitoramento específico de pagamentos

#### 📋 Como Usar as Collections

1. **Importe no Postman**:
   - Abra o Postman
   - Clique em "Import"
   - Selecione o arquivo `collections/fast-food-api-complete.postman_collection.json`

2. **Configure o ambiente** (opcional):
   - Crie um environment com `baseUrl = http://localhost:3000`
   - Ou use as URLs absolutas que já estão configuradas

3. **Teste o fluxo completo**:
   - Vá para o grupo "🚀 Full Order Flow"
   - Execute as requisições na ordem (1, 2, 3, 4, 5, 6, 7, 8)
   - Os scripts automáticos cuidarão dos IDs para você

4. **Teste endpoints individuais**:
   - Use os outros grupos para testar funcionalidades específicas
   - Substitua os placeholders como `your_customer_id` pelos IDs reais

#### ⚠️ Nota Importante para o Full Order Flow

No passo "2. Create a New Order", você precisa substituir o `productId` no body da requisição por um ID de produto válido do seu banco de dados. Você pode obter IDs de produtos válidos executando:

```bash
GET /api/products
```

Ou use um dos produtos criados pelo seed do banco de dados.

## 📋 Endpoints da API

### 🏥 Health & Documentação

| Método | Endpoint    | Descrição                       |
| ------ | ----------- | ------------------------------- |
| GET    | `/health`   | Health check da aplicação       |
| GET    | `/api-docs` | Documentação Swagger interativa |

### 👤 Clientes (Customers)

| Método | Endpoint                       | Descrição                       | Body/Parâmetros                                            |
| ------ | ------------------------------ | ------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/customers`               | Listar todos os clientes        | -                                                          |
| GET    | `/api/customers/:id`           | Buscar cliente por ID           | `id` (path param)                                          |
| GET    | `/api/customers/identify/:cpf` | **Identificar cliente por CPF** | `cpf` (path param) - Ex: `12345678901` ou `123.456.789-01` |
| POST   | `/api/customers`               | Criar novo cliente              | `{ name, email, cpf, phone }`                              |
| PUT    | `/api/customers/:id`           | Atualizar cliente               | `id` (path param) + dados para atualizar                   |
| DELETE | `/api/customers/:id`           | Deletar cliente                 | `id` (path param)                                          |

### 📦 Categorias (Categories)

| Método | Endpoint              | Descrição                  | Body/Parâmetros                          |
| ------ | --------------------- | -------------------------- | ---------------------------------------- |
| GET    | `/api/categories`     | Listar todas as categorias | -                                        |
| GET    | `/api/categories/:id` | Buscar categoria por ID    | `id` (path param)                        |
| POST   | `/api/categories`     | Criar nova categoria       | `{ name, description }`                  |
| PUT    | `/api/categories/:id` | Atualizar categoria        | `id` (path param) + dados para atualizar |
| DELETE | `/api/categories/:id` | Deletar categoria          | `id` (path param)                        |

### 🍔 Produtos (Products)

| Método | Endpoint                             | Descrição                     | Body/Parâmetros                                      |
| ------ | ------------------------------------ | ----------------------------- | ---------------------------------------------------- |
| GET    | `/api/products`                      | Listar todos os produtos      | -                                                    |
| GET    | `/api/products/:id`                  | Buscar produto por ID         | `id` (path param)                                    |
| GET    | `/api/category/:categoryId/products` | Listar produtos por categoria | `categoryId` (path param)                            |
| POST   | `/api/products`                      | Criar novo produto            | `{ name, description, price, categoryId, imageUrl }` |
| PUT    | `/api/products/:id`                  | Atualizar produto             | `id` (path param) + dados para atualizar             |
| DELETE | `/api/products/:id`                  | Deletar produto               | `id` (path param)                                    |

### 📋 Pedidos (Orders) - Gestão Básica

| Método | Endpoint          | Descrição               | Body/Parâmetros                                                   |
| ------ | ----------------- | ----------------------- | ----------------------------------------------------------------- |
| GET    | `/api/orders`     | Listar todos os pedidos | -                                                                 |
| GET    | `/api/orders/:id` | Buscar pedido por ID    | `id` (path param)                                                 |
| POST   | `/api/orders`     | Criar novo pedido       | `{ customerId?, items: [{ productId, quantity, observation? }] }` |
| DELETE | `/api/orders/:id` | Deletar pedido          | `id` (path param)                                                 |

### 📋 Pedidos (Orders) - Gestão Avançada

| Método | Endpoint                             | Descrição                    | Body/Parâmetros                                      |
| ------ | ------------------------------------ | ---------------------------- | ---------------------------------------------------- |
| GET    | `/api/orders/status/:status`         | Listar pedidos por status    | `status` (PENDING, CONFIRMED, etc.)                  |
| GET    | `/api/orders/customer/:customerId`   | Listar pedidos de um cliente | `customerId` (path param)                            |
| PATCH  | `/api/orders/:id/status`             | Atualizar status do pedido   | `{ status }`                                         |
| PATCH  | `/api/orders/:id/items`              | Adicionar itens ao pedido    | `{ items: [{ productId, quantity, observation? }] }` |
| PATCH  | `/api/orders/:orderId/items/:itemId` | Atualizar quantidade do item | `{ quantity }`                                       |

### 📋 Pedidos (Orders) - Controle de Status

| Método | Endpoint                                | Descrição            |
| ------ | --------------------------------------- | -------------------- |
| PATCH  | `/api/orders/:id/status/confirmOrder`   | Confirmar pedido     |
| PATCH  | `/api/orders/:id/status/confirmPayment` | Confirmar pagamento  |
| PATCH  | `/api/orders/:id/status/startPreparing` | Iniciar preparo      |
| PATCH  | `/api/orders/:id/status/markReady`      | Marcar como pronto   |
| PATCH  | `/api/orders/:id/status/markDelivered`  | Marcar como entregue |
| PATCH  | `/api/orders/:id/status/cancel`         | Cancelar pedido      |

### 🍳 Cozinha (Kitchen)

| Método | Endpoint                                   | Descrição                             | Body/Parâmetros |
| ------ | ------------------------------------------ | ------------------------------------- | --------------- |
| GET    | `/api/kitchen/orders`                      | Listar pedidos ordenados para cozinha | -               |
| GET    | `/api/kitchen/orders/awaiting-preparation` | Listar pedidos aguardando preparo     | -               |

### 💳 Pagamentos (Payments)

| Método | Endpoint                              | Descrição                     | Body/Parâmetros        |
| ------ | ------------------------------------- | ----------------------------- | ---------------------- |
| POST   | `/api/orders/:orderId/payment`        | Gerar pagamento para pedido   | `orderId` (path param) |
| GET    | `/api/payments/order/:orderId/status` | Consultar status do pagamento | `orderId` (path param) |

### 🔔 Webhooks

| Método | Endpoint                   | Descrição                        | Body/Parâmetros |
| ------ | -------------------------- | -------------------------------- | --------------- |
| POST   | `/webhooks/paymentwebhook` | Webhook dedicado do Mercado Pago | Payload do MP   |

## 🔄 Fluxo de Uso da API

### 1. 🎯 Fluxo Básico para Fazer um Pedido

```bash
# 1. Verificar se a API está funcionando
GET /health

# 2. Listar categorias disponíveis
GET /api/categories

# 3. Listar produtos de uma categoria (ex: Hambúrgueres)
GET /api/category/{categoryId}/products

# 4. Criar um cliente (opcional - pode fazer pedido sem cliente)
POST /api/customers
{
  "name": "João Silva",
  "email": "joao@email.com",
  "cpf": "12345678901",
  "phone": "11999999999"
}

# 5. Criar o pedido (status inicial: PENDING)
POST /api/orders
{
  "customerId": "uuid-do-cliente", // opcional
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 2,
      "observation": "Sem cebola"
    }
  ]
}

# 6. Confirmar o pedido (status: CONFIRMED)
# ⚠️ IMPORTANTE: Este passo gera o NÚMERO DO PEDIDO para o cliente
# O número é criado APENAS na confirmação (não na criação do pedido)
PATCH /api/orders/{orderId}/status/confirmOrder
# Retorna: { "orderNumber": "000123", "createdAt": "...", "customerName": "..." }

# 7. Gerar pagamento para o pedido (somente se estiver CONFIRMED)
POST /api/orders/{orderId}/payment
# Body opcional: {} ou {"paymentMethodId": "any-value"} - o campo é ignorado
# Retorna QR Code para pagamento - cliente escolhe método no Mercado Pago

# 8. Webhook do Mercado Pago atualiza o status para PAYMENT_CONFIRMED
# após o pagamento ser aprovado.

# 9. Acompanhar status do pedido
GET /api/orders/{orderId}
```

#### 📋 Regras Importantes sobre Número do Pedido

**🔢 Quando é gerado:**

- ✅ **APENAS na confirmação** do pedido (step 6)
- ❌ **NÃO na criação** do pedido (step 5)

**📝 Formato:**

- Números sequenciais: `000001`, `000002`, `000003`...
- Sempre 6 dígitos com zeros à esquerda

**🎯 Finalidade:**

- Cliente usa para acompanhar pedido no display/painel
- Números limpos e fáceis de memorizar
- Apenas pedidos válidos (confirmados) recebem número

### 2. 🍳 Fluxo da Cozinha

Este fluxo é destinado ao time da cozinha para gerenciar os pedidos que já foram pagos.

```bash
# 1. Listar pedidos da cozinha ordenados por prioridade
GET /api/kitchen/orders

# 2. Listar apenas pedidos aguardando preparo
GET /api/kitchen/orders/awaiting-preparation

# 3. Iniciar preparo do pedido
PATCH /api/orders/{orderId}/status/startPreparing

# 4. Marcar pedido como pronto para retirada
PATCH /api/orders/{orderId}/status/markReady

# 5. Marcar como entregue ao cliente (finaliza o pedido)
PATCH /api/orders/{orderId}/status/markDelivered
```

### 3. 🔄 Fluxo de Status do Pedido (Passo a Passo)

Esta seção detalha a sequência exata de chamadas de API para avançar um pedido por todos os seus estágios, desde a criação até a entrega.

1. **Criar o Pedido**
   - O pedido é criado com o status inicial `PENDING`.
   - `POST /api/orders`

2. **Confirmar o Pedido**
   - Valida o pedido e o move para o status `CONFIRMED`, liberando-o para pagamento.
   - `PATCH /api/orders/{orderId}/status/confirmOrder`

3. **Gerar o Pagamento**
   - Com o pedido em `CONFIRMED`, gera-se o QR Code para o cliente pagar.
   - `POST /api/orders/{orderId}/payment`

4. **Confirmar o Pagamento (Automático via Webhook)**
   - O webhook do Mercado Pago é notificado quando o pagamento é aprovado.
   - O sistema então move o status de `CONFIRMED` para `PAYMENT_CONFIRMED`.
   - O endpoint `PATCH /api/orders/{orderId}/status/confirmPayment` é chamado internamente pelo webhook.

5. **Iniciar o Preparo**
   - A cozinha inicia o preparo do pedido.
   - Move o status de `PAYMENT_CONFIRMED` para `PREPARING`.
   - `PATCH /api/orders/{orderId}/status/startPreparing`

6. **Marcar como Pronto**
   - O pedido está pronto para ser retirado pelo cliente.
   - Move o status de `PREPARING` para `READY`.
   - `PATCH /api/orders/{orderId}/status/markReady`

7. **Marcar como Entregue**
   - O cliente retirou o pedido. O ciclo está completo.
   - Move o status de `READY` para `DELIVERED`.
   - `PATCH /api/orders/{orderId}/status/markDelivered`

8. **Cancelar o Pedido (Opcional)**
   - Um pedido pode ser cancelado a qualquer momento, exceto quando já foi entregue.
   - Move o status para `CANCELLED`.
   - `PATCH /api/orders/{orderId}/status/cancel`

### 4. 💳 Fluxo de Pagamento Completo

```bash
# 1. Criar pedido (status: PENDING)
POST /api/orders
{
  "items": [{ "productId": "uuid", "quantity": 1 }]
}

# 2. Confirmar o pedido (status: CONFIRMED)
PATCH /api/orders/{orderId}/status/confirmOrder

# 3. Gerar pagamento (cliente escolhe método no Mercado Pago)
# NOTA: Na implementação atual, o cliente escolhe o método na interface do Mercado Pago.
# O campo paymentMethodId está preparado para futuras integrações com outros gateways.
POST /api/orders/{orderId}/payment
# Body opcional: {} ou {"paymentMethodId": "ignored"}
# Resposta inclui qrCode e qrCodeBase64

# 4. Cliente escaneia QR Code e paga

# 5. Webhook atualiza automaticamente o status para PAYMENT_CONFIRMED
# (Mercado Pago → /webhooks/paymentwebhook)

# 6. Verificar status do pagamento
GET /api/payments/order/{orderId}/status

# 7. Pedido automaticamente vai para a cozinha
```

### 5. 📊 Fluxo de Monitoramento

```bash
# Ver todos os pedidos da cozinha (ordenados por prioridade)
GET /api/kitchen/orders

# Ver pedidos por status
GET /api/orders/status/PREPARING

# Ver pedidos de um cliente específico
GET /api/orders/customer/{customerId}

# Verificar status de pagamento em tempo real
GET /api/payments/order/{orderId}/status?provider=true
```

### 6. 🔄 Estados do Pedido e Regras de Negócio

O pedido segue este fluxo de estados:

```text
PENDING → CONFIRMED → PAYMENT_CONFIRMED → PREPARING → READY → DELIVERED
                                    ↓
                               CANCELLED (a qualquer momento, exceto DELIVERED)
```

**Status Detalhados:**

- **PENDING**: Pedido criado, aguardando confirmação
- **CONFIRMED**: Pedido confirmado, aguardando pagamento
- **PAYMENT_CONFIRMED**: Pagamento recebido, pronto para preparação
- **PREPARING**: Pedido está sendo preparado na cozinha
- **READY**: Pedido está pronto para retirada/entrega
- **DELIVERED**: Pedido foi entregue ou retirado
- **CANCELLED**: Pedido foi cancelado (não permitido após DELIVERED)

**Regras de Transição:**

- Só pode confirmar pagamento se estiver em CONFIRMED
- Só pode iniciar preparo se pagamento estiver confirmado
- Só pode marcar como pronto se estiver preparando
- Só pode entregar se estiver pronto
- Pode cancelar a qualquer momento, exceto se já entregue

### 7. 📋 Exemplos de Payloads

#### Criar Cliente

```json
{
  "name": "João Silva",
  "email": "joao.silva@email.com",
  "cpf": "12345678901",
  "phone": "11999999999"
}
```

#### Criar Categoria

```json
{
  "name": "Hambúrgueres",
  "description": "Deliciosos hambúrgueres artesanais"
}
```

#### Criar Produto

```json
{
  "name": "Big Burger",
  "description": "Hambúrguer duplo com queijo e bacon",
  "price": 25.9,
  "categoryId": "uuid-da-categoria",
  "imageUrl": "https://example.com/big-burger.jpg"
}
```

#### Criar Pedido

```json
{
  "customerId": "uuid-do-cliente",
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 2,
      "observation": "Sem cebola, extra queijo"
    },
    {
      "productId": "uuid-outro-produto",
      "quantity": 1
    }
  ]
}
```

#### Atualizar Status do Pedido

A API utiliza endpoints específicos para cada transição de status:

- **Iniciar Preparo**: `PATCH /api/orders/{id}/status/startPreparing`
- **Marcar como Pronto**: `PATCH /api/orders/{id}/status/markReady`
- **Marcar como Entregue**: `PATCH /api/orders/{id}/status/markDelivered`

_Não há payload necessário - apenas o ID do pedido na URL._

## ⚙️ Configuração Detalhada

### Opção 1: Usando Docker (Recomendado)

1. Clone o repositório e navegue até o diretório do projeto:

```bash
git clone <url-do-repositório>
cd fast-food-api
```

2. Inicie a aplicação com Docker Compose:

**Para Desenvolvimento:**

```bash
docker compose --profile dev up --build
```

**Para Produção:**

```bash
docker compose --profile prod up --build
```

Isso iniciará automaticamente o banco de dados PostgreSQL e a aplicação, incluindo o preenchimento do banco com dados de exemplo.

### Opção 2: Desenvolvimento Local

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp env.example .env
```

3. Atualize o arquivo `.env` com sua configuração de banco de dados e Mercado Pago:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/fast_food_db?schema=public"

# Servidor
PORT=3000
NODE_ENV=development

# Mercado Pago (obrigatório para pagamentos)
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
MERCADO_PAGO_NOTIFICATION_URL=https://sua-url-ngrok.ngrok-free.app/webhooks/paymentwebhook
```

> 📝 **Nota**: Para obter as credenciais do Mercado Pago:
>
> 1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
> 2. Crie uma aplicação de teste
> 3. Copie o Access Token de teste
> 4. Configure o ngrok para webhook (veja seção "Integração com Mercado Pago")

4. Inicialize o banco de dados:

```bash
npm run db:push
```

5. Gere o Prisma Client:

```bash
npm run db:generate
```

6. Preencha o banco com dados de exemplo:

```bash
npm run db:seed
```

7. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

## 🐳 Docker & Kubernetes

### Opção 3: Kubernetes (Produção/Cloud)

Para deploy em cluster Kubernetes, consulte a **[documentação completa do Kubernetes](./k8s/README.md)** que inclui:

- 🚀 **Deploy completo** com PostgreSQL integrado
- 🔧 **Auto-scaling** e configuração de recursos
- 🔒 **Políticas de segurança** e network policies
- 📊 **Health checks** e monitoramento
- 🛠️ **Comandos úteis** para gerenciamento

Para entender a **arquitetura completa da solução**, consulte **[k8s/desenho-arquitetura.md](./k8s/desenho-arquitetura.md)** que contém:

- 📋 **Análise de requisitos** de negócio e problemas identificados
- 🏗️ **Diagramas de arquitetura** (Mermaid) com componentes detalhados
- ⚙️ **Configurações técnicas** de HPA, deployment e segurança
- 📈 **KPIs e métricas** de performance e disponibilidade
- 🔄 **Fluxos de dados** e sequência de operações

**Deploy rápido:**

```bash
# Deploy local (recomendado para desenvolvimento)
kubectl apply -k k8s/overlays/local

# Deploy cloud (apenas para aprendizado)
kubectl apply -k k8s/overlays/cloud

# Verificar status
kubectl get pods -n fast-food-api
kubectl get services -n fast-food-api
kubectl get ingress -n fast-food-api
```

**Acessar aplicação:**

```bash
# Port-forward para desenvolvimento
kubectl port-forward -n fast-food-api service/fast-food-api-service 3000:80

# URLs (com ingress configurado)
# API: http://fast-food-api.local
# Swagger: http://fast-food-api.local/api-docs
```

> 📖 **Documentação completa:** Para configurações avançadas, troubleshooting e comandos detalhados, consulte **[k8s/README.md](./k8s/README.md)**

### Perfis Docker

**Desenvolvimento (`--profile dev`):**

- API server na porta 3000
- Prisma Studio na porta 5555
- Hot reload automático
- Banco de dados com dados de exemplo

**Produção (`--profile prod`):**

- API server otimizado na porta 3000
- Build multi-stage para menor tamanho de imagem
- Sem ferramentas de desenvolvimento

### Comandos Docker

**Comandos Básicos:**

```bash
# Desenvolvimento
docker compose --profile dev up --build

# Produção
docker compose --profile prod up --build

# Parar serviços
docker compose down

# Ver logs
docker compose logs -f app_development  # dev
docker compose logs -f app_production   # prod

# Reconstruir (se necessário)
docker compose --profile dev up --build --force-recreate
```

**Acesso aos Containers:**

```bash
# Desenvolvimento
docker compose exec app_development sh

# Produção
docker compose exec app_production sh
```

**Comandos de Validação:**

```bash
npm run ci          # Executa todas as validações
npm run lint        # Verifica linting
npm run type-check  # Verifica tipos TypeScript
```

## 💳 Integração com Mercado Pago

A API suporta um fluxo completo de pagamento usando Mercado Pago, incluindo geração de QR code e integração de webhook para atualizações de status.

### 🚀 Guia Completo de Configuração

#### 1. Configure as Variáveis de Ambiente

Adicione o seguinte ao seu arquivo `.env`:

```env
# Configuração do Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
MERCADO_PAGO_NOTIFICATION_URL=https://sua-url-ngrok.ngrok-free.app/webhooks/paymentwebhook

# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/fastfood?schema=public"

# Servidor
PORT=3000
NODE_ENV=development
```

#### 2. Configure ngrok para Webhook (Necessário para Desenvolvimento Local)

**Instale o ngrok:**

- Baixe em: <https://ngrok.com/download>
- Ou instale via gerenciador de pacotes: `npm install -g ngrok`

**Configure o ngrok:**

```bash
# Autentique (obtenha o token em ngrok.com)
ngrok config add-authtoken SEU_NGROK_TOKEN

# Inicie o túnel para a porta 3000
ngrok http 3000
```

**Obtenha sua URL de webhook:**

```bash
# Verifique túneis ativos
curl http://localhost:4040/api/tunnels

# Sua URL de webhook será algo como:
# https://abc123.ngrok-free.app/webhooks/paymentwebhook
```

#### 3. Configuração Automática do Webhook

**A URL do webhook é configurada automaticamente!**

A aplicação envia a URL do webhook dinamicamente para o Mercado Pago durante a criação de cada pagamento, usando a variável `MERCADO_PAGO_NOTIFICATION_URL` do arquivo `.env`.

**Não é necessário configurar manualmente no painel do Mercado Pago.**

**Como funciona:**

- Quando você cria um pagamento via `POST /api/orders/{orderId}/payment`
- A aplicação automaticamente informa ao Mercado Pago: "use esta URL para notificações"
- O Mercado Pago enviará as notificações diretamente para sua URL do ngrok

**Teste o webhook:**

- Use a coleção do Postman fornecida
- Ou teste manualmente com curl (veja seção de troubleshooting)

#### 4. Inicie a Aplicação

```bash
# Desenvolvimento (recomendado para testes)
docker compose --profile dev up --build

# Produção (otimizado)
docker compose --profile prod up --build

# Ou localmente (após configurar env)
npm install && npm run dev
```

#### 5. Verifique a Configuração

**Verifique se tudo está funcionando:**

```bash
# Teste a aplicação
curl http://localhost:3000/health

# Teste o túnel ngrok
curl https://sua-url-ngrok.ngrok-free.app/health

# Teste o endpoint de webhook
curl -X POST https://sua-url-ngrok.ngrok-free.app/webhooks/paymentwebhook \
  -H "Content-Type: application/json" \
  -d '{"data":{"id":"test"}}'
```

### 🔄 Testando o Fluxo de Pagamento

#### Passo 1: Crie um Cliente e Pedido

```bash
# Crie um cliente
POST /api/customers
{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678901",
  "phone": "11999999999"
}

# Crie um pedido
POST /api/orders
{
  "customerId": "customer-id-do-exemplo-acima",
  "items": [
    {
      "productId": "product-id",
      "quantity": 1
    }
  ]
}
```

#### Passo 2: Gere o QR Code de Pagamento

```bash
# Gere o pagamento (sem payload necessário)
POST /api/orders/{orderId}/payment

# OU com payload opcional
# NOTA: O campo paymentMethodId é ignorado na implementação atual com Mercado Pago,
# mas está preparado para futuras implementações com outros meios de pagamento
# (PayPal, Stripe, PIX direto, cartão de crédito, etc.)
POST /api/orders/{orderId}/payment
{
  "paymentMethodId": "pix"
}

# A resposta inclui:
{
  "orderId": "...",
  "paymentProviderId": "...",
  "qrCode": "https://mercadopago.com/...",
  "qrCodeBase64": "data:image/png;base64,..."
}
```

#### Passo 3: Complete o Pagamento

1. **Escaneie o QR Code** com a conta de teste do Mercado Pago
2. **Complete o pagamento** na interface do Mercado Pago
3. **O webhook atualiza automaticamente** o status do pedido

#### Passo 4: Monitore o Status do Pagamento

```bash
# Verifique o status do pedido (do banco de dados)
GET /api/payments/order/{orderId}/status

# Verifique o status em tempo real (do Mercado Pago)
GET /api/payments/order/{orderId}/status?provider=true

# Monitore os logs (desenvolvimento)
docker compose logs -f app_development

# Monitore os logs (produção)
docker compose logs -f app_production
```

### 🛠️ Solução de Problemas

#### Problemas com ngrok

Se você receber erro `ERR_NGROK_3004`:

```bash
# 1. Pare o ngrok
taskkill /f /im ngrok.exe  # Windows
# ou
pkill ngrok  # Linux/Mac

# 2. Reinicie o ngrok corretamente
ngrok http 3000

# 3. Atualize a URL do webhook no painel do Mercado Pago
```

**Execute o script de diagnóstico:**

```bash
# Windows
.\diagnose_ngrok.ps1

# Verifique se o ngrok está apontando para http://localhost:3000 (não https)
```

#### Webhook Não Recebendo

1. **Verifique o status do ngrok:**

```bash
curl http://localhost:4040/api/tunnels
```

2. **Teste o webhook manualmente:**

```bash
curl -X POST https://sua-url-ngrok.ngrok-free.app/webhooks/paymentwebhook \
  -H "Content-Type: application/json" \
  -d '{"data":{"id":"119538917962"}}'
```

3. **Verifique os logs da aplicação:**

```bash
# Ver logs em tempo real
docker compose logs -f app_development  # dev
docker compose logs -f app_production   # prod
```

#### Status do Pagamento Não Atualizando

1. **Verifique a URL do webhook** no arquivo `.env` (variável `MERCADO_PAGO_NOTIFICATION_URL`)
2. **Verifique se o ngrok está ativo** e a URL está correta
3. **Verifique se o pedido existe** no banco de dados
4. **Verifique se o ID do pagamento** está correto
5. **Verifique os logs** para mensagens de erro

### 📚 Documentação e Ferramentas

#### Ferramentas de Monitoramento

- **Interface ngrok**: <http://localhost:4040>
- **Logs da Aplicação**: Use `docker compose logs -f app_development` (dev) ou `app_production` (prod)
- **Painel Mercado Pago**: <https://www.mercadopago.com.br/developers/panel>

#### Teste Alternativo (se ngrok falhar)

Use **webhook.site** para teste temporário:

1. Vá para: <https://webhook.site>
2. Copie a URL única
3. Configure no Mercado Pago temporariamente
4. Visualize requisições de webhook em tempo real
5. Copie o payload para testar localmente

### 🔧 Checklist de Configuração do Ambiente

- [ ] Docker instalado e funcionando
- [ ] ngrok instalado e autenticado
- [ ] Conta de teste do Mercado Pago criada
- [ ] Access token configurado no `.env`
- [ ] URL do webhook configurada no `.env` (MERCADO_PAGO_NOTIFICATION_URL)
- [ ] Túnel ngrok iniciado (`ngrok http 3000`)
- [ ] Aplicação rodando (`docker compose --profile dev up` ou `docker compose --profile prod up`)
- [ ] Webhook testado e recebendo requisições automaticamente
- [ ] Fluxo de pagamento testado end-to-end

## 🚀 Fluxo Completo do Pedido

A API suporta um fluxo completo de pedidos seguindo estas etapas:

### 1. Identificação do Cliente

- **Endpoint**: `GET /api/customers/identify/{cpf}`
- **Descrição**: Identifica o cliente pelo CPF para personalizar o atendimento
- **Exemplo**: `GET /api/customers/identify/12345678900`

### 2. Criação do Cliente (Opcional)

- **Endpoint**: `POST /api/customers`
- **Descrição**: Cria novo cliente se não existir ou para pedidos identificados

### 3. Criação do Pedido

- **Status Inicial**: `PENDING`
- **Endpoint**: `POST /api/orders`
- **Descrição**: Cria o pedido com itens selecionados

### 4. Confirmação do Pedido

- **Status**: `PENDING` → `CONFIRMED`
- **Endpoint**: `PATCH /api/orders/{id}/status/confirmOrder`
- **Descrição**: Confirma o pedido e gera número para acompanhamento

### 5. Verificação do Status

- **Endpoint**: `GET /api/orders/{id}/status`
- **Descrição**: Permite verificar o status atual do pedido a qualquer momento

### 6. Geração do Pagamento

- **Endpoint**: `POST /api/orders/{id}/payment`
- **Descrição**: Gera QR Code PIX e dados para pagamento
- **Requisito**: Pedido deve estar em status `CONFIRMED`

### 7. Confirmação do Pagamento

- **Status**: `CONFIRMED` → `PAYMENT_CONFIRMED`
- **Endpoint**: `PATCH /api/orders/{id}/status/confirmPayment`
- **Descrição**: Confirma pagamento (normalmente via webhook)

### 8. Preparo na Cozinha

- **Status**: `PAYMENT_CONFIRMED` → `PREPARING`
- **Endpoint**: `PATCH /api/orders/{id}/status/startPreparing`
- **Descrição**: Inicia o preparo do pedido

### 9. Pedido Pronto

- **Status**: `PREPARING` → `READY`
- **Endpoint**: `PATCH /api/orders/{id}/status/markReady`
- **Descrição**: Marca pedido como pronto para retirada

### 10. Entrega Finalizada

- **Status**: `READY` → `DELIVERED`
- **Endpoint**: `PATCH /api/orders/{id}/status/markDelivered`
- **Descrição**: Finaliza o pedido

### Estados do Pedido

- `PENDING`: Pedido criado, aguardando confirmação
- `CONFIRMED`: Pedido confirmado, aguardando pagamento
- `PAYMENT_CONFIRMED`: Pagamento confirmado, aguardando preparo
- `PREPARING`: Pedido em preparo na cozinha
- `READY`: Pedido pronto para retirada
- `DELIVERED`: Pedido entregue e finalizado
- `CANCELLED`: Pedido cancelado

## 🧪 Testes e Validação

### Schema do Banco de Dados

A aplicação inclui os seguintes modelos:

- **Customer**: Informações do cliente com nome, email, CPF e telefone
- **Category**: Categorias de produtos (Hambúrgueres, Bebidas, etc.)
- **Product**: Itens de comida com nome, descrição, preço, categoria e disponibilidade
- **Order**: Pedidos dos clientes com rastreamento de status
- **OrderItem**: Itens individuais dentro de um pedido

### Dados de Exemplo

O banco de dados é automaticamente preenchido com:

- **5 Categorias**: Hambúrgueres, Bebidas, Acompanhamentos, Sobremesas, Combos
- **13 Produtos**: Vários hambúrgueres, bebidas, acompanhamentos, sobremesas e combos
- **5 Clientes**: Dados de exemplo de clientes com CPF e números de telefone válidos
- **3 Pedidos de Exemplo**: Pedidos em diferentes status com itens realistas

### Comandos do Banco de Dados

**Via Docker:**

```bash
# Acessar container
docker compose exec app_development sh    # dev
docker compose exec app_production sh     # prod

# Dentro do container:
npm run db:generate    # Gera o cliente Prisma
npm run db:push        # Envia alterações do schema
npm run db:seed        # Preenche com dados de exemplo
npm run db:reset       # Reseta e preenche o banco
```

**Localmente:**

```bash
npm run db:generate      # Gera o cliente Prisma
npm run db:push         # Envia alterações do schema
npm run db:seed         # Preenche dados (pula se existem)
npm run db:seed:force   # Força preenchimento (limpa primeiro)
npm run db:reset        # Reseta e preenche
npm run db:studio       # Interface gráfica (porta 5555)
```

### Validação de Código

O projeto inclui validações automatizadas que são executadas em cada Pull Request:

#### GitHub Actions

- ✅ **TypeScript Check** - Verifica tipos e erros de compilação
- ✅ **ESLint** - Valida regras de linting
- ✅ **Prettier** - Verifica formatação do código
- ✅ **Testes** - Executa suite de testes
- ✅ **Coverage** - Valida cobertura mínima de 75%

#### Executar Validações

```bash
npm run ci              # Todas as validações
npm run type-check      # TypeScript
npm run lint           # ESLint
npm run test:coverage   # Testes + Coverage
```

#### Configurações

- **ESLint**: `.eslintrc.js` - Regras de linting para TypeScript
- **Prettier**: `.prettierrc` - Formatação de código
- **Jest**: `jest.config.js` - Configuração de testes e coverage

---

## 📖 Documentação Relacionada

- **[Kubernetes Deployment](./k8s/README.md)**: Configurações para deploy em produção
- **[Arquitetura da Solução](./k8s/desenho-arquitetura.md)**: Diagramas e documentação técnica completa
- **[Collections Postman](./collections/)**: Teste automatizado da API
