# Integrações com APIs Externas

O Atmos consome duas APIs externas, sempre através do backend Express embutido (`src/app/server/`) — o navegador nunca as chama diretamente, e as chaves de API nunca são expostas ao cliente. Ver [`ARCHITECTURE.md`](ARCHITECTURE.md) para o fluxo completo.

## Visual Crossing Weather API

Fonte dos dados de clima: condições atuais, previsão horária e previsão semanal.

- **Documentação**: https://www.visualcrossing.com/resources/documentation/weather-api/
- **Autenticação**: chave de API (`WEATHER_API_KEY`), enviada como query param `key`.
- **Endpoint usado**: Timeline Weather API, `GET /VisualCrossingWebServices/rest/services/timeline/{location}`.

### Como o backend monta a requisição

`WeatherController.buildWeatherApiUrl()` (`src/app/server/controllers/weather.controller.ts`):

```
{WEATHER_API_URL}/{search}
  ?lang=pt
  &unitGroup=metric
  &key={WEATHER_API_KEY}
  &elements=add:pm10,so2,no2,o3,co,temp,tempmax,tempmin,windspeed,humidity,precipprob,sunrise,sunset,datetime
```

> **Atenção com o parâmetro `elements`**: ele **restringe** os campos retornados pela API às datas/horas — não é cumulativo com os campos padrão. Qualquer campo novo que a aplicação precise consumir (ex: `datetime`, adicionado para a previsão horária) precisa ser explicitamente incluído aqui, senão a API simplesmente omite o campo do payload, e a validação Zod rejeita a resposta.

### Exemplo de uso (através do nosso backend)

```bash
curl "http://localhost:4000/api/weather?search=Barueri"
```

```bash
# ou por coordenadas
curl "http://localhost:4000/api/weather?search=-23.5112,-46.8765"
```

### Resposta (resumida)

```json
{
  "data": {
    "queryCost": 1,
    "latitude": -23.5112,
    "longitude": -46.8765,
    "resolvedAddress": "Barueri, SP, Brazil",
    "timezone": "America/Sao_Paulo",
    "days": [
      {
        "datetime": "2026-09-23",
        "tempmax": 27,
        "tempmin": 18,
        "temp": 22.4,
        "humidity": 68,
        "precipprob": 10,
        "sunrise": "05:58:10",
        "sunset": "18:02:12",
        "pm10": 12, "so2": 3, "no2": 14, "o3": 38, "co": 175,
        "hours": [
          { "datetime": "00:00:00", "temp": 18.9, "humidity": 88.5, "precipprob": 0, "pm10": 9, "so2": 9, "no2": 43, "o3": 15, "co": 411 }
        ]
      }
    ],
    "currentConditions": { "temp": 22.4, "humidity": 68, "precipprob": 10, "sunrise": "05:58:10", "sunset": "18:02:12" }
  }
}
```

O `data` é repassado como a API externa devolveu, sem transformação no servidor — a validação (Zod) e a transformação (`class-transformer` → `WeatherResponseDto`) acontecem no cliente, em `WeatherService`.

### Erros

Se a API externa responder com status de erro, o backend lança `UpstreamWeatherApiError` (`statusCode` = o status da API externa, `details` = corpo cru da resposta), normalizado por `AbstractController.handleError()`.

---

## Nominatim (OpenStreetMap)

Fonte dos dados de geocoding: busca por local (autocomplete) e geocoding reverso (coordenadas → endereço, usado para localizar o usuário automaticamente).

- **Documentação**: https://nominatim.org/release-docs/latest/api/Overview/
- **Autenticação**: nenhuma — é um serviço público e gratuito.

> [!IMPORTANT]
> **Atribuição obrigatória.** O uso da Nominatim exige atribuição visível aos dados do OpenStreetMap ([Política de Uso Aceitável](https://operations.osmfoundation.org/policies/nominatim/)). Toda resposta da API já inclui o campo de licença abaixo, e ele deve ser preservado/exibido conforme a política:
>
> ```json
> "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright"
> ```
>
> — **Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright**

### Como o backend monta a requisição

`GeoCodingController` (`src/app/server/controllers/geocoding.controller.ts`) define os parâmetros padrão em `setDefaultQueryParams()`:

```
?format=json
&accept-language=pt-BR
&limit=10
&addressdetails=1
&featureType=settlement
```

Além disso, envia um `User-Agent` identificando a aplicação em todas as chamadas (`getDefaultHeaders()`, `AbstractController`), conforme exigido pela política de uso da Nominatim.

#### Busca por texto (`/search`)

Usada pelo autocomplete (RF01). O termo de busca tem os acentos removidos antes de enviar (`stripDiacritics`) — o Nominatim não casa palavras acentuadas com o nome de assentamentos indexados (ex: "Carapicuíba" não encontra a cidade "Carapicuíba", só ruas com nome parecido); sem acento, ele encontra e ainda devolve o resultado acentuado normalmente.

```
GET {GEOCODING_API_URL}/search?q={termo sem acentos}&format=json&...
```

```bash
curl "http://localhost:4000/api/geocoding?search=Barueri"
```

```json
{
  "data": [
    {
      "place_id": 8934352,
      "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
      "lat": "-23.5112184",
      "lon": "-46.8764612",
      "addresstype": "city",
      "name": "Barueri",
      "address": {
        "city": "Barueri",
        "state": "São Paulo",
        "ISO3166-2-lvl4": "BR-SP",
        "region": "Região Sudeste",
        "country": "Brasil",
        "country_code": "br"
      }
    }
  ]
}
```

O cliente (`GeoCodingService.getPlaceBySearch`) filtra os resultados para manter só `addresstype` úteis pra busca de cidade (`city_district`, `city`, `state`, `suburb`, `town`) — descarta ruas, estabelecimentos etc. que o Nominatim também pode retornar.

#### Geocoding reverso (`/reverse`)

Usado para resolver o nome do local a partir da geolocalização do navegador.

```
GET {GEOCODING_API_URL}/reverse?lat={lat}&lon={lon}&format=json&...
```

```bash
curl "http://localhost:4000/api/geocoding/coordinates?latitude=-23.5505&longitude=-46.6333"
```

Resposta no mesmo formato de um item da busca por texto (objeto único, não array).

### Erros

Mesma estratégia da Visual Crossing: falha upstream vira `UpstreamGeoCodingApiError`, normalizado por `AbstractController.handleError()`.

---

## Referência rápida: endpoints do próprio backend

| Endpoint | Proxy para | Uso |
| :--- | :--- | :--- |
| `GET /api/weather?search=` | Visual Crossing Timeline API | Clima atual, horário e semanal |
| `GET /api/geocoding?search=` | Nominatim `/search` | Autocomplete de busca (RF01) |
| `GET /api/geocoding/coordinates?latitude=&longitude=` | Nominatim `/reverse` | Localização automática do usuário |

Ver [`ARCHITECTURE.md`](ARCHITECTURE.md) para o fluxo completo de dados, e [`TESTING.md`](TESTING.md) para como essas chamadas são mockadas nos testes (unitários e E2E) sem depender de rede real ou chaves de API.
