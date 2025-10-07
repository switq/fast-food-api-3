# Deploy completo (Full Cloud) — Passo a passo

Este documento descreve, passo a passo, como instalar e subir o ambiente completo do projeto Fast Food na AWS (Cognito, Lambda, API Gateway, Secrets Manager, IAM, RDS). Use este guia quando for necessário provisionar o ambiente em nuvem para demonstração ou avaliação final.

IMPORTANTE: o arquivo `dev.tfvars` contém valores sensíveis (secrets, senhas). Nunca commit este arquivo com credenciais reais. Entregue `dev.tfvars.example` vazio para o professor preencher.

## Pré-requisitos

- Conta AWS com permissões para criar: IAM, Lambda, API Gateway v2, Cognito, RDS, Secrets Manager, S3/DynamoDB (opcional para backend).
- AWS CLI configurada e testada (ex.: profile `estudos`).
- Terraform 1.5+ instalado.
- Node.js 18+ e npm (para gerar/atualizar o package do Lambda se necessário).
- (Opcional) kubectl / eksctl se for criar EKS.

## Arquivos principais

- `infra/` — módulos Terraform (cognito, iam, lambda, api_gateway, secrets, eks (opcional)).
- `infra/dev.tfvars` — valores específicos do ambiente (region, nomes, jwt_secret_string, lambda package path etc.). Nunca versionar com segredos reais.
- `fast-food-auth-lambda/deploy/fast-food-auth-lambda.zip` — package do Lambda usado pelo Terraform (pode ser gerado pelo build do lambda).

## 1) Preparar variáveis (`dev.tfvars`)

Copie o arquivo de exemplo (`infra/dev.tfvars.example`) para `infra/dev.tfvars` e preencha os campos. Exemplo dos campos importantes:

- `aws_region = "us-east-1"`
- `jwt_secret_name = "fast-food-jwt-secret-dev"`
- `jwt_secret_string = "<SEU_JWT_SECRET_AQUI>"`
- `lambda_function_name = "fast-food-auth-identify-dev"`
- `lambda_package_path = "../fast-food-auth-lambda/deploy/fast-food-auth-lambda.zip"`
- `api_name = "fast-food-auth-api"`
- (opcional) `tf_state_bucket` e `tf_state_lock_table` se usar backend remoto

Atenção: mantenha `jwt_secret_string` em um lugar seguro (ou gere via AWS Secrets Manager depois e ajuste o tfvars para referenciar o secret ARN).

## 2) Preparar o package do Lambda

Se o zip já estiver no caminho indicado, pule esta etapa. Se precisar gerar:

```powershell
# no Windows PowerShell
cd .\fast-food-auth-lambda
npm install
npm run build
# gerar zip (ajuste caminho de saída se necessário)
Remove-Item -Recurse -Force .\deploy\fast-food-auth-lambda.zip -ErrorAction SilentlyContinue
Compress-Archive -Path .\dist\* -DestinationPath .\deploy\fast-food-auth-lambda.zip
```

Verifique que `infra/dev.tfvars` aponta para o caminho correto `../fast-food-auth-lambda/deploy/fast-food-auth-lambda.zip`.

## 3) Configurar AWS CLI profile

Configure o profile que será usado (ex.: `estudos`):

```powershell
aws configure --profile estudos
# Informe: AWS Access Key, AWS Secret Access Key, region (us-east-1), output=json
```

Verifique a identidade:

```powershell
$env:AWS_PROFILE='estudos'
aws sts get-caller-identity
```


## Usando os scripts de apoio

No diretório `fast-food-api/docs/` há dois scripts PowerShell úteis:

- `bootstrap-cloud.ps1` — cria o `infra/dev.tfvars` a partir do exemplo (se não existir) e executa `terraform init` + `terraform apply`.
- `destroy-cloud.ps1` — executa `terraform destroy --var-file=dev.tfvars` após confirmação.

Ambos os scripts pedem ao usuário o AWS profile a ser usado (ex.: `estudos`). Antes de rodar o `bootstrap-cloud.ps1`, edite `infra/dev.tfvars` e preencha os valores sensíveis.

Exemplo de uso (PowerShell):

```powershell
cd .\fast-food-api\docs
.\bootstrap-cloud.ps1
```

 
## 4) Inicializar e aplicar Terraform

No diretório `infra/` execute:

```powershell
cd .\infra
$env:AWS_PROFILE='estudos'
terraform init
terraform apply --var-file=dev.tfvars -auto-approve
```

Observações:

- Se o backend remoto (S3 + DynamoDB) estiver configurado no `main.tf` e você usa `dev.tfvars` com `tf_state_bucket`, confirme `terraform init` usará o backend corretamente.
- Se recursos já existirem na conta (ex.: secret, lambda, role), o Terraform pode reclamar de `ResourceExists`. Nesse caso importe os recursos com `terraform import` ou remova os recursos pré-existentes conforme apropriado.

 
## 5) Verificar outputs

