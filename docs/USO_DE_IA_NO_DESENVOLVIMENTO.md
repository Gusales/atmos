# Utilização da IA no Desenvolvimento do Desafio

Utilizei o Claude Code como par de desenvolvimento ao longo de praticamente todo o projeto, sempre em modo colaborativo: eu revisava e aprovava cada etapa antes de seguir pra próxima, e pedia mensagem de commit e confirmação a cada bloco de trabalho concluído. Também usei o Claude.ai (web) separadamente, como apoio de pesquisa em documentação técnica do Angular e das APIs consumidas (Visual Crossing, Nominatim), fora do fluxo do Claude Code. Abaixo, o resumo de como cada etapa foi conduzida com esse apoio.

## Layout e Estilização Inicial

- Já tinha um layout desse mesmo projeto pronto em HTML/CSS puro, de um desafio anterior meu ([`Gusales/boracodar`, projeto número 10](https://github.com/Gusales/boracodar)). Esse layout original foi desenvolvido para os desafios semanais do canal da Rocketseat, a partir de um design que tenho no Figma. Pedi pra IA portar esse layout base pra dentro da estrutura de componentes Angular, mantendo a mesma identidade visual.
- Usei o Claude Code pra ajustar os estilos com Tailwind, adaptando o layout original (pensado pra desktop) para telas de celular e tablet — breakpoints, reflow dos cards, e o scroll horizontal do card de previsão.
- Pedi validações das chamadas às APIs externas (formato de resposta esperado, campos obrigatórios) durante essa fase inicial, antes mesmo de existir a suíte de testes automatizados.

## Testes Unitários

- Pedi para a IA analisar como um outro case, utilizado em outro teste ténico para vaga de Analista JR ([`Skinzin/case_mastermind`](https://github.com/Skinzin/case_mastermind)) ,estruturava os testes unitários, e a partir disso gerar um plano de ação (`TESTING-ACTIONS.md`) cobrindo toda a superfície do projeto: schemas Zod, DTOs (`class-transformer`), services HTTP, componentes apresentacionais e componentes com interação de DOM, e o lado servidor (Express).
- Executei o plano em 11 etapas sequenciais, revisando e aprovando cada uma antes de avançar. Isso resultou em 199 testes cobrindo o projeto inteiro (Vitest via `@angular/build:unit-test`).
- A IA encontrou e corrigiu bugs reais nesse processo, não só lacunas de teste: um `provideHttpClient()` ausente em `app.config.ts` que quebraria toda chamada HTTP em produção, um `console.log` de debug esquecido no `GeoCodingService`, e um `app.spec.ts` com asserção obsoleta (`Hello, app`) que nunca refletia o app real.
- Também apontei quando um comportamento parecia errado (ex: "esse componente não deveria vir com essa classe") e a IA investigou a causa raiz antes de propor a correção, em vez de aplicar um ajuste superficial.

## Nova Funcionalidade (RF03 — Previsão Horária)

- Passei uma especificação técnica detalhada (schema, DTO, regras de negócio do card, estrutura visual, acessibilidade e escopo de testes) e pedi pra IA implementar exatamente o que estava descrito, sem adicionar nada além do pedido.
- Nesse processo, a IA identificou que o campo `datetime` das horas nunca era retornado pela API real (Visual Crossing) — o parâmetro `elements` da requisição restringe os campos aos listados, e `datetime` não estava entre eles. Ela confirmou isso fazendo uma chamada real à API antes e depois da correção, em vez de assumir.
- Reportei um bug visual (o card novo quebrou o responsivo do site) e a IA diagnosticou a causa (um item de grid com conteúdo rolável horizontalmente sem `min-width: 0`, forçando a página inteira a esticar) e aplicou a correção mínima, sem tocar em mais nada do layout.

## Polling de Clima

- Pedi pra adicionar um polling de 5 em 5 minutos pra reconsultar o clima do local atual, e a IA implementou usando o padrão reativo já existente no projeto (RxJS `interval` + `takeUntilDestroyed`), reaproveitando o local já resolvido em vez de repetir geolocalização/geocoding.

## Testes E2E (Cypress)

- Pedi um plano de ação separado (`TESTING-E2E-CYPRESS.md`) pra configurar Cypress com dois modos de execução (headless para CI, interativo pra ver rodando no navegador), antes de qualquer implementação.
- Na execução, a IA encontrou uma interação sutil entre SSR e o Transfer State do Angular: como a hidratação reaproveita automaticamente uma resposta HTTP já buscada no servidor, um teste que estubasse a geolocalização com as mesmas coordenadas do fallback padrão nunca bateria de verdade na rede no cliente — o `cy.intercept()` nunca veria a chamada. A IA diagnosticou isso analisando o comportamento do `HttpClient`/`provideClientHydration()`, não só tentando valores diferentes até funcionar.
- Também identificou (e documentou, sem tentar mascarar) que o `npm run test:e2e` retorna exit code 1 no Windows mesmo com todos os testes passando, por uma particularidade de como o `start-server-and-test` encerra processos nesse sistema operacional — e confirmou que isso não deve reproduzir no CI (Linux).

## Containerização (Docker)

- Pedi ajuda pra entender como estruturar o Dockerfile considerando que as variáveis de ambiente do projeto são acessadas só no lado do servidor.
- A IA testou o build e o container rodando de verdade (não só escreveu o Dockerfile) e, fazendo isso, encontrou dois problemas reais que eu não tinha antecipado: a rota pré-renderada do Angular faz uma chamada real à API durante o `build` (exigindo as chaves também como `--build-arg`, não só em runtime), e o SSR do Angular valida o header `Host` contra uma allowlist (`NG_ALLOWED_HOSTS`), rejeitando com 400 qualquer porta mapeada externamente que não estivesse configurada.

## Considerações Finais

Em vários pontos a IA não só implementou o que foi pedido, como validou o resultado de forma ativa — rodando a suíte de testes, fazendo chamadas reais à API pra confirmar o formato de um payload, buildando e subindo o container Docker pra confirmar que funcionava de ponta a ponta — em vez de assumir que o código escrito estava correto. Isso foi importante porque vários dos bugs reais encontrados (o `provideHttpClient` ausente, o `datetime` faltando na API, o `NG_ALLOWED_HOSTS`) só apareceram justamente nessa verificação prática, não na leitura do código.
