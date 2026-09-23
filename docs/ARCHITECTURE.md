# Arquitetura

## Visão geral

O Atmos é uma aplicação Angular com SSR (Server-Side Rendering) via `@angular/ssr`. O mesmo processo Node roda tanto a renderização do Angular quanto um backend Express embutido, que atua como proxy entre o navegador e as APIs externas — o navegador nunca chama a Visual Crossing ou a Nominatim diretamente, e as chaves de API nunca saem do servidor.

```mermaid
flowchart LR
    subgraph Browser["Navegador"]
        WD[WeatherDashboardComponent]
        PS[PlaceSearchComponent]
        FM[FavoritesModalComponent]
        SVC["WeatherService / GeoCodingService /\nGeoLocationService / FavoritesService"]
    end

    subgraph Server["Node.js — Express embutido via Angular SSR"]
        WC[WeatherController]
        GC[GeoCodingController]
        AC["AbstractController.handleError()"]
    end

    subgraph External["APIs externas"]
        VC[Visual Crossing Weather API]
        NM["Nominatim (OpenStreetMap)"]
    end

    WD --> SVC
    PS --> SVC
    FM --> SVC
    SVC -->|"GET /api/weather"| WC
    SVC -->|"GET /api/geocoding*"| GC
    WC -->|fetch| VC
    GC -->|fetch| NM
    WC --> AC
    GC --> AC
```

## Camadas de dados: do payload cru ao componente

Toda resposta de API externa passa por duas etapas antes de chegar num componente: validação (Zod) e transformação (`class-transformer`). Isso isola o resto da aplicação de mudanças/inconsistências no formato retornado pelas APIs.

```mermaid
flowchart LR
    A["Payload cru da API externa\n(ex: { data: {...} })"] --> B["zod schema.parse()\n(weatherSchema / geocodingLocationSchema)"]
    B -->|inválido| C["lança ZodError\n→ Observable de erro"]
    B -->|válido| D["plainToInstance(Dto, ...)\nexcludeExtraneousValues: true"]
    D --> E["WeatherResponseDto / GeocodingLocationDto\n(classes tipadas, campos extras descartados)"]
    E --> F[Componente Angular]
```

- Os **schemas Zod** (`core/schemas/*`) descrevem exatamente o que a API externa retorna, incluindo campos nulos (poluentes) e opcionais (campos de endereço).
- Os **DTOs** (`core/dtos/*`, com `@Expose()`) descrevem o que a aplicação realmente usa — qualquer campo não decorado é descartado no `plainToInstance`, mesmo que a API externa o retorne.

## Fluxo de carregamento inicial (SSR + hidratação)

A rota principal (`'**'`) é pré-renderada (`RenderMode.Prerender`). Isso significa que o `ngOnInit()` do dashboard roda **duas vezes**: uma no servidor (durante o SSR) e outra no navegador (durante a hidratação).

```mermaid
sequenceDiagram
    participant U as Usuário
    participant SSR as Servidor (SSR)
    participant WC as WeatherController
    participant B as Navegador (hidratado)
    participant GC as GeoCodingController

    U->>SSR: GET /
    SSR->>SSR: ngOnInit → getCurrentLocation()
    Note over SSR: navigator.geolocation não existe em Node
    SSR->>WC: GET /api/weather?search=-23.5505,-46.6333 (fallback São Paulo)
    WC-->>SSR: dados de clima
    SSR-->>U: HTML pré-renderado + TransferState (cache da resposta HTTP)
    U->>B: hidrata
    B->>B: ngOnInit roda de novo
    B->>B: geolocalização real do navegador

    alt coordenadas do navegador == fallback usado no SSR
        Note over B: provideClientHydration() reaproveita a resposta\ndo TransferState — nenhuma nova requisição de rede
    else coordenadas diferentes
        B->>WC: GET /api/weather?search=lat,lon (requisição real)
        B->>GC: GET /api/geocoding/coordinates?latitude=...&longitude=...
    end
```

