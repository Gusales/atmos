import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AddressType, GeocodingLocationDto } from "../../dtos/geocoding";
import { geocodingLocationSchema, GeocodingLocationType, geocodingSearchSchema, GeocodingSearchType } from "../../schemas/geocoding";
import { BaseService } from "../base";

interface GeoCodingApiResponse<T> {
    data: T
}

const ALLOWED_ADDRESS_TYPES: readonly AddressType[] = ['city_district', 'city', 'state', 'suburb', 'town']

function isAllowedAddressType(addresstype: string): addresstype is AddressType {
    return (ALLOWED_ADDRESS_TYPES as readonly string[]).includes(addresstype)
}

@Injectable({
    providedIn: 'root'
})
export class GeoCodingService extends BaseService {
    private readonly path: string = '/geocoding'
    private readonly coordinatesPath: string = '/geocoding/coordinates'

    constructor(httpClient: HttpClient) {
        super(httpClient)
    }

    public getPlaceBySearch(search: string): Observable<GeocodingLocationDto[]> {
        return this.GET<GeoCodingApiResponse<unknown>>(this.path, {
            params: { search }
        }).pipe(
            map(response => this.validateSearch(response.data)),
            map(validated => this.filterByAllowedAddressType(validated)),
            map(filtered => this.transform(filtered))
        )
    }

    public getPlaceByCoordinates(latitude: number, longitude: number): Observable<GeocodingLocationDto> {
        return this.GET<GeoCodingApiResponse<unknown>>(this.coordinatesPath, {
            params: { latitude, longitude }
        }).pipe(
            map(response => this.validateLocation(response.data)),
            map(validated => this.transform(validated))
        )
    }

    private validateSearch(data: unknown): GeocodingSearchType {
        return geocodingSearchSchema.parse(data)
    }

    private filterByAllowedAddressType(data: GeocodingSearchType): GeocodingSearchType {
        return data.filter(location => isAllowedAddressType(location.addresstype))
    }

    private validateLocation(data: unknown): GeocodingLocationType {
        return geocodingLocationSchema.parse(data)
    }

    private transform(data: GeocodingSearchType): GeocodingLocationDto[]
    private transform(data: GeocodingLocationType): GeocodingLocationDto
    private transform(data: GeocodingSearchType | GeocodingLocationType): GeocodingLocationDto[] | GeocodingLocationDto {
        return plainToInstance(GeocodingLocationDto, data, { excludeExtraneousValues: true, exposeDefaultValues: true })
    }
}
