# Repositórios - Clean Architecture

Este diretório contém as **interfaces de repositórios** que fazem parte da camada **Domain** seguindo os princípios da Clean Architecture.

## Estrutura Atual

```
src/
├── domain/
│   └── repositories/  # Interfaces dos repositórios (Domain Layer)
│       ├── ICategoryRepository.ts
│       ├── ICustomerRepository.ts
│       ├── IProductRepository.ts
│       ├── IOrderRepository.ts
│       ├── index.ts
│       └── README.md
├── presentation/
│   └── gateways/              # Implementações dos repositórios (Infrastructure Layer)
│       ├── CategoryGateway.ts
│       ├── CustomerGateway.ts
│       ├── ProductGateway.ts
│       └── OrderGateway.ts
├── infrastructure/
│   ├── database/
│   │   └── prisma/
│   │       ├── implementations/
│   │       │   └── CategoryRepository.ts  # (Vazio - não usado)
│   │       ├── PrismaDBConnection.ts
│   │       └── schema.prisma
│   └── interfaces/
│       └── IDbConnection.ts
└── application/
    ├── use-cases/             # Use Cases que usam as interfaces
    │   ├── CategoryUseCases.ts
    │   ├── CustomerUseCases.ts
    │   ├── ProductUseCases.ts
    │   ├── OrderUseCases.ts
    │   ├── PaymentUseCases.ts
    │   ├── KitchenUseCases.ts
    │   └── OrderConfirmationUseCases.ts
    └── interfaces/
        └── gateways/
            └── IPaymentGateway.ts
```

## Arquitetura Clean

### Camada Domain (`src/domain/repositories/`)

Contém **apenas as interfaces** que definem os contratos para operações de dados:

- `ICategoryRepository`: Contrato para operações de categorias
- `ICustomerRepository`: Contrato para operações de clientes
- `IProductRepository`: Contrato para operações de produtos
- `IOrderRepository`: Contrato para operações de pedidos

### Camada Infrastructure (`src/presentation/gateways/`)

Contém as **implementações concretas** dos repositórios que implementam as interfaces do domain:

- **CategoryGateway**: Implementa `ICategoryRepository` usando `IDatabaseConnection`
- **CustomerGateway**: Implementa `ICustomerRepository` usando `IDatabaseConnection`
- **ProductGateway**: Implementa `IProductRepository` usando `IDatabaseConnection`
- **OrderGateway**: Implementa `IOrderRepository` usando `IDatabaseConnection`

### Camada Application (`src/application/use-cases/`)

Contém os **Use Cases** que orchestram as regras de negócio usando apenas as interfaces:

- **CategoryUseCases**: Operações de negócio para categorias
- **CustomerUseCases**: Operações de negócio para clientes
- **ProductUseCases**: Operações de negócio para produtos
- **OrderUseCases**: Operações de negócio para pedidos
- **PaymentUseCases**: Operações de negócio para pagamentos
- **KitchenUseCases**: Operações de negócio para cozinha

### Fluxo de Dependências

```
Application Layer (Use Cases)
    ↓ (depende apenas das interfaces)
Domain Layer (Repository Interfaces)
    ↑ (implementadas por)
Infrastructure Layer (Gateways)
    ↓ (usam)
Database Connection (Prisma)
```

## Exemplo de Uso

```typescript
// Use Cases dependem apenas das interfaces (Domain)
import { ICategoryRepository } from "@repositories/ICategoryRepository";
import CategoryUseCases from "@usecases/CategoryUseCases";

// Controllers usam os Use Cases e instanciam os Gateways (Infrastructure)
import { CategoryGateway } from "@presentation-gateways/CategoryGateway";
import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";

class CategoryController {
  static async createCategory(
    name: string,
    description: string,
    dbConnection: IDatabaseConnection
  ) {
    // Instancia o gateway (infrastructure)
    const categoryGateway = new CategoryGateway(dbConnection);

    // Chama o use case passando a interface
    const category = await CategoryUseCases.createCategory(
      name,
      description,
      categoryGateway // passa a implementação
    );

    return category;
  }
}
```

## Características da Implementação

- **Separação Rigorosa de Camadas**: Domain contém apenas interfaces, Infrastructure contém implementações
- **Inversão de Dependência**: Use Cases dependem de abstrações, não de implementações concretas
- **Injeção de Dependência**: Gateways são injetados via constructor nos Controllers
- **Type Safety**: Uso de TypeScript com tipagem forte em todas as camadas
- **Database Abstraction**: `IDatabaseConnection` abstrai o acesso ao banco de dados
- **Clean Architecture**: Fluxo de dependências sempre aponta para o Domain
- **Testabilidade**: Interfaces permitem fácil mocking nos testes
- **Extensibilidade**: Novas implementações podem ser criadas sem alterar Use Cases

## Princípios Seguidos

1. **Single Responsibility**: Cada repositório tem uma responsabilidade específica
2. **Open/Closed**: Interfaces abertas para extensão, fechadas para modificação
3. **Liskov Substitution**: Qualquer implementação pode substituir outra
4. **Interface Segregation**: Interfaces específicas para cada domínio
5. **Dependency Inversion**: Use Cases dependem de abstrações, não de concreções

## Estrutura de Testes

```
tests/
├── application/
│   └── use-cases/           # Testes dos Use Cases com mocks
│       ├── CategoryUseCases.test.ts
│       ├── CustomerUseCases.test.ts
│       ├── ProductUseCases.test.ts
│       ├── OrderUseCases.test.ts
│       └── PaymentUseCases.test.ts
└── presentation/
    └── gateways/           # Testes de integração dos Gateways
        ├── CategoryGateway.test.ts
        ├── CustomerGateway.test.ts
        ├── ProductGateway.test.ts
        └── OrderGateway.test.ts
```
