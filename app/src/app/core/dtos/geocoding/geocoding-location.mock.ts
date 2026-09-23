import { Mock } from "@test/mock";
import { AddressDto, GeocodingLocationDto } from "./geocoding-location.dto";

export class GeocodingLocationMock extends Mock<GeocodingLocationDto> {
    entity(partial: Partial<GeocodingLocationDto> = {}): GeocodingLocationDto {
        return new GeocodingLocationDto({
            place_id: 8934352,
            licence: 'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
            lat: '-23.5112184',
            lon: '-46.8764612',
            addresstype: 'city',
            name: 'Barueri',
            address: new AddressDto({
                city: 'Barueri',
                state: 'São Paulo',
                'ISO3166-2-lvl4': 'BR-SP',
                region: 'Região Sudeste',
                country: 'Brasil',
                country_code: 'br'
            }),
            ...partial
        })
    }
}
