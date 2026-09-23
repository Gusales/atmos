import { Expose, Type } from "class-transformer";

export type AddressType = 'city_district' | 'city' | 'state' | 'suburb' | 'town'

export class AddressDto {
    @Expose() city: string | null = null
    @Expose() city_district: string | null = null
    @Expose() state: string | null = null
    @Expose() 'ISO3166-2-lvl4': string | null = null
    @Expose() region: string | null = null
    @Expose() country: string | null = null
    @Expose() country_code: string | null = null

    constructor(partial: Partial<AddressDto> = {}) {
        Object.assign(this, partial)
    }
}

export class GeocodingLocationDto {
    @Expose() place_id: number = 0
    @Expose() licence: string = ''
    @Expose() lat: string = ''
    @Expose() lon: string = ''
    @Expose() addresstype: AddressType = 'city'
    @Expose() name: string = ''

    @Expose()
    @Type(() => AddressDto)
    address: AddressDto = new AddressDto()

    constructor(partial: Partial<GeocodingLocationDto> = {}) {
        Object.assign(this, partial)
    }
}
