import { Expose, Type } from "class-transformer";

export class HourDto {
    @Expose() temp: number = 0
    @Expose() humidity: number = 0
    @Expose() precipprob: number = 0
    @Expose() windspeed: number = 0
    @Expose() pm10: number | null = null
    @Expose() so2: number | null = null
    @Expose() no2: number | null = null
    @Expose() o3: number | null = null
    @Expose() co: number | null = null

    constructor(partial: Partial<HourDto> = {}) {
        Object.assign(this, partial)
    }
}

export class DayDto {
    @Expose() tempmax: number = 0
    @Expose() tempmin: number = 0
    @Expose() temp: number = 0
    @Expose() humidity: number = 0
    @Expose() precipprob: number = 0
    @Expose() windspeed: number = 0
    @Expose() sunrise: string = ''
    @Expose() sunset: string = ''
    @Expose() pm10: number | null = null
    @Expose() so2: number | null = null
    @Expose() no2: number | null = null
    @Expose() o3: number | null = null
    @Expose() co: number | null = null

    @Expose()
    @Type(() => HourDto)
    hours: HourDto[] = []

    constructor(partial: Partial<DayDto> = {}) {
        Object.assign(this, partial)
    }
}

export class AlertDto {
    @Expose() event: string = ''
    @Expose() headline: string = ''
    @Expose() ends: string = ''
    @Expose() endsEpoch: number = 0
    @Expose() onset: string = ''
    @Expose() onsetEpoch: number = 0
    @Expose() id: string = ''
    @Expose() language: string = ''
    @Expose() link: string = ''
    @Expose() description: string = ''

    constructor(partial: Partial<AlertDto> = {}) {
        Object.assign(this, partial)
    }
}

export class CurrentConditionsDto {
    @Expose() temp: number = 0
    @Expose() humidity: number = 0
    @Expose() precipprob: number = 0
    @Expose() windspeed: number = 0
    @Expose() pm10: number | null = null
    @Expose() so2: number | null = null
    @Expose() no2: number | null = null
    @Expose() o3: number | null = null
    @Expose() co: number | null = null
    @Expose() sunrise: string = ''
    @Expose() sunset: string = ''

    constructor(partial: Partial<CurrentConditionsDto> = {}) {
        Object.assign(this, partial)
    }
}

export class WeatherResponseDto {
    @Expose() queryCost: number = 0
    @Expose() latitude: number = 0
    @Expose() longitude: number = 0
    @Expose() resolvedAddress: string = ''
    @Expose() address: string = ''
    @Expose() timezone: string = ''
    @Expose() tzoffset: number = 0

    @Expose()
    @Type(() => DayDto)
    days: DayDto[] = []

    @Expose()
    @Type(() => AlertDto)
    alerts: AlertDto[] = []

    @Expose()
    @Type(() => CurrentConditionsDto)
    currentConditions: CurrentConditionsDto = new CurrentConditionsDto()

    constructor(partial: Partial<WeatherResponseDto> = {}) {
        Object.assign(this, partial)
    }
}
