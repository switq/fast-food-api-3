# Lista de Entregáveis — Fast Food API (Fase 3)

Este documento descreve, de forma objetiva, tudo que precisa ser entregue para a avaliação da fase 3. Seguir as regras de Clean Architecture: domain <- application <- presentation; implementações técnicas em infrastructure; injeção de dependências na bootstrap (api/index).

## 1. Artefatos de Código (obrigatórios)

- Repositório principal da Aplicação (branch `main` protegida): código TypeScript completo.
  - `src/domain` — entidades, value objects e interfaces de repositório.
  - `src/application` — use cases (nome: `<Acao><Objeto>UseCase.ts`).
  - `src/presentation` — controllers e presenters (somente orquestração e mapeamento).
  - `src/infrastructure` — implementações concretas (repositórios, gateways, DB connection).
- `src/api/index.ts` (bootstrap) — orquestração de dependências (injeção) e binding de rotas.
- `Dockerfile` e `Dockerfile.dev` funcionais.
- `docker-compose.yml` para ambiente `dev` com `.env` de exemplo (`env.example`).

## 2. Infraestrutura e IaC (mínimo viável)

- Repositório/dir `infra` ou `k8s` com manifests/helm/terraform mínimos para deploy em ambiente dev.
- K8s manifests (Deployment, Service, ConfigMap, Secret ou Helm chart simples) ou instruções Terraform para criar:
  - Cluster (ou usar cluster local), NLB/ALB, registry.
- Documentar como provisionar e destruir (comandos ex.: `terraform apply` / `helm upgrade --install` / `kubectl apply`).

### AWS — especificações e recomendações

- Borda pública: usar AWS API Gateway (HTTP or REST) como ponto de entrada público. O API Gateway roteia internamente por VPC Link para um NLB/ALB que encaminha para o Ingress interno do cluster (EKS) ou serviços (NLB -> target group).

- Autenticação via Lambda: implementar uma Function (AWS Lambda) responsável pelo fluxo de identificação/autenticação por CPF conforme sugestão do professor. Recomenda-se:
  - Ter repositório separado para as Lambdas (repo Lambda/Serverless), com pipeline próprio para empacotar e publicar (zip/terraform/aws_lambda_function).
  - A Lambda pode ser invocada diretamente pelo API Gateway (integration) ou como authorizer (custom authorizer) para emitir/validar JWTs.
  - Se a Lambda precisar acessar o banco, coloque-a em uma subrede privada na mesma VPC e utilize RDS Proxy (ou VPC endpoints) para conexões seguras e com pooling.
  - Armazenar segredos (credenciais DB, MERCADO_PAGO tokens) no AWS Secrets Manager e referenciar nas Lambdas via IAM role com permissão mínima.

- Provisionamento via Terraform:
  - Criar módulos para: API Gateway, Lambda, IAM roles/policies, VPC, EKS, RDS (ou RDS Serverless), NLB/ALB, ECR, and Secrets Manager.
  - Gerar outputs úteis (api_gateway_url, lambda_arn, eks_endpoint, rds_endpoint) para integrar entre repositórios/pipelines.
  - Usar state remoto (S3 + DynamoDB lock) ou Terraform Cloud para segurança e colaboração.

- Observability / Logs:
  - Criar CloudWatch Log Groups para Lambdas e API Gateway logs; configurar retention policy adequada.
  - Opcional: habilitar AWS X-Ray para tracing distribuído entre Lambda/API Gateway/EKS.

- Segurança / Network:
  - API Gateway público → VPC Link → NLB interno → Ingress EKS privado.
  - Usar Security Groups e NACLs para restringir tráfego e evitar exposição direta do banco.

## 3. CI/CD e Proteções

- `.github/workflows/ci.yml` (obrigatório) com jobs:
  - checkout, setup Node, install, prettier check, eslint, tsc --noEmit, npm test, build
- Branch protection configurada para `main` (PR obrigatório, checks requeridos).
- PR template e ISSUE template em `.github/`.

## 4. Segurança e Segredos

- `.env.example` com variáveis necessárias (sem valores secretos).
- Documentar onde armazenar segredos (GitHub Secrets / Secret Manager) e nomes padrão para variáveis sensíveis (ex.: MERCADO_PAGO_ACCESS_TOKEN, DATABASE_URL).

