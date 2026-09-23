import { Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { GeocodingLocationDto } from "@/app/core/dtos/geocoding";
import { CurrentConditionsDto, WeatherResponseDto } from "@/app/core/dtos/weather";
import { FavoritePlace, FavoritesService } from "@/app/core/services/favorites";
import { GeoCodingService } from "@/app/core/services/geocoding";
import { GeoLocationService, IUserLocation } from "@/app/core/services/geolocation";
import { WeatherService } from "@/app/core/services/weather";
import { firstValueFrom, interval } from "rxjs";
import { AirQualityComponent } from "../../components/air-quality";
import { CurrentWeatherComponent } from "../../components/current-weather";
import { FavoritesModalComponent } from "../../components/favorites-modal";
import { HourlyForecastComponent } from "../../components/hourly-forecast";
import { PlaceSearchComponent } from "../../components/place-search";
import { SkyCycleComponent } from "../../components/sky-cicle";
import { WeaklyForecastComponent } from "../../components/weakly-forecast";
import { WeatherNamesEnum } from "../../shared/enums";
import { Place } from "../../shared/types";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
export const WEATHER_POLL_INTERVAL_MS = 5 * 60 * 1000

interface IWeekForecastDay {
    name: string
    weather: WeatherNamesEnum
    minTemperature: number
    maxTemperature: number
}

interface ISkyCycleTimes {
    startTime: string
    endTime: string
}

export interface ICurrentPlace {
    id: string
    name: string
    state: string
    latitude: number
    longitude: number
}

export function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

export interface IWeatherConditionReading {
    precipprob: number
    humidity: number
}

/**
 * A API não retorna um campo de condição já pronto (icone/descrição),
 * então o ícone é aproximado a partir de precipitação/umidade — pode
 * ser aplicado tanto a um dia inteiro (DayDto) quanto à leitura atual
 * (CurrentConditionsDto), já que ambos têm esses dois campos.
 */
export function resolveWeatherCondition(reading: IWeatherConditionReading): WeatherNamesEnum {
    if (reading.precipprob >= 70) return WeatherNamesEnum.THUNDER
    if (reading.precipprob >= 40) return WeatherNamesEnum.RAIN
    if (reading.precipprob >= 15) return WeatherNamesEnum.PARTLY_CLOUDY
    if (reading.humidity >= 80) return WeatherNamesEnum.CLOUDY

    return WeatherNamesEnum.SUN
}

export interface IHourForecast {
    time: string
    weather: WeatherNamesEnum
    temperature: number
    isNow: boolean
}

/** Normaliza o `datetime` cru da API (`"08:00:00"`) para exibição (`"08:00"`). */
export function formatHour(datetime: string): string {
    return datetime.slice(0, 5)
}

export function weekdayName(dayOffset: number): string {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)

    const weekday = WEEKDAY_FORMATTER.format(date)
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

export function toPlace(location: GeocodingLocationDto): Place {
    return {
        id: String(location.place_id),
        name: location.name,
        neighborhood: location.address.city_district ?? '',
        city: location.address.city ?? location.name,
        state: location.address.state ?? ''
    }
}

export function toCurrentPlace(location: GeocodingLocationDto): ICurrentPlace {
    return {
        id: String(location.place_id),
        name: location.name,
        state: location.address.state ?? '',
        latitude: Number(location.lat),
        longitude: Number(location.lon)
    }
}

/**
 * Formata o local exibido de acordo com o nível geográfico retornado pela
 * API de geocoding: bairro mostra cidade e UF, cidade mostra só a UF, e
 * estado mostra "BR" no lugar da UF (não há uma UF "dele mesmo").
 */
export function formatLocationAddress(location: GeocodingLocationDto): string {
    const uf = location.address['ISO3166-2-lvl4']?.split('-')[1] ?? ''

    switch (location.addresstype) {
        case 'city_district':
            return `${location.address.city_district ?? location.name}, ${location.address.city ?? ''}, ${uf}`
        case 'city':
            return `${location.address.city ?? location.name}, ${uf}`
        case 'state':
            return `${location.address.state ?? location.name}, BR`
        default:
            return location.name
    }
}

@Component({
    selector: 'app-weather-dashboard',
    templateUrl: './weather-dashboard.component.html',
    standalone: true,
    imports: [
        CurrentWeatherComponent,
        AirQualityComponent,
        SkyCycleComponent,
        WeaklyForecastComponent,
        PlaceSearchComponent,
        FavoritesModalComponent,
        HourlyForecastComponent
    ]
})
export class WeatherDashboardComponent implements OnInit {
    protected readonly weatherService = inject(WeatherService)
    protected readonly geoLocationService = inject(GeoLocationService)
    protected readonly geocodingService = inject(GeoCodingService)
    protected readonly favoritesService = inject(FavoritesService)
    protected readonly weather = signal<WeatherResponseDto | null>(null)
    private readonly defaultLocations: IUserLocation = {
        latitude: -23.5505,
        longitude: -46.6333
    }

    protected readonly today = computed(() => this.weather()?.days[0] ?? null)

    protected readonly weekForecast = computed<IWeekForecastDay[]>(() => {
        const days = this.weather()?.days ?? []

        return days.slice(1, 6).map((day, index) => ({
            name: index === 0 ? 'Amanhã' : weekdayName(index + 1),
            weather: resolveWeatherCondition(day),
            minTemperature: day.tempmin,
            maxTemperature: day.tempmax
        }))
    })

    /**
     * Junta as horas restantes do dia atual (a partir da hora corrente,
     * inclusive) com o início do dia seguinte quando faltar pra completar 12
     * itens — evita que o card fique quase vazio à noite.
     */
    protected readonly hourlyForecast = computed<IHourForecast[]>(() => {
        const days = this.weather()?.days ?? []
        const today = days[0]
        if (!today) return []

        const currentHour = new Date().getHours()
        const todayHours = today.hours.slice(currentHour)

        const remaining = 12 - todayHours.length
        const nextDayHours = remaining > 0 ? (days[1]?.hours ?? []).slice(0, remaining) : []

        return [...todayHours, ...nextDayHours]
            .slice(0, 12)
            .map((hour, index) => ({
                time: formatHour(hour.datetime),
                weather: resolveWeatherCondition(hour),
                temperature: Math.round(hour.temp),
                isNow: index === 0
            }))
    })

    /**
     * O sunrise/sunset do dia sempre vêm na ordem "nascer -> pôr". Se agora
     * (horário real) já passou do pôr do sol ou ainda não chegou o nascer,
     * estamos no período noturno: o ciclo exibido deve ir do pôr do sol de
     * hoje até o nascer do sol seguinte, não o contrário.
     */
    protected readonly skyCycleTimes = computed<ISkyCycleTimes>(() => {
        const day = this.today()
        if (!day) return { startTime: '06:00', endTime: '18:00' }

        const now = new Date()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const sunriseMinutes = parseTimeToMinutes(day.sunrise)
        const sunsetMinutes = parseTimeToMinutes(day.sunset)

        const isDaytime = nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes

        return isDaytime
            ? { startTime: day.sunrise, endTime: day.sunset }
            : { startTime: day.sunset, endTime: day.sunrise }
    })

    constructor() {
        const destroyRef = inject(DestroyRef)

        interval(WEATHER_POLL_INTERVAL_MS).pipe(
            takeUntilDestroyed(destroyRef)
        ).subscribe(() => this.refreshCurrentWeather())
    }

    ngOnInit(): void {
        this.getCurrentLocation()
    }

    /**
     * Reconsulta o clima do local atual sem repetir a geolocalização/geocoding
     * — só troca os dados do `weather`, preservando o endereço já resolvido.
     */
    protected async refreshCurrentWeather(): Promise<void> {
        const current = this.currentPlace()
        if (!current) return

        const data = await firstValueFrom(
            this.weatherService.getWeatherByLocation(current.latitude, current.longitude)
        )

        data.resolvedAddress = this.weather()?.resolvedAddress ?? data.resolvedAddress
        this.weather.set(data)
    }

    protected async getCurrentLocation() {
        let data: WeatherResponseDto;

        try {
            const { latitude, longitude } = await this.geoLocationService.getCoordinates()
            const [weatherResponse, geocodingResponse] = await Promise.all([
                firstValueFrom(this.weatherService.getWeatherByLocation(latitude, longitude)),
                firstValueFrom(this.geocodingService.getPlaceByCoordinates(latitude, longitude))
            ])

            data = weatherResponse
            data.resolvedAddress = formatLocationAddress(geocodingResponse)
            this.currentPlace.set(toCurrentPlace(geocodingResponse))

        } catch (error) {
            data = await firstValueFrom(this.weatherService.getWeatherByLocation(this.defaultLocations.latitude, this.defaultLocations.longitude))
            data.resolvedAddress = "São Paulo, SP"
            this.currentPlace.set({
                id: "current",
                name: "São Paulo",
                state: "SP",
                latitude: this.defaultLocations.latitude,
                longitude: this.defaultLocations.longitude
            })
        }

        this.weather.set(data)
    }

    protected resolveCurrentWeatherCondition(currentConditions: CurrentConditionsDto): WeatherNamesEnum {
        return resolveWeatherCondition(currentConditions)
    }

    protected places = signal<Place[]>([])
    protected isSearching = signal(false)

    /** Guarda os DTOs da última busca (com lat/lon) pra achar as coordenadas ao selecionar um lugar. */
    private lastSearchResults = signal<GeocodingLocationDto[]>([])

    protected async onSearch(query: string): Promise<void> {
        this.isSearching.set(true)

        try {
            const results = await firstValueFrom(this.geocodingService.getPlaceBySearch(query))

            this.lastSearchResults.set(results)
            this.places.set(results.map(location => toPlace(location)))
        } finally {
            this.isSearching.set(false)
        }
    }

    protected async onPlaceSelected(place: Place): Promise<void> {
        const location = this.lastSearchResults().find(result => String(result.place_id) === place.id)
        if (!location) return

        const data = await firstValueFrom(
            this.weatherService.getWeatherByLocation(Number(location.lat), Number(location.lon))
        )

        data.resolvedAddress = formatLocationAddress(location)
        this.currentPlace.set(toCurrentPlace(location))
        this.weather.set(data)
    }

    protected currentPlace = signal<ICurrentPlace | null>(null)
    protected isFavoritesModalOpen = signal(false)

    protected readonly isCurrentFavorite = computed(() => {
        const current = this.currentPlace()
        return !!current && this.favoritesService.isFavorite(current.id)
    })

    protected openFavoritesModal(): void {
        this.isFavoritesModalOpen.set(true)
    }

    protected closeFavoritesModal(): void {
        this.isFavoritesModalOpen.set(false)
    }

    protected toggleCurrentFavorite(): void {
        const current = this.currentPlace()
        const data = this.weather()
        const today = this.today()
        if (!current || !data || !today) return

        this.favoritesService.toggle({
            id: current.id,
            name: current.name,
            state: current.state,
            latitude: current.latitude,
            longitude: current.longitude,
            weatherIcon: this.resolveCurrentWeatherCondition(data.currentConditions),
            currentTemperature: Math.round(data.currentConditions.temp),
            maxTemperature: Math.round(today.tempmax),
            minTemperature: Math.round(today.tempmin)
        })
    }

    protected async onFavoriteSelected(place: FavoritePlace): Promise<void> {
        const data = await firstValueFrom(
            this.weatherService.getWeatherByLocation(place.latitude, place.longitude)
        )

        data.resolvedAddress = `${place.name}, ${place.state}`
        this.currentPlace.set({
            id: place.id,
            name: place.name,
            state: place.state,
            latitude: place.latitude,
            longitude: place.longitude
        })
        this.weather.set(data)
    }

    protected onFavoriteRemoved(id: string): void {
        this.favoritesService.remove(id)
    }
}
