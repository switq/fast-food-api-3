# Explicação do Professor - Tech Challenge Fase 3

## Visão Geral

Sessão focada em esclarecer dúvidas sobre requisitos do Tech Challenge (fase 3), com ênfase em arquitetura cloud, API Gateway, Lambda/Functions, Kubernetes/Ingress, autenticação/autorização (JWT/API Key/AD/Cognito), CI/CD, segregação de repositórios, infraestrutura como código (Terraform) e práticas de banco de dados.

Decisões e orientações priorizam boas práticas DevOps: borda pública via API Gateway, tráfego interno privado para Kubernetes, uso de rate limiting e segurança, automação completa com pipelines e separação de responsabilidades por repositório.

---

## Arquitetura e Componentes (Fase 3)

### API Gateway como borda pública

Deve ser um serviço gerenciado da cloud (AWS API Gateway, Azure API Management, etc.), exposto à internet e roteando internamente.

- Integração recomendada com Network Load Balancer para encaminhamento privado por protocolo aos serviços/pods no cluster.
- Ingress do Kubernetes permanece interno/privado (mesma VPC/VNet); o API Gateway faz o papel externo.
- Permitido um "roteador" simples no API Gateway que delega ao Ingress, desde que a borda pública seja o gateway gerenciado.
- Rate limiting e filtros de segurança no API Gateway para proteger a infraestrutura e evitar sobrecarga dos pods.

### Funções serverless

Uso obrigatório em pelo menos um fluxo (ex.: AWS Lambda, Azure Functions, Google Cloud Functions), p.ex. autenticação/identificação por CPF e consulta de cliente no banco.

**Padrão de fluxo sugerido:**
1. Requisição chega no API Gateway
2. Invoca uma Function (ex.: Lambda)
3. Function consulta/valida no banco:
   - Se CPF existe, retorna dados/gera token se aplicável
   - Se não existe, pode acionar fluxo de criação
4. Limitações de execução curta (ex.: até 15 minutos no Lambda) favorecem funções coesas e rápidas (autenticação/consulta)

### Autenticação e Autorização

**Opções aceitas:** JWT ou equivalente (p.ex. API Key), AD, AWS Cognito, ou implementação própria via Function.

- **Para "totem"/público:** endpoints de pedido/consulta podem ser abertos (sem senha do cliente). É válido uso interno de JWT entre componentes ou API Key fixa por dispositivo.
- **Fluxos administrativos/back-office:** devem ser protegidos (JWT de funcionário, RBAC, etc.).
- **Geração de JWT baseada apenas em CPF:** para o totem é aceitável (token de sessão do dispositivo), desde que não exponha senha do cliente.

### Kubernetes e Rede

- Ingress deve ser interno (balanceador de carga privado/interno); ajustar as anotações para o tipo internal.
- API Gateway (cloud) é a única superfície pública.
- Comunicação entre API Gateway e serviços no cluster deve ocorrer por rede privada (mesma VPC/VNet, IP privado).

### Banco de Dados

**Livre escolha:** relacional (RDS/SQL) ou não relacional (DynamoDB, MongoDB/Atlas/DocumentDB).

- Não é obrigatório separar bancos por domínio nesta fase monolítica; separar conforme criticidade/isolamento em cenários de microserviços.

**Melhorias esperadas:**
- Normalização (1FN/2FN/3FN) quando aplicável
- Índices (incluindo secundários/únicos) e chaves primárias otimizadas
- Particionamento lógico ou separação de tabelas para reduzir gargalos
- Justificar a escolha do tipo de banco conforme modelo de acesso e relacionamento

### Custos e Ambiente Acadêmico

- **Uso do AWS Academy** com créditos (~USD 50 por aluno); todos serviços principais (EKS/ECR/RDS/DynamoDB/API Gateway) estão disponíveis.
- **DocumentDB** (Mongo compatível) não está no Academy; Mongo Atlas Free Tier é aceitável.
- **Prática recomendada:** subir infra para gravação e destruir logo após (Terraform apply/destroy) para evitar custos.

---

## Repositórios e Segregação de Código

### Estrutura mínima esperada: 4 repositórios

#### 1. Lambda/Serverless
- Código-fonte das Functions
- Pipeline de deploy (ex.: empacotar e publicar para o serviço serverless)
- Pode conter IaC específica (Serverless Framework/CloudFormation/Terraform) para API Gateway/Functions

#### 2. Infra (Kubernetes e agregados)
- Terraform para cluster (EKS/AKS/GKE), VPC/VNet, NLB/ALB, S3/Storage, repositórios de imagens (ECR/ACR/GCR), etc.
- Pode aplicar manifests/Helm charts via Terraform/Helm provider/kubectl steps, se desejado