## 5. Testes e Qualidade

- Unit tests com Jest para entidades e use cases (pasta `tests/`), cobertura mínima indicada (ex.: 70%+).
- Testes de integração mínimos (smoke tests) para endpoints críticos (ex.: criação de pedido, healthcheck).
- Scripts no `package.json`: `test`, `test:coverage`, `lint`, `format`, `build`.

## 6. Documentação (obrigatório)

- README.md com:
  - Visão geral, como rodar local (dev via Docker Compose), como rodar testes e lint, como subir infra mínima.
  - Link para Postman/collections (se houver) e rota de health.
- `.github/TechChallenge.md` e `.github/explicacaoprofessor.md` atualizados e coerentes.
- Documento de Entregáveis (este arquivo) e roteiro do vídeo de demonstração.

## 7. Demonstração (vídeo)

- Vídeo curto (5–8 minutos) mostrando:
  - Pipelines (checks verdes) no GitHub Actions.
  - App rodando (endpoint health e um fluxo de pedido básico).
  - Arquitetura e justificativas (por que escolhas técnicas e respeito ao Clean Architecture).

## 8. Checklist de Avaliação (critério de aceite)

- tsc --noEmit retorna sem erros.
- Prettier aplicado (npx prettier --check .).
- ESLint sem erros críticos (npx eslint "src/**/*.{ts,tsx}" --ext .ts).
- Testes unitários executam e passam (npm test).
- `main` protegido e PRs usados para mudanças.
- Todas as interfaces de persistência estão em `src/domain` e implementações em `src/infrastructure`.
- `src/api/index.ts` é o único local que instancia implementações concretas para injeção.
- Documentação e vídeo entregues com links funcionais.

## 9. Entregas por papel (sugestão de divisão — equipe de 3)

- Pessoa A (Infra/CI): CI workflow, branch protection, Docker registry, k8s manifests/terraform.
- Pessoa B (QA/Integração): testes de integração e cobertura, scripts de smoke tests, validar secrets e envs.
- Pessoa C (App/Arquitetura): corrigir imports, garantir Clean Architecture, preparar README, controllers, use cases e presenters.

## 10. Comandos úteis para validação local

- git status
- git rev-parse --abbrev-ref HEAD
- npx prettier --check .
- npx prettier --write .
- npx eslint "src/**/*.{ts,tsx}" --ext .ts --fix
- npx tsc --noEmit
- npm test
- docker-compose --profile dev up -d
- docker exec -it <app_container> /bin/sh -c "printenv | grep -i MERCADO"

## 11. Como submeter

- Abrir PRs separados por tópico (lint/fix, infra, tests, docs).
- Cada PR deve ter checklist preenchido e CI verde.
- Ao final, enviar link do repositório com branch `main` protegido e link do vídeo.

## 12. Ajustes de funcionalidade na API (itens a implementar / validar)

A seguir estão todas as funcionalidades e correções práticas que devem ser entregues para que a API esteja completa, robusta e compatível com o padrão Clean Architecture. Cada item deve ter um PR separado quando possível, com testes unitários/integrados e documentação atualizada.

Responsabilidade sugerida por item: Pessoa C = App/Arquitetura, Pessoa B = QA/Integração, Pessoa A = Infra/CI (quando envolve infra/segredos)

Principais ajustes funcionais

- Endpoints e contratos

  - Revisar e documentar todas as rotas em `src/api/` por recurso (category, product, customer, order, payment). Incluir exemplos de requests/responses no Swagger/OpenAPI.

  - Normalizar DTOs de entrada e saída; criar types em `src/presentation/dtos` e mapeadores (presenters).

- Validação e segurança

  - Implementar validação de payloads (Joi/zod/class-validator) nos controllers; retornar erros padronizados (RFC7807-like).

  - Aplicar rate limiting e CORS nas rotas públicas (config no bootstrap/api/index ou middleware).

  - Autenticação mínima para endpoints administrativos (JWT) e API key para dispositivos se necessário.

- Fluxo de pedidos (Order)

  - Garantir transações e consistência: ao criar pedido, validar estoque (se houver), persistir order e items atomically (use transaction no repositório infra).

  - Implementar idempotência em criação de pedido/pagamento (Idempotency-Key header) para evitar duplicação em retries.

  - Adicionar endpoints para consultar status do pedido e histórico (pagamentos/estados).

