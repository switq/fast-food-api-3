# Plano de Implementação — Autenticação com API Gateway + Lambda

## Objetivo
Implementar autenticação/identificação por CPF usando AWS API Gateway + Lambda conforme orientação do professor, seguindo Clean Architecture e segregando em repositórios separados.

## Escopo específico
- **Foco:** apenas autenticação/autorização via serverless (não todo o sistema)
- **Tecnologias:** AWS API Gateway, Lambda, JWT, CPF validation
- **Arquitetura:** API Gateway público → Lambda → validação CPF → JWT response
- **Repositórios:** separar Lambda/serverless do repositório principal da aplicação

---

## Estrutura de repositórios (autenticação)

### 1. Repositório Lambda (novo)
```
fast-food-auth-lambda/
  src/
    handlers/
      auth.ts                 # handler principal para autenticação por CPF
      authorizer.ts           # custom authorizer (opcional)
    services/
      cpfValidator.ts         # validação de CPF
      jwtService.ts           # geração/validação de JWT
      customerService.ts      # consulta cliente no banco
    types/
      auth.types.ts           # DTOs e interfaces
    utils/
      logger.ts
      response.ts
  tests/
    unit/
    integration/
  package.json
  tsconfig.json
  serverless.yml              # Serverless Framework (alternativa ao Terraform)
  terraform/                  # ou usar Terraform para Lambda + API Gateway
    main.tf
    variables.tf
    outputs.tf
  .github/
    workflows/
      deploy-lambda.yml       # CI/CD para Lambda
```

### 2. Repositório Infra (atualizar existente)
```
fast-food-infra/
  modules/
    api_gateway/              # API Gateway + integração com Lambda
    lambda_auth/              # IAM roles, VPC config para Lambda
    secrets/                  # AWS Secrets Manager
  environments/
    dev/
    prod/
```

---

## Fluxos de autenticação a implementar

### Fluxo 1: Identificação por CPF (totem público)
1. **Request:** `POST /auth/identify` com `{ "cpf": "12345678901" }`
2. **API Gateway** → **Lambda auth handler**
3. **Lambda:**
   - Valida formato do CPF
   - Consulta cliente no banco (via RDS Proxy ou API interna)
   - Se existe: retorna dados básicos + JWT de sessão
   - Se não existe: retorna indicação para cadastro
4. **Response:** `{ "token": "jwt...", "customer": {...}, "needsRegistration": false }`

### Fluxo 2: Custom Authorizer (rotas protegidas)
1. **Request:** qualquer rota com header `Authorization: Bearer <jwt>`
2. **API Gateway** → **Lambda authorizer**
3. **Lambda:** valida JWT e retorna policy (Allow/Deny)
4. **API Gateway:** permite ou bloqueia baseado na policy

---

## Implementação detalhada

### Fase 1: Setup inicial (1-2 dias)
**Responsável:** Pessoa A (Infra)

- [ ] Criar repositório `fast-food-auth-lambda`
- [ ] Setup inicial: package.json, tsconfig, estrutura de pastas
- [ ] Configurar Serverless Framework OU Terraform para Lambda
- [ ] Pipeline básico: lint + test + package

**Entregáveis:**
- Repositório criado com estrutura
- Pipeline que executa testes (mesmo que vazios)

### Fase 2: Desenvolvimento Lambda (2-3 dias)
**Responsável:** Pessoa C (Backend/Auth)

- [ ] **CPF Validator Service**
  ```typescript
  // src/services/cpfValidator.ts
  export class CPFValidator {
    static isValid(cpf: string): boolean
    static format(cpf: string): string
  }
  ```

- [ ] **JWT Service**
  ```typescript
  // src/services/jwtService.ts
  export class JWTService {
    static generate(payload: any, expiresIn: string): string
    static verify(token: string): any
  }
  ```

- [ ] **Customer Service** (consulta banco)
  ```typescript
  // src/services/customerService.ts
  export class CustomerService {
    static async findByCPF(cpf: string): Promise<Customer | null>
  }
  ```

- [ ] **Auth Handler**
  ```typescript
  // src/handlers/auth.ts
  export const identifyHandler = async (event: APIGatewayEvent): Promise<APIGatewayResponse>
  ```

**Entregáveis:**
- Handlers funcionais com testes unitários
- Integração com banco (mock inicialmente)

### Fase 3: API Gateway + Infraestrutura (2-3 dias)
**Responsável:** Pessoa A (Infra)

- [ ] **API Gateway setup via Terraform**
  ```hcl
  # terraform/modules/api_gateway/main.tf
  resource "aws_api_gateway_rest_api" "auth_api"
  resource "aws_api_gateway_integration" "lambda_integration"
  ```

