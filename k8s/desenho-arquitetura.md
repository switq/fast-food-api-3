# Arquitetura Realista - Fast Food API

## 1. Requisitos do Negócio (Problema)

### Contexto do Negócio


O restaurante de fast food precisa de uma solução para gerenciar pedidos, clientes, produtos e pagamentos de forma eficiente. Os principais desafios são:

#### **Problemas Identificados:**

1. **Performance do Totem**: Sistema de pedidos pode ficar lento durante picos de demanda
2. **Disponibilidade**: Necessidade de alta disponibilidade para não perder vendas
3. **Integração de Pagamentos**: Processamento seguro de pagamentos PIX via Mercado Pago
4. **Gestão de Pedidos**: Controle do fluxo de pedidos da cozinha
5. **Segurança**: Proteção de dados sensíveis de clientes e pagamentos

#### **Impacto no Negócio:**


- **Perda de Receita**: Clientes desistem devido a lentidão
- **Operacional**: Dificuldade em gerenciar pedidos na cozinha
- **Compliance**: Riscos de segurança de dados de pagamento

## 2. Desenho da Arquitetura Atual

### 2.1 Diagrama de Arquitetura Geral

```mermaid
graph TB
    subgraph "Cliente"
        A[Cliente no Totem]
        B[Equipe da Cozinha]
    end

    subgraph "Kubernetes Cluster"
        subgraph "Ingress Layer"
            C[NGINX Ingress]
        end

        subgraph "Application Layer"
            D[Fast Food API Pod 1]
            E[Fast Food API Pod 2]
        end

        subgraph "Auto-Scaling"
            F[HPA - CPU/Memory]
        end

        subgraph "Database Layer"
            G[PostgreSQL Pod]
        end
    end

    subgraph "External Services"
        H[Mercado Pago API]
        I[Webhook Handler]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    D --> G
    E --> G
    F --> D
    F --> E
    D --> H
    E --> H
    H --> I
    I --> D
    I --> E
```

### 2.2 Diagrama Detalhado de Componentes

```mermaid
graph LR
    subgraph "Frontend Layer"
        A1[Totem Interface]
        A2[Kitchen Dashboard]
    end

    subgraph "API Gateway Layer"
        B1[NGINX Ingress]
        B2[SSL Termination]
    end

    subgraph "Application Layer"
        C1[API Pod 1]
        C2[API Pod 2]
        C3[Health Checks]
    end

    subgraph "Business Logic Layer"
        D1[Order Management]
        D2[Payment Processing]
        D3[Customer Management]
        D4[Product Management]
    end

    subgraph "Data Layer"
        E1[PostgreSQL]
        E2[Prisma ORM]
    end

    subgraph "External Services"
        F1[Mercado Pago]
        F2[Webhook Handler]
    end

    A1 --> B1
    A2 --> B1
    B1 --> C1
    B1 --> C2
    C1 --> D1
    C2 --> D2
    D1 --> E1
    D2 --> E1
    D3 --> E1
    D4 --> E1
    D2 --> F1
    F1 --> F2
    F2 --> D2
```

## 3. Requisitos de Infraestrutura

### 3.1 Plataforma Kubernetes

**Escolha: Kubernetes Local / Cloud (Apenas para Aprendizado)**

#### **Justificativa da Escolha:**

- **Kubernetes Local**: Ideal para desenvolvimento e testes locais
- **Cloud**: Demonstração de configurações de produção (apenas para aprendizado)
- **Kustomize**: Gerenciamento de configurações por ambiente
- **Docker Desktop**: Conveniência e facilidade

### 3.2 Componentes Implementados

#### **3.2.1 Auto-Scaling (HPA)**

