# Pull Request

Obrigado por contribuir! Preencha as seções abaixo para agilizar a revisão.

## Tipo de alteração
- [ ] feat: nova funcionalidade
- [ ] fix: correção de bug
- [ ] docs: documentação
- [ ] style: formatação/estilo
- [ ] refactor: refatoração
- [ ] perf: melhoria de performance
- [ ] test: adição/ajuste de testes
- [ ] chore: tarefas diversas (infra, CI, scripts)

## Descrição
Descreva brevemente o que foi feito e o motivo.

## Checklist de revisão (obrigatório antes do merge)
- [ ] Código segue o padrão de Clean Architecture (presentation -> application -> domain). Nenhum arquivo em application ou domain importa infrastructure/presentation.
- [ ] Adicionadas interfaces na camada `domain` para novos gateways/repos if aplicável.
- [ ] Use Cases na camada `application` não instanciam implementações concretas (injeção via construtor ou factory no bootstrap).
- [ ] Implementações concretas adicionadas somente em `infrastructure` e não foram importadas em camadas internas.
- [ ] Linters e Prettier foram executados: `npm run lint` e `npm run format` (ou equivalente).
- [ ] TypeScript build check: `npm run build` / `npx tsc --noEmit` passou sem erros.
- [ ] Testes unitários adicionados/atualizados e passando: `npm test`.
- [ ] Atualizado CHANGELOG ou documentação relevante.
- [ ] Se aplicável, atualizados arquivos Terraform/infra e adicionados planos/outputs necessários.

## Como testar
Instruções curtas para reproduzir localmente (ex.: comandos, rotas, payloads).

## Issues relacionadas
Closes: #<numero>

---

Notas de segurança/segredos: Não inclua segredos ou variáveis sensíveis neste PR. Use GitHub Secrets / Secret Manager.
