# Testes

O projeto tem duas suítes independentes: testes unitários (Vitest) e testes E2E (Cypress). Nenhuma das duas depende de chaves de API reais ou de internet — toda chamada externa é mockada.

## Testes unitários (Vitest)

Rodam via `@angular/build:unit-test` (o runner nativo do Angular CLI para Vitest), a partir de `app/`.

```bash
npm test                 # roda tudo, com cobertura, sem watch (o que o CI usaria)
npm run test:watch       # modo watch, para desenvolvimento
npm run test:ui          # abre a UI interativa do Vitest (@vitest/ui)
```

Comandos equivalentes via `ng test` direto, se precisar de mais controle:

```bash
npx ng test --watch=false                                    # roda uma vez
npx ng test --watch=false --coverage                         # com relatório de cobertura
npx ng test --watch=false --reporters=dot                     # log mínimo
npx ng test --watch=false --filter="WeatherService"          # só specs que casem com o padrão
npx ng test --ui                                              # Vitest UI
```

**199 testes**, cobertura atual de **96.5%** de statements.

### Convenções

- **Specs co-localizados**: `Foo.ts` + `Foo.spec.ts` no mesmo diretório.
- **Mocks como classes**, estendendo `Mock<T>` (`src/app/test/mock/mock.abstract.ts`):
  ```ts
  export class PlaceMock extends Mock<Place> {
      entity(partial: Partial<Place> = {}): Place {
          return { id: '...', name: 'Barueri', ...partial }
      }
  }
  ```
  `entity(overrides)` gera uma instância; `entities(length)` gera várias (repetindo `entity()`).
- **Mocks de payload cru** (`*.schema.mock.ts`) representam a resposta da API **antes** da validação Zod — usados para testar schemas e a transformação DTO (`plainToInstance`).
- **Services HTTP**: `provideHttpClient()` + `provideHttpClientTesting()`, com `HttpTestingController.expectOne(...).flush(...)` e `httpMock.verify()` no `afterEach`.
- **Backend Express** (`server/controllers/*`): não usa `TestBed`/jsdom — mocka o `fetch` global diretamente com `vi.stubGlobal('fetch', ...)`, já que esse código roda em Node, não no browser.
- **Componentes standalone**: `TestBed.configureTestingModule({ imports: [MeuComponente] })`, `fixture.componentRef.setInput(...)` para inputs (funciona tanto para `@Input()` clássico quanto para `input()` de signal).
- **Signals**: lidos/escritos direto (`component['algumSignal']()`, `.set(...)`), acessando campos `protected` via notação de colchetes quando necessário nos testes.

## Testes E2E (Cypress)

```bash
npm run test:e2e          # headless, sobe o servidor sozinho e roda tudo (estilo pipeline de CI)
npm run test:e2e-ui       # interativo — abre o Cypress, escolhe navegador/spec, vê rodando
```

Ambos usam `start-server-and-test` para subir o `ng serve` (porta 4200), esperar responder, e então rodar o Cypress — sem precisar buildar antes.

**3 specs / 6 casos**, em `app/test/e2e/`:

| Spec | Cobre |
| :--- | :--- |
| `dashboard.cy.ts` | Carregamento inicial, renderização de todos os cards |
| `search.cy.ts` | Busca, navegação por teclado no dropdown, seleção, fechar ao clicar fora |
| `favorites.cy.ts` | Favoritar local atual, listar/remover no modal, fechar com Escape |

### Por que nenhuma chave de API é necessária

Toda chamada de rede (`/api/weather`, `/api/geocoding*`) é interceptada no nível do **navegador** com `cy.intercept()` + fixtures em `app/cypress/fixtures/`, no mesmo formato que o Express devolve (`{ data: ... }`). O backend nem chega a ser acionado para essas rotas.

```ts
cy.mockWeatherApi()             // intercepta /api/weather*
cy.mockGeocodingCoordinates()   // intercepta /api/geocoding/coordinates*
cy.mockGeocodingSearch()        // intercepta /api/geocoding?*
```

(comandos customizados em `app/cypress/support/commands.ts`)

### Stub de geolocalização

`navigator.geolocation` é uma Web API do navegador, não uma chamada de rede — `cy.intercept()` não se aplica. É sobrescrita antes do app carregar:

```ts
import { stubGeolocation } from '../../cypress/support/e2e'

cy.visit('/', { onBeforeLoad: stubGeolocation() })
```

**Importante:** as coordenadas padrão do `stubGeolocation()` (`-22.9068,-43.1729`) são **deliberadamente diferentes** do fallback hardcoded do dashboard (`-23.5505,-46.6333`, usado quando a geolocalização falha). Isso existe por causa de uma interação com SSR: durante o SSR, `navigator.geolocation` não existe em Node, então o `getCurrentLocation()` sempre cai nesse fallback e essa chamada de clima fica em cache no `TransferState` do Angular (ver [`ARCHITECTURE.md`](ARCHITECTURE.md#fluxo-de-carregamento-inicial-ssr--hidratação)). Se o teste estubasse a geolocalização com as **mesmas** coordenadas do fallback, a chamada do cliente reaproveitaria esse cache e nunca bateria de verdade na rede — o `cy.intercept()` nunca veria a requisição.

### Nota sobre o Windows

`npm run test:e2e` pode retornar **exit code 1 mesmo com todos os testes passando** no Windows — o `start-server-and-test` tenta encerrar o `ng serve` via `taskkill` num PID que o Vite às vezes já reciclou internamente, e isso propaga como falha do script. Confira o resumo do Cypress no output ("All specs passed!"), não só o exit code do terminal. Isso é uma particularidade do encerramento de processos no Windows e não deve reproduzir no CI (Linux).

## CI

`.github/workflows/e2e.yml` roda os testes E2E em todo `push` para `main` e em `pull_request`, fazendo upload de screenshots/vídeos do Cypress como artefato em caso de falha. Não há workflow separado para os testes unitários ainda — pode ser adicionado seguindo o mesmo padrão (`npm ci && npm test`).