Ao finalizar o `terraform apply`, observe os outputs mostrados. Ex.:

- `api_gateway_invoke_url`
- `cognito_user_pool_id` e `cognito_client_id`
- `lambda_function_arn`
- `lambda_function_name`
- `jwt secret arn` (se criado)

Guarde estes valores para os próximos passos.

 
## 6) Rodar migrations no RDS

Se o RDS foi criado em subnets privadas (recomendado), você NÃO conseguirá conectar ao banco direto da sua máquina. Duas opções práticas:

Opção A — Rodar migrations a partir de uma instância bastion (EC2)

1. Criar uma EC2 temporária na mesma VPC/subnet (com SSM Agent é mais simples).
2. Fazer SSH (ou SSM Session Manager) para a EC2.
3. No bastion, configurar `DATABASE_URL` apontando para o endpoint do RDS e executar:

```powershell
# dentro da bastion (Linux exemplo)
cd /home/ubuntu/fast-food-api
export DATABASE_URL='postgresql://admin:MySecret@lanchonete-db.<endpoint>.rds.amazonaws.com:5432/lanchonete'
npx prisma migrate deploy
```

 
Opção B — Rodar migrations como Job no EKS (recomendado para infra k8s)

1. Crie uma imagem Docker que execute `npx prisma migrate deploy` (ou use uma imagem node e execute comando no job).
2. Crie um `Job` Kubernetes com access ao Secret/ConfigMap contendo `DATABASE_URL`.
3. Execute o job: ele aplicará as migrations dentro da VPC.

Exemplo de Job (esqueleto):

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: prisma-migrate
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: node:18
        command: ["/bin/sh","-c","npm install && npx prisma migrate deploy"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: DATABASE_URL
      restartPolicy: Never
```

Certifique-se de que o job roda na mesma VPC/subnet para ter conectividade com o RDS.

 
## 7) Criar usuário administrador no Cognito

Você pode criar um usuário admin via Console Cognito ou AWS CLI:

```powershell
aws cognito-idp admin-create-user --user-pool-id <POOL_ID> --username admin@example.com --temporary-password 'Temp123!' --user-attributes Name=email,Value=admin@example.com --profile estudos
# depois force-set a senha ou use o fluxo de troca de senha
```

Também crie um grupo `admin` no Cognito e atribua o usuário a este grupo se sua API verificar grupos/claims.

 
## 8) Testes funcionais

- Teste rota de health:

```powershell
Invoke-RestMethod -Uri '<api_gateway_invoke_url>/health' -Method GET
```

- Teste fluxo de login/admin: use a rota que chama o Lambda/Cognito conforme a implementação do projeto.

 
## 9) Limpeza

Quando o professor terminar a avaliação, recomenda-se destruir tudo para evitar custos:

```powershell
cd .\infra
$env:AWS_PROFILE='estudos'
terraform destroy --var-file=dev.tfvars -auto-approve
```

Observação: destruição remove recursos criados pelo Terraform — se existirem recursos manuais fora do Terraform, remova-os também.

 
## Troubleshooting rápido

- Erro `ResourceExists` no terraform: provavelmente já existe um recurso com o mesmo nome na conta. Importar com `terraform import` ou renomear.
- Erro `InvalidParameterException` ao criar EKS (unsupported version): ajuste `eks_kubernetes_version` em `infra/variables.tf` para uma versão suportada pela sua região.
- Migrations não conectam: verifique se o RDS está em subnets privadas. Use bastion ou job no EKS.
- AWS credentials inválidas: verifique `%USERPROFILE%\\.aws\\credentials` e `aws sts get-caller-identity --profile <profile>`.

 
## Dicas de entrega ao professor

- Entregue um `dev.tfvars.example` com instruções onde preencher os valores sensíveis.
- Inclua um `README_cloud.md` (este documento) no diretório `docs/` para referência.
- Inclua o zip do Lambda em `fast-food-auth-lambda/deploy/` — assim o professor não precisa gerar o zip manualmente.
- Recomende começar pelo Quick Local (Docker Compose) para validar funcionamento rápido, e só depois subir o Full Cloud se quiser testar integrações reais.

---

Se quiser, eu gero automaticamente um `docs/README_cloud.md` (este arquivo) e um `infra/dev.tfvars.example` já pronto (sem segredos), além de dois scripts `bootstrap-cloud.ps1` e `destroy-cloud.ps1` que automatizam `terraform init/apply` e `terraform destroy` com o profile `estudos`.

Qual desses adicionais quer que eu crie agora? (dev.tfvars.example / scripts / ambos / nenhum)
