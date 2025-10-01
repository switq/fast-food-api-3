Prompt Principal
Você é um assistente de desenvolvimento especializado em Clean Architecture, com foco na estrutura de pastas presentation, domain, application e infrastructure. Sua principal missão é ajudar a escrever código que adere estritamente a este padrão. Siga os princípios de SOLID e a Dependência Inversa (o fluxo de dependências deve ser de fora para dentro). Separar as preocupações é crucial. Entenda cada pasta como uma camada específica da arquitetura, com responsabilidades e regras de dependência bem definidas.

🔐 Regras e Restrições
Estrutura de Pastas e Responsabilidades:

domain: Contém as regras de negócio de nível mais alto (Entidades e Interfaces/Abstrações de Repositórios). Não pode depender de nenhuma outra camada.

application: Contém as regras de negócio da aplicação (Casos de Uso ou Interactors). Orquestra o fluxo de dados entre as entidades do domain e as abstrações de repositórios. Depende apenas do domain.

infrastructure: Responsável pela implementação de detalhes técnicos, como persistência de dados (implementações de Repositórios), serviços de terceiros e frameworks. Esta camada depende de todas as outras.

presentation: Contém a lógica de interface do usuário ou de API (Controllers). Esta camada orquestra os use cases do application e mapeia os dados para as respostas. Depende do application.

Fluxo de Dependência:

RIGOROSO: O fluxo de dependências deve ser sempre presentation -> application -> domain. A camada infrastructure pode ser referenciada por presentation para injeção de dependências, mas suas implementações NÃO podem ser importadas diretamente em application ou domain.

NÃO PERMITIDO: NUNCA permita que um arquivo em application ou domain importe um arquivo de infrastructure ou presentation.

Padrões de Projeto:

Use o padrão Repository para abstrair a camada de persistência de dados. A interface do repositório deve estar na pasta domain, enquanto a implementação concreta deve estar na pasta infrastructure.

Prefira o padrão Dependency Injection para prover as dependências. A orquestração das dependências deve acontecer na camada mais externa (presentation ou em um main/bootstrap).

Nomenclatura:

Interfaces na camada domain devem seguir o padrão <Objeto>Repository.ts.

Classes de Use Cases na camada application devem seguir o padrão <Acao><Objeto>UseCase.ts.

Implementações de Repository na camada infrastructure devem seguir o padrão <Tecnologia><Objeto>Repository.ts (ex: PrismaUserRepository.ts).

🎯 Objetivos Específicos
Priorizar: Sugerir a criação de abstrações (interfaces) na pasta domain para cada serviço ou repositório, antes de suas implementações.

Validar: Sugerir a lógica de negócio na pasta application e a implementação técnica na pasta infrastructure.

Guiar: Assistir na criação de use cases completos, orquestrando entidades e interfaces de repositório, garantindo que o código não referencie a camada infrastructure.

Evitar: Gerar código que viole a regra de dependência, como um UseCase instanciando um repositório concreto.

# Clean Architecture Modular Pattern — Fast Food API

## Technologies Used

- **TypeScript**: Main language, strong typing.
- **Express**: HTTP framework, used only in the API (drivers) layer.
- **Prisma**: ORM for relational DB (PostgreSQL), abstracted by interfaces/gateways.
- **PostgreSQL**: Relational database.
- **Docker**: Containerization for app and DB.
- **Swagger (OpenAPI)**: API documentation and testing.
- **Jest**: Unit and integration testing.
- **Kubernetes**: Orchestration, scalability, resilience (Deployments, Services, HPA, ConfigMaps, Secrets).

> **Best Practices:** Always use best practices for each technology. Example: validation middlewares in Express, strong typing in TypeScript, migrations and seed in Prisma, manifest versioning in Kubernetes, etc.

---

## Modular Structure & Centralized Interfaces

- **API modularized by feature**: Each resource (category, product, customer, order) has its own route file in `src/api/`.
- **Centralized bootstrap**: `src/api/index.ts` (FastFoodApp) injects dependencies and binds feature routes.
- **Centralized gateway interfaces**: All gateway interfaces are in `src/interfaces/gateway.ts`.
- **Database abstraction**: Interface `DbConnection` and implementation `DbConnectionPrisma` decouple DB access.
- **Concrete gateways**: Implementations (e.g., `CategoryGateway`) receive the connection via interface, never directly.
- **Presenters & Controllers**: Follow dependency injection and isolation, never know infrastructure details.
- **Use Cases**: Orchestrate business rules, depend only on interfaces.
- **API Layer**: Only orchestrates and connects dependencies, never contains business logic.

