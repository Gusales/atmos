import { Mock } from "@test/mock";

/**
 * Payload cru (antes do zod validar/o class-transformer mapear), no mesmo
 * formato que a API de clima realmente devolve. Usado pra testar
 * `weatherSchema.parse(...)` e a transformação pra `WeatherResponseDto`.
 */
export class WeatherResponseSchemaMock extends Mock<Record<string, unknown>> {
    entity(partial: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
        return {
            queryCost: 1,
            latitude: -23.5505,
            longitude: -46.6333,
            resolvedAddress: '-23.5505,-46.6333',
            address: '-23.5505,-46.6333',
            timezone: 'America/Sao_Paulo',
            tzoffset: -3,
            days: [
                {
                    tempmax: 21,
                    tempmin: 18,
                    temp: 19.2,
                    humidity: 86.7,
                    precipprob: 100,
                    windspeed: 20.8,
                    sunrise: '05:58:10',
                    sunset: '18:02:12',
                    pm10: 10,
                    so2: 5,
                    no2: 16,
                    o3: 40,
                    co: 193,
                    hours: [
                        {
                            temp: 18.9,
                            humidity: 88.56,
                            precipprob: 0,
                            windspeed: 20.8,
                            pm10: 9,
                            so2: 9,
                            no2: 43,
                            o3: 15,
                            co: 411
                        }
                    ]
                }
            ],
            alerts: [
                {
                    event: 'Chuvas Intensas',
                    headline: 'Aviso de Chuvas Intensas. Severidade Grau: Severe',
                    ends: '2026-09-21T11:30:37',
                    endsEpoch: 1790001037,
                    onset: '2026-09-14T00:00:00',
                    onsetEpoch: 1789354800,
                    id: 'urn:oid:2.49.0.0.76.0.2026.28255.2',
                    language: 'pt',
                    link: 'https://avisos.inmet.gov.br/55710',
                    description: 'INMET publica aviso iniciando em: 14/09/2026 00:00.'
                }
            ],
            currentConditions: {
                temp: 18.9,
                humidity: 85.5,
                precipprob: 0,
                windspeed: 3.1,
                pm10: 10,
                so2: 4.3,
                no2: 15,
                o3: 47.7,
                co: 186,
                sunrise: '05:58:10',
                sunset: '18:02:12'
            },
            ...partial
        }
    }
}