- Integração de pagamentos

  - Centralizar interface de gateway de pagamento na `domain` (ex: IPaymentGateway.ts) e manter implementação em `infrastructure/gateways`.

  - Implementar webhook endpoint seguro (token ou assinatura) em `presentation/controllers/PaymentWebhookController.ts` para processar notificações (atualizar paymentStatus e order).

  - Testes de integração contra ambiente sandbox do provedor (mockar em pipelines quando necessário).

  - Implementar retry/backoff para chamadas externas e logging detalhado de request/response em nível infra (não vazar segredos).

- Mercado Pago (ou outro gateway)

  - Conferir envio correto do Authorization header (Bearer token) na implementação infra; suportar troca entre sandbox/production via env (MERCADO_PAGO_MODE).

  - Implementar validação de resposta e transformar em domain DTOs (PaymentResult) e mapear para use-cases.

- Webhooks e consistência eventual

  - Validar assinaturas/headers do webhook antes de processar.

  - Implementar reconciler job (opcional) que reconcilia status de pagamentos pendentes com o gateway.

- Logs, observabilidade e métricas

  - Instrumentar logs estruturados (JSON) e adicionar endpoint /health e /metrics (Prometheus) se aplicável.

  - Garantir níveis de logs configuráveis por env (DEBUG/INFO/WARN/ERROR).

- Migrations e seed

  - Garantir migrations Prisma/ORM atualizadas e script de seed com dados essenciais (categories, products, test user).

  - Documentar steps para rodar migrations e seed localmente e em CI.

- Testes adicionais

  - Cobertura unitária para entidades e use-cases (tests/domain, tests/application).

  - Tests de integração para controllers + integração com infra mockada (tests/integration).

  - Testes end-to-end (opcional) simulando um fluxo completo (create order -> payment -> webhook)

- Observância do padrão Clean Architecture

  - Auditar que `src/application` e `src/domain` não importam nada de `src/infrastructure` ou `src/presentation`.

  - Garantir que `src/api/index.ts` seja o único local que cria instâncias de implementações concretas e injeta nos controllers/use-cases.

- Documentação funcional

  - Atualizar README com exemplos de uso (curl/Postman) para os fluxos críticos: criar pedido, iniciar pagamento, webhook, consultar pedido.

  - Atualizar arquivo `.github/DELIVERABLES.md` com links para coleções Postman e passos para testar localmente.

- Função serverless de autenticação (AWS Lambda)

  - Especificação:
    - Lambda atua como fluxo de identificação por CPF indicado pelo professor. Pode ser:
      - endpoint invocado pelo API Gateway para autenticar/consultar CPF e retornar JWT, ou
      - custom authorizer (token authorizer) para o API Gateway que valida requests antes de encaminhar ao cluster.

  - Fluxo sugerido:
    1. Requisição chega no API Gateway público.
    2. API Gateway invoca Lambda (ou usa Lambda Authorizer).
    3. Lambda valida CPF no banco (via RDS Proxy ou chamando serviço interno através de NLB) e gera JWT de curta duração.
    4. Lambda retorna token e dados mínimos; API Gateway encaminha ao backend com autorização.

  - Implementação e segurança:
    - Armazenar segredos em AWS Secrets Manager; Lambda com IAM role que só permite leitura do secret necessário.
    - Evitar hardcode de credenciais em código.
    - Emitir JWTs assinados com chave gerenciada (ex.: KMS ou secret em Secrets Manager). Documentar algoritmo e expiração.

  - Testes e deploy:
    - Testar Lambda isoladamente (unit + integration mocks) e via API Gateway em ambiente dev.
    - Pipeline do repo Lambda deve publicar versão/alias e atualizar integração do API Gateway (terraform/cli).

Entregáveis e critérios de aceite específicos para ajustes funcionais

- Cada funcionalidade crítica tem: código, testes, documentação, e CI green on PR.

- Endpoints documentados em OpenAPI/Swagger com exemplos e schemas claros.

- Webhook validado e teste de integração simulando notificação externa.

- Scripts de migration/seed e instrução clara para executar.

- Auditoria de arquitetura mostrando nenhum import indevido entre camadas.