> Esse comportamento (`TransferState`/`HttpTransferCache` do Angular) é transparente em produção, mas é a razão pela qual os testes E2E estubam a geolocalização com coordenadas **diferentes** do fallback padrão — veja [`TESTING.md`](TESTING.md#stub-de-geolocalização).

## Fluxo de busca por local (RF01)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant PS as PlaceSearchComponent
    participant WD as WeatherDashboardComponent
    participant GCS as GeoCodingService
    participant WS as WeatherService

    U->>PS: digita "Barueri"
    PS->>PS: debounce 400ms (RxJS)
    PS->>WD: search("Barueri")
    WD->>GCS: getPlaceBySearch("Barueri")
    GCS->>GCS: valida (zod) + filtra addresstype permitido
    GCS-->>WD: GeocodingLocationDto[]
    WD-->>PS: places()

    U->>PS: seleciona um resultado (teclado ↑↓ Enter, ou clique)
    PS->>WD: placeSelected(place)
    WD->>WS: getWeatherByLocation(lat, lon)
    WS-->>WD: WeatherResponseDto
    WD-->>U: dashboard atualizado com o novo local
```

## Atualização automática (RF04) e favoritos

```mermaid
sequenceDiagram
    participant T as interval (5 min)
    participant WD as WeatherDashboardComponent
    participant WS as WeatherService

    loop a cada 5 minutos
        T->>WD: tick
        WD->>WD: refreshCurrentWeather()
        WD->>WS: getWeatherByLocation(currentPlace.lat, currentPlace.lon)
        WS-->>WD: WeatherResponseDto
        WD-->>WD: preserva o resolvedAddress já exibido
    end
```

O polling reaproveita o `currentPlace` já resolvido (geolocalização, busca ou favorito) — não repete geocoding, só reconsulta o clima. A subscrição usa `takeUntilDestroyed()`, então é automaticamente cancelada quando o componente é destruído.

Favoritos são persistidos em `localStorage` via `FavoritesService` (client-only, não passa pelo servidor) — um `effect()` grava a lista a cada mudança do signal `favorites`.

## Tratamento de erros (RF05)

```mermaid
flowchart TD
    A["Controller (Express) faz fetch na API externa"] --> B{"response.ok?"}
    B -->|não| C["throw UpstreamWeatherApiError /\nUpstreamGeoCodingApiError"]
    B -->|sim| D["Angular recebe { data: ... }"]
    D --> E["zod schema.parse()"]
    E -->|inválido| F["ZodError → Observable de erro\n(ex: cidade não encontrada)"]
    E -->|válido| G["Dashboard atualizado normalmente"]
    C --> H["AbstractController.handleError()"]
    H --> I["JSON padronizado:\n{ statusCode, errors: [{ name, message, details }] }"]
```

Erros de campo vazio são tratados no próprio `PlaceSearchComponent` (não dispara busca para string vazia); erros de rede/cidade não encontrada chegam como falha do Observable e são exibidos ao usuário de forma amigável.

## Componentes: orquestrador vs. apresentacionais

Só o `WeatherDashboardComponent` tem estado e injeta services — todos os outros são "burros" (`@Input()`/`@Output()`, sem injeção de service):

```mermaid
flowchart TD
    WD[WeatherDashboardComponent] --> CW[CurrentWeatherComponent]
    WD --> AQ[AirQualityComponent]
    WD --> SC[SkyCycleComponent]
    WD --> WF[WeaklyForecastComponent]
    WD --> HF[HourlyForecastComponent]
    WD --> PS[PlaceSearchComponent]
    WD --> FM[FavoritesModalComponent]
```

Isso mantém a lógica de negócio (cálculo de previsão semanal/horária, ciclo dia/noite, favoritos) centralizada em `computed()`s do dashboard, e os componentes filhos puramente de apresentação — fáceis de testar isoladamente (ver [`TESTING.md`](TESTING.md)).