#### 3. Banco de Dados (Infra de DB)
- Terraform para instâncias/serviços de DB, isolado por segurança/sensibilidade
- Evita que alterações de infra geral impactem o estado do banco (menor risco de recriação acidental)

#### 4. Aplicação
- Código da aplicação, Dockerfile, manifests Kubernetes (Deployment, Service, ConfigMap, Secret), Helm chart se usado
- **Pipeline:**
  - Build de imagem e push para registry (ECR/ACR/...)
  - Deploy no cluster (kubectl apply/Helm upgrade)

### Observações de flexibilidade

- API Gateway pode ser provisionado no repo de Lambda ou no repo de Infra
- Deploy de Lambda pode ser acionado no repo de Lambda; recursos de suporte (roles, VPC, gateways) podem residir no repo de Infra
- É aceitável IaC híbrida: Serverless Framework, Terraform, CloudFormation, AWS CLI em pipelines
- Helm pode ser versionado em registry e aplicado via pipeline; também é válido usar Terraform Helm provider

---

## CI/CD, Segurança e Governança

### Pipelines e automação
- Todos os repositórios devem possuir deploy automatizado para a cloud usando Actions (ou Terraform Cloud para IaC)
- É válido usar Terraform Cloud como orquestrador de IaC, com states remotos

### Proteção de branches
- `main`/`master` devem ser protegidas (sem push direto); uso de pull requests obrigatório
- Professores validarão existência de branch protection e histórico de PRs fechados

### Segredos e variáveis
- Armazenar valores sensíveis em Secrets do GitHub e/ou Environments por ambiente (dev/stage/prod)
- Centralizar variáveis "universais" em Secrets de organização ou Secret Manager

### Coordenação entre repositórios
- Usar Secret Manager/Parameter Store para buscar outputs dinâmicos da Infra nos pipelines
- Padronizar nomes/domínios estáticos quando possível para reduzir acoplamento

---

## Entregáveis, Demonstração e Avaliação

### Vídeo de demonstração
- Mostrar pipelines concluídas com sucesso (checks verdes e steps relevantes)
- Exibir serviços funcionando na cloud: API Gateway, Function, Kubernetes, etc.
- Explicar arquitetura, função de cada serviço e justificativa de escolhas

### Artefatos finais
- Documento com links para os 4 repositórios e link público do vídeo (YouTube/Drive)

### Pós-gravação
- Infra pode ser destruída para evitar custos

### Conteúdo de Banco de Dados
- Melhorias de performance/estrutura (índices, normalização, chaves) são válidas e devem ser documentadas

---

## Problemas Identificados e Soluções

### Problema: Confusão sobre a implementação do API Gateway e sua integração com Kubernetes
**Solução:** Usar API Gateway gerenciado como ponto de entrada externo e manter o Ingress interno para comunicação privada.

### Problema: Preocupação com custos de serviços AWS e limites de crédito
**Solução:** Recomendar Terraform destroy após o uso e utilizar Lambda para autenticação para simplificar.

### Problema: Falta de clareza sobre requisitos de banco de dados e modelagem
**Solução:** Implementar melhorias de performance (índices, otimizações) e separar repositórios para melhor gerenciamento.

---

## Perguntas e Respostas

**Q:** Tulio perguntou sobre a possibilidade de usar recursos AWS/Azure para API Gateway.  
**A:** Professor confirmou que podem usar recursos cloud gerenciados, criando via Terraform.

**Q:** Pedro questionou sobre necessidade de API Gateway com Ingress já implementado.  
**A:** Professor explicou que precisam usar API Gateway por requisito, mesmo com Ingress existente.

**Q:** Jivaldo perguntou sobre implementação vs uso de serviço API Gateway.  
**A:** Professor esclareceu que devem usar o serviço API Gateway da cloud, não implementar um próprio.

---

## Pontos de Ação

### @Equipe
- [ ] Definir e provisionar API Gateway gerenciado como borda pública e tornar o Ingress privado
- [ ] Implementar função serverless (ex.: Lambda) para fluxo de identificação/autenticação por CPF e consulta ao banco
- [ ] Segregar código em 4 repositórios (Lambda, Infra, Banco de Dados, Aplicação) com pipelines automatizados
- [ ] Configurar proteção de branches (main/master) e operar por pull requests em todos os repositórios
- [ ] Centralizar segredos/variáveis (GitHub Secrets/Environments e/ou Secret Manager) e padronizar nomes
- [ ] Implementar melhorias no banco (normalização/índices/chaves/particionamento) e documentar justificativas da escolha do SGBD
- [ ] Gravar vídeo demonstrando pipelines concluídas, serviços na cloud e explicações de arquitetura

### @Coordenação
- [ ] Agendar e divulgar lives/grupos de estudo de Banco de Dados e compartilhar materiais de referência