```yaml
# Horizontal Pod Autoscaler para resolver problemas de performance
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fast-food-api-hpa
  namespace: fast-food-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fast-food-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Justificativa**: Resolve problemas de performance do totem durante picos de demanda

#### **3.2.2 Deployment com Alta Disponibilidade**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fast-food-api
  namespace: fast-food-api
spec:
  replicas: 2 # Múltiplas réplicas para alta disponibilidade
  replicas: 2 # Múltiplas réplicas para alta disponibilidade
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: fast-food-api
  template:
    metadata:
      labels:
        app: fast-food-api
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
      containers:
        - name: fast-food-api
          image: fast-food-api:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
        - name: fast-food-api
          image: fast-food-api:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

#### **3.2.3 Banco de Dados PostgreSQL**

```yaml
# PostgreSQL Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: fast-food-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: "postgres"
            - name: POSTGRES_PASSWORD
              value: "postgres"
            - name: POSTGRES_DB
              value: "fastfood"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: "postgres"
            - name: POSTGRES_PASSWORD
              value: "postgres"
            - name: POSTGRES_DB
              value: "fastfood"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```

#### **3.2.4 Segurança com Network Policies**

```yaml
# Network Policy para controle de tráfego
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: fast-food-api-network-policy
  namespace: fast-food-api
spec:
  podSelector:
    matchLabels:
      app: fast-food-api
  policyTypes:
    - Ingress
    - Egress
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to: []
      ports:
        - protocol: TCP
          port: 53
        - protocol: UDP
          port: 53
    - to:
        - namespaceSelector:
            matchLabels:
              name: fast-food-api
      ports:
        - protocol: TCP
          port: 5432
    - to: []
      ports:
        - protocol: TCP
          port: 443
    - to: []
      ports:
        - protocol: TCP
          port: 53
        - protocol: UDP
          port: 53
    - to:
        - namespaceSelector:
            matchLabels:
              name: fast-food-api
      ports:
        - protocol: TCP
          port: 5432
    - to: []
      ports:
        - protocol: TCP
          port: 443
```

## 4. Soluções para Problemas Específicos

### 4.1 Problema: Performance do Totem

**Solução Implementada:**


- **HPA**: Auto-scaling baseado em CPU/Memory (70% CPU, 80% Memory)
- **Múltiplas Réplicas**: Mínimo 2 pods sempre ativos
- **Load Balancer**: Distribuição de carga via Ingress
- **Resource Limits**: Controle de recursos para evitar sobrecarga

### 4.2 Problema: Disponibilidade

**Solução Implementada:**


- **Rolling Updates**: Atualizações sem downtime
- **Health Checks**: Liveness e Readiness probes
- **Múltiplas Réplicas**: Redundância de aplicação
- **Persistent Storage**: Dados persistentes no PostgreSQL

### 4.3 Problema: Integração de Pagamentos

**Solução Implementada:**


- **Webhook Handler**: Processamento assíncrono de pagamentos Mercado Pago
- **Retry Logic**: Tentativas automáticas em caso de falha
- **Status Tracking**: Monitoramento em tempo real de pagamentos
- **Secure Communication**: HTTPS para comunicação com APIs externas

### 4.4 Problema: Segurança

**Solução Implementada:**


- **Network Policies**: Controle granular de tráfego
- **Pod Security Standards**: Execução sem privilégios (runAsNonRoot)
- **Secrets Management**: Gerenciamento seguro de credenciais
- **Resource Limits**: Prevenção de ataques de recursos

## 5. Fluxo de Dados

### 5.1 Fluxo de Pedido

```mermaid
sequenceDiagram
    participant C as Cliente
    participant I as Ingress
    participant A as API Pod
    participant D as Database
    participant M as Mercado Pago

    C->>I: Criar pedido
    I->>A: POST /orders
    A->>D: Salvar pedido
    D-->>A: Pedido criado
    A->>M: Gerar pagamento
    M-->>A: QR Code PIX
    A-->>C: Retornar QR Code


    Note over M,A: Cliente paga via PIX


    M->>A: Webhook de pagamento
    A->>D: Atualizar status
    A-->>C: Pedido confirmado
