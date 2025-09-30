# Implantação Kubernetes com Kustomize

Este diretório contém os manifests Kubernetes organizados usando Kustomize para facilitar a troca entre ambientes.

## Estrutura

```
k8s/
├── base/                    # Configuração base (independente do ambiente)
│   ├── kustomization.yaml
│   └── kubernetes.yaml
└── overlays/               # Configurações específicas por ambiente
    ├── local/              # Desenvolvimento local
    │   └── kustomization.yaml
    └── cloud/              # Ambiente cloud (apenas para fins educacionais)
        ├── kustomization.yaml
        └── azure-secrets.yaml
```

## Implantação Rápida

### Desenvolvimento Local

```bash
kubectl apply -k k8s/overlays/local
```

### Cloud (Apenas para Aprendizado)

```bash
kubectl apply -k k8s/overlays/cloud
```

> **⚠️ Nota Importante**: A configuração de produção é apenas para fins educacionais e de aprendizado. Não há recursos reais na nuvem configurados. Esta configuração demonstra como seria uma implantação em produção, mas não está conectada a nenhum ambiente real.

## Troca de Ambientes

A configuração permite trocar facilmente entre ambientes:

- **Local**: Usa PostgreSQL local, configurações de desenvolvimento e secrets locais
- **Cloud**: Demonstra uso do Azure Key Vault para secrets, configurações de cloud e banco de dados externo (apenas para aprendizado)

## Características Principais

- **Base independente do ambiente**: A configuração base funciona para qualquer ambiente
- **Sem valores hardcoded**: Todos os valores específicos do ambiente estão nos overlays
- **Gerenciamento flexível de secrets**: Local usa secrets simples, cloud demonstra Azure Key Vault
- **Fácil customização**: Adicione novos overlays para staging, testing, etc.

## Customização

Para adicionar um novo ambiente (ex: staging):

1. Crie `k8s/overlays/staging/`
2. Copie de `local` ou `cloud` como ponto de partida
3. Modifique o `kustomization.yaml` para seu ambiente
4. Implante com: `kubectl apply -k k8s/overlays/staging`

## Gerenciamento de Secrets

- **Local**: Secrets são codificados em base64 no kustomization.yaml
- **Cloud**: Demonstra uso do Azure Key Vault via External Secrets Operator (apenas para aprendizado)
- **Custom**: Você pode substituir `azure-secrets.yaml` com sua solução preferida de gerenciamento de secrets

## Aviso sobre Cloud

A configuração de cloud incluída neste repositório é **apenas para fins educacionais**. Ela demonstra:

- Como configurar secrets do Azure Key Vault
- Como estruturar uma implantação de cloud
- Boas práticas de organização de manifests
- Como usar variáveis de ambiente para configurações sensíveis (AZURE_KEY_VAULT_URL)

**Não há recursos reais na nuvem configurados ou conectados a esta aplicação.**

## Variáveis de Ambiente para Cloud

A configuração de cloud usa as seguintes variáveis de ambiente que devem ser definidas no pipeline de CI/CD:

- `AZURE_KEY_VAULT_URL`: URL do Azure Key Vault (ex: https://fast-food-api-kv.vault.azure.net/)
- `AZURE_TENANT_ID`: ID do tenant do Azure Active Directory

Estas variáveis são substituídas durante o processo de deployment pelo pipeline.
