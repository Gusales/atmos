import { Mock } from "@test/mock";

/**
 * Payload cru (antes do zod validar/o class-transformer mapear), no mesmo
 * formato que a API de geocoding (Nominatim) realmente devolve. Usado pra
 * testar `geocodingLocationSchema`/`geocodingSearchSchema.parse(...)` e a
 * transformação pra `GeocodingLocationDto`. Pra montar um array (formato do
 * `geocodingSearchSchema`), use `entities(length)`.
 */
export class GeocodingLocationSchemaMock extends Mock<Record<string, unknown>> {
    entity(partial: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
        return {
            place_id: 8934352,
            licence: 'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
            osm_type: 'relation',
            osm_id: 298021,
            lat: '-23.5112184',
            lon: '-46.8764612',
            class: 'boundary',
            type: 'administrative',
            place_rank: 16,
            importance: 0.5766687211947501,
            addresstype: 'city',
            name: 'Barueri',
            display_name: 'Barueri, São Paulo, Região Sudeste, Brasil',
            address: {
                city: 'Barueri',
                state: 'São Paulo',
                'ISO3166-2-lvl4': 'BR-SP',
                region: 'Região Sudeste',
                country: 'Brasil',
                country_code: 'br'
            },
            boundingbox: ['-23.5536510', '-23.4703789', '-46.9663017', '-46.7986840'],
            ...partial
        }
    }
}
