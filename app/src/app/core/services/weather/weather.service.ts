import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { WeatherResponseDto } from "../../dtos/weather";
import { weatherSchema, WeatherType } from "../../schemas/weather";
import { BaseService } from "../base";

interface WeatherApiResponse {
    data: unknown
}

@Injectable({ providedIn: 'root' })
export class WeatherService extends BaseService {
    private readonly path: string = '/weather'

    constructor(httpClient: HttpClient) {
        super(httpClient)
    }

    public getWeatherByLocation(latitude: number, longitude: number): Observable<WeatherResponseDto> {
        return this.getWeatherBySearch(`${latitude},${longitude}`)
    }

    public getWeatherBySearch(search: string): Observable<WeatherResponseDto> {
        return this.GET<WeatherApiResponse>(this.path, {
            params: {
                search
            }
        }).pipe(
            map(response => this.validate(response.data)),
            map(validated => this.transform(validated))
        )
    }

    private validate(data: unknown): WeatherType {
        return weatherSchema.parse(data)
    }

    private transform(data: WeatherType): WeatherResponseDto {
        return plainToInstance(WeatherResponseDto, data, { excludeExtraneousValues: true, exposeDefaultValues: true })
    }
}