- [ ] **Lambda deployment**
  ```hcl
  # terraform/modules/lambda_auth/main.tf
  resource "aws_lambda_function" "auth_function"
  resource "aws_iam_role" "lambda_execution_role"
  ```

- [ ] **Secrets Manager**
  ```hcl
  resource "aws_secretsmanager_secret" "jwt_secret"
  resource "aws_secretsmanager_secret" "db_credentials"
  ```

- [ ] **VPC Configuration** (se Lambda precisar acessar RDS)
  ```hcl
  resource "aws_lambda_function" "auth_function" {
    vpc_config {
      subnet_ids = var.private_subnet_ids
      security_group_ids = [aws_security_group.lambda_sg.id]
    }
  }
  ```

**Entregáveis:**
- API Gateway público funcionando
- Lambda deployada e acessível via API Gateway
- Secrets configurados

### Fase 4: Integração e Testes (2-3 dias)
**Responsável:** Pessoa B (QA) + Pessoa C (Backend)

- [ ] **Testes de integração**
  - Testar Lambda isoladamente
  - Testar via API Gateway (Postman/curl)
  - Validar JWT gerado

- [ ] **Integração com banco real**
  - Configurar RDS Proxy ou conexão direta
  - Implementar consulta real de CPF
  - Testes com dados reais

- [ ] **Documentação da API**
  ```yaml
  # OpenAPI spec para /auth/identify
  paths:
    /auth/identify:
      post:
        summary: Identificação por CPF
        requestBody:
          content:
            application/json:
              schema:
                properties:
                  cpf:
                    type: string
                    pattern: "^[0-9]{11}$"
  ```

**Entregáveis:**
- Endpoint `/auth/identify` funcionando end-to-end
- Documentação OpenAPI
- Collection Postman atualizada

### Fase 5: Custom Authorizer (opcional - 1-2 dias)
**Responsável:** Pessoa C (Backend)

- [ ] **Authorizer Lambda**
  ```typescript
  // src/handlers/authorizer.ts
  export const authorizerHandler = async (event: APIGatewayAuthorizerEvent)
  ```

- [ ] **Configuração no API Gateway**
  ```hcl
  resource "aws_api_gateway_authorizer" "jwt_authorizer" {
    name = "jwt-authorizer"
    rest_api_id = aws_api_gateway_rest_api.main.id
    authorizer_uri = aws_lambda_function.authorizer.invoke_arn
  }
  ```

**Entregáveis:**
- Custom authorizer funcionando
- Proteção de rotas administrativas

---

## Integração com aplicação principal

### No repositório da aplicação
- [ ] **Middleware de autenticação**
  ```typescript
  // src/infrastructure/middleware/authMiddleware.ts
  export const authMiddleware = (req: Request, res: Response, next: NextFunction)
  ```

- [ ] **Atualizar controllers**
  ```typescript
  // aplicar middleware em rotas administrativas
  router.get('/admin/orders', authMiddleware, OrderController.listAll)
  ```

- [ ] **Configurar CORS** para aceitar requests do API Gateway

---

## CI/CD Pipeline específica

### Pipeline Lambda (`deploy-lambda.yml`)
```yaml
name: Deploy Auth Lambda
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: hashicorp/setup-terraform@v2
      - run: terraform init
      - run: terraform plan
      - run: terraform apply -auto-approve
```

---

## Secrets e configuração

### GitHub Secrets necessários
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
JWT_SECRET_KEY
DATABASE_URL (ou parâmetros separados)
```

### AWS Secrets Manager
```
/fast-food/auth/jwt-secret
/fast-food/database/credentials
```

---

## Testes de aceitação

### Cenários críticos
1. **CPF válido existente**: retorna token + dados do cliente
2. **CPF válido não cadastrado**: retorna indicação para cadastro
3. **CPF inválido**: retorna erro 400
4. **JWT válido**: permite acesso a rotas protegidas
5. **JWT inválido/expirado**: bloqueia acesso

### Comandos de teste
```bash
# Identificação por CPF
curl -X POST https://api-gateway-url/auth/identify \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901"}'

# Acesso com JWT
curl -X GET https://api-gateway-url/admin/orders \
  -H "Authorization: Bearer eyJ..."
```

---

## Cronograma (7-10 dias)
- **Dias 1-2:** Setup inicial + repositório
- **Dias 3-5:** Desenvolvimento Lambda + handlers
- **Dias 6-8:** Infraestrutura + API Gateway
- **Dias 9-10:** Integração + testes + documentação

---

## Próximos passos imediatos
1. Criar repositório `fast-food-auth-lambda`
2. Definir se usar Serverless Framework ou Terraform puro
3. Configurar pipeline básica
4. Implementar CPF validator (primeiro componente)

Quer que eu gere algum arquivo específico ou implemente alguma parte agora?