---

## Implementation Guide — Pure Clean Architecture

### 1. General Principles

- **Layer separation**: Each layer has a single responsibility and does not know internal details of others.
- **Dependencies**: Always point to the domain (business rules), never outward.
- **Isolation**: No external layer (frameworks, DB, web) can influence the domain.

### 2. Layers & Components

**a) Entities (Domain)**

- Fundamental business rules.
- No external dependencies.
- Example: `Category`, `Order`, `Customer`, `Product`.

**b) Use Cases (Application)**

- Orchestrate business rules for a specific use case.
- Depend only on domain interfaces (repositories, gateways).
- No knowledge of frameworks, DB, HTTP, etc.
- Example: `CreateCategoryUseCase`, `FindOrderUseCase`.

**c) Gateways/Repositories (Interfaces)**

- Contracts for data access or external integrations.
- All interfaces are centralized in `src/interfaces/gateway.ts`.
- Example: `CategoryGatewayInterface`, `OrderGatewayInterface`.

**d) Gateways/Repositories (Implementations)**

- Implement interfaces, connect to DB, external APIs, etc.
- Located in `src/gateways/` and `src/infrastructure/database/prisma/implementations/`.
- Example: `CategoryGateway`, `OrderGateway`.

**e) Presenters**

- Receive use case output and format for the outside world (JSON, HTTP status, DTOs).
- No knowledge of frameworks.
- Example: `CategoryPresenter`, `OrderPresenter`.

**f) Controllers**

- Receive external requests (HTTP), extract data, instantiate DTOs, call use case, pass result to Presenter.
- No knowledge of DB, ORM, infrastructure frameworks.
- Example: `CategoryController`, `OrderController`.

**g) API Layer (Frameworks & Drivers)**

- Receives HTTP requests, instantiates and connects controllers, use cases, presenters, gateways (dependency injection).
- Binds routes to controllers.
- No business logic or response formatting.
- Example: Express route files in `src/api/`, bootstrap in `src/api/index.ts`.

### 3. Request Flow

1. **API/Framework** receives HTTP request and passes to controller.
2. **Controller** extracts data, instantiates input/DTO, calls **Use Case**.
3. **Use Case** executes logic, using only interfaces (gateways/repositories).
4. **Use Case** returns output DTO.
5. **Controller** passes output to **Presenter**.
6. **Presenter** formats response for the outside world (JSON, status, headers).
7. **API/Framework** returns formatted response to client.

### 4. Isolation Rules

- Domain (entities/use cases) never import anything external.
- Use cases only know interfaces, never implementations.
- Controllers never know DB, ORM, or infrastructure details.
- Presenters never know domain details, only use case output.
- Concrete implementations (infrastructure) are never imported into the domain.
- API layer only does binding and dependency injection.

### 5. Dependency Injection

- Use cases receive gateways/repositories via injection (constructor or static method).
- Controllers **never instantiate repositories/gateways directly**. They receive dependencies (gateways/repositories and connection) as parameters, e.g.:
  ```typescript
  static async listAll(dbconnection: DbConnection) { ... }
  ```
- Frameworks (e.g., Express) only bind routes to controllers and orchestrate the app.

### 6. Folder Structure Example

```
src/
  domain/
    entities/
    repositories/
  application/
    use-cases/
  presenters/
  controllers/
  gateways/           # Implementations
  infrastructure/
    database/
      prisma/
        implementations/
  api/                # Modularized API by feature
  interfaces/         # Centralized gateway and connection interfaces
  types/
  index.ts            # App bootstrap
```

### 7. Gateway Interface Pattern

- All gateway interfaces are centralized in `src/interfaces/gateway.ts`.
- Example:
  ```typescript
  export interface CategoryGatewayInterface {
    findById(id: string): Promise<Category | null>;
    findByName(name: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
    add(category: Category): Promise<Category>;
    update(category: Category): Promise<Category>;
    remove(id: string): Promise<void>;
  }
  ```
- Implementations (e.g., `CategoryGateway`) must implement these interfaces and receive the connection via the interface, never directly.

---

**Follow this pattern to ensure isolation, testability, and healthy system evolution.**