```

### 5.2 Fluxo de Auto-Scaling

```mermaid
sequenceDiagram
    participant H as HPA
    participant K as K8s API
    participant P as Pods
    participant M as Metrics Server

    loop A cada 15 segundos
        M->>H: Métricas de CPU/Memory
        alt CPU > 70% OR Memory > 80%
            H->>K: Scale up
            K->>P: Criar novo pod
        else CPU < 50% AND Memory < 60%
            H->>K: Scale down
            K->>P: Remover pod
        end
    end
```

## 6. Configuração de Deploy

### 6.1 Comandos de Deploy

```bash
# Build da imagem
docker build -t fast-food-api:latest .

# Deploy no Kubernetes (Local)
kubectl apply -k k8s/overlays/local

# Deploy no Kubernetes (Cloud - Apenas para Aprendizado)
kubectl apply -k k8s/overlays/cloud

# Verificar status
kubectl get pods -n fast-food-api
kubectl get services -n fast-food-api
kubectl get hpa -n fast-food-api
```

### 6.2 Verificação de Saúde

```bash
# Verificar pods
kubectl get pods -n fast-food-api

# Verificar logs
kubectl logs -f deployment/fast-food-api -n fast-food-api

# Verificar HPA
kubectl describe hpa fast-food-api-hpa -n fast-food-api

# Testar aplicação
kubectl port-forward service/fast-food-api-service 3000:80 -n fast-food-api
curl http://localhost:3000/health
```

### 6.3 Ambientes Disponíveis

#### **Local**

- PostgreSQL local
- Secrets codificados em base64
- Configurações de desenvolvimento
- Sem recursos externos

#### **Cloud (Apenas para Aprendizado)**

- Demonstra Azure Key Vault
- Usa variáveis de ambiente (`AZURE_KEY_VAULT_URL`, `AZURE_TENANT_ID`)
- Configurações de cloud
- **Não há recursos reais na nuvem**

## 7. Métricas e KPIs

### 7.1 KPIs de Negócio


- **Tempo de Resposta**: < 500ms para 95% das requisições
- **Disponibilidade**: 99.5% uptime
- **Throughput**: Suporte a 500+ pedidos/minuto
- **Taxa de Erro**: < 1%

### 7.2 Métricas Técnicas


- **CPU Usage**: < 70% média (trigger do HPA)
- **Memory Usage**: < 80% média (trigger do HPA)
- **Pod Count**: 2-10 pods (configuração do HPA)
- **Database Connections**: < 80% do pool

## 8. Estratégia de Evolução

### Fase 1 (Atual - Implementado)


- ✅ Deploy básico no Kubernetes
- ✅ Auto-scaling com HPA
- ✅ Health checks
- ✅ Network policies básicas
- ✅ Integração Mercado Pago
- ✅ Kustomize para gerenciamento de configurações

### Fase 2 (Próximos passos)


- 📋 Implementação de cache Redis
- 📋 Backup automático do banco
- 📋 Logs centralizados
- 📋 Monitoramento básico

### Fase 3 (Futuro)


- 📋 Multi-region deployment
- 📋 Advanced monitoring
- 📋 CI/CD pipeline
- 📋 Security scanning

## 9. Conclusão

Esta arquitetura resolve os problemas críticos do negócio com componentes reais e implementados:

1. **Performance**: HPA com auto-scaling baseado em CPU/Memory
2. **Disponibilidade**: Múltiplas réplicas + Rolling updates + Health checks
3. **Segurança**: Network policies + Pod security standards + Secrets management
4. **Pagamentos**: Webhook handler + Integração Mercado Pago
5. **Escalabilidade**: HPA configurado para 2-10 pods
6. **Flexibilidade**: Kustomize para gerenciamento de configurações por ambiente

A solução é **production-ready** e pode escalar conforme o crescimento do negócio, mantendo a **experiência do cliente** como prioridade máxima. A configuração de cloud é apenas para fins educacionais e demonstração de boas práticas.
