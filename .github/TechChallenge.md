# 11SOAT - Fase 3 - Tech Challenge

---

## JOSÉ RUBENS RODRIGUES E DOUGLAS LIMA
## POS TECH
## SOFTWARE ARCHITECTURE
## TECH CHALLENGE
## FASE 03

---

## Tech Challenge

O Tech Challenge é o projeto da fase que englobará os conhecimentos obtidos em todas as disciplinas da fase. Esta é uma atividade que, em princípio, deve ser desenvolvida em grupo. É importante atentar-se ao prazo de entrega, pois é uma atividade obrigatória, uma vez que vale 90% da nota de todas as disciplinas da fase.

### O problema

Há uma lanchonete de bairro que está expandindo devido ao seu grande sucesso. Porém, com a expansão e sem um sistema de controle de pedidos, o atendimento aos clientes pode ser caótico e confuso. Por exemplo, um cliente pode fazer um pedido complexo, como um hambúrguer personalizado, e a anotação em papel pode resultar em erros na preparação. Sem um sistema de controle de pedidos, pode haver confusão entre os atendentes e a cozinha, resultando em atrasos e na insatisfação dos clientes.

Em resumo, um sistema de controle de pedidos é essencial para garantir que a lanchonete possa atender os clientes de maneira eficiente, gerenciando seus pedidos e estoques de forma adequada. Sem ele, a expansão pode ser impactada negativamente.

Para solucionar o problema, a lanchonete irá investir em um sistema de autoatendimento de fast food, que é composto por uma série de dispositivos e interfaces que permitem aos clientes selecionar e fazer pedidos sem precisar interagir com um atendente.

---

### Funcionalidades do Sistema

#### Pedido

Os clientes podem se identificar via CPF, se cadastrar com nome e e-mail, ou não se identificar. Eles podem montar um combo opcional na seguinte sequência: Lanche, Acompanhamento, Bebida. Em cada etapa, o nome, a descrição e o preço de cada produto são exibidos.

#### Pagamento

O sistema deve ter uma opção de pagamento integrada para o MVP. A forma de pagamento será via **QRCode do Mercado Pago**.

#### Acompanhamento e Entrega

Uma vez que o pedido é confirmado e pago, ele é enviado para a cozinha. O cliente pode acompanhar o progresso em um monitor com as seguintes etapas: Recebido, Em preparação, Pronto e Finalizado. Quando o pedido estiver pronto, o sistema notificará o cliente para retirada. Ao ser retirado, o status do pedido deve ser atualizado para "finalizado".

---

### Acesso Administrativo

O estabelecimento precisa de um acesso administrativo para:

* **Gerenciar clientes:** Usar a identificação dos clientes para trabalhar em campanhas promocionais.
* **Gerenciar produtos e categorias:** Gerenciar produtos, definindo nome, categoria, preço, descrição e imagens. As categorias fixas são: Lanche, Acompanhamento, Bebida e Sobremesa.
* **Acompanhamento de pedidos:** Acompanhar pedidos em andamento e o tempo de espera de cada um.

As informações precisam ser gerenciadas através de um painel administrativo.

---

### Entregáveis FASE 3

As seguintes melhorias e alterações devem ser feitas:

1. Implementar um **API Gateway** e uma **função serverless** para autenticar/consultar o cliente por CPF. O fluxo pode utilizar JWT e o cliente não precisa de senha.
a.Integrar/Consultar o sistema de autenticação (AD, Cognito) para identificar o cliente.
b.O cliente não precisa inserir qualquer tipo de senha para se identificar, somente o CPF.
c.O fluxo de integração/consulta pode utilizar JWT ou equivalente.

2. Implementar **CI/CD** com repositórios segregados para o Lambda, a infraestrutura Kubernetes (com Terraform), a infraestrutura do banco de dados (com Terraform) e a aplicação no Kubernetes.
a.1 repositório para o Lambda.
b.1 repositório para sua infra Kubernetes com Terraform.
c.1 repositório para sua infra banco de dados gerenciáveis com Terraform.
d.1 repositório para sua aplicação que é executada no Kubernetes.


3. Os repositórios devem fazer deploy automatizado usando actions. As branches `main`/`master` devem ser protegidas, usando **Pull Request** para **Merge** e **Deploy**. Use **Secrets** para valores sensíveis, e toda criação/edição na cloud deve ser feita com **Terraform** e automatizada com **CI/CD**.


4. Melhorar a estrutura do banco de dados, documentar a modelagem e justificar a escolha.

5. A escolha da **Cloud** é livre, mas deve-se usar serviços **serverless** (ex: AWS Lambda), bancos de dados gerenciáveis (ex: AWS RDS) e sistemas de autenticação (ex: AWS Cognito).

6. Deixe o projeto privado e adicione o usuário `soat-architecture` para validação.

7. Entregar um vídeo demonstrando a arquitetura na cloud e as execuções das Pipelines CI/CD. O vídeo pode ser postado no Youtube, Vimeo ou Google Drive, e deve estar público ou não listado. Não é necessário mostrar as pipelines em execução, apenas os checks de sucesso. O vídeo deve exibir os serviços criados e explicar suas funções. Após a gravação, a infraestrutura pode ser excluída para evitar gastos.

---

### Artefatos de Entrega

Os artefatos de entrega são um **PDF ou TXT** com o link do repositório, que deve ser público ou com acesso dos docentes. O repositório deve conter todos os códigos (incluindo Terraform e CI/CD actions), ter a branch protegida, os Pull Requests fechados e a URL do vídeo.

---

### POS TECH