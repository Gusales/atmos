import { Component, computed, inject, OnInit, signal } from "@angular/core";

import { DayDto, WeatherResponseDto } from "@/app/core/dtos/weather";
import { WeatherService } from "@/app/core/services/weather";
import { firstValueFrom } from "rxjs";
import { AirQualityComponent } from "../../components/air-quality";
import { CurrentWeatherComponent } from "../../components/current-weather";
import { SkyCycleComponent } from "../../components/sky-cicle";
import { WeaklyForecastComponent } from "../../components/weakly-forecast";
import { WeatherNamesEnum } from "../../shared/enums";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

interface WeekForecastDay {
    name: string
    weather: WeatherNamesEnum
    minTemperature: number
    maxTemperature: number
}

interface SkyCycleTimes {
    startTime: string
    endTime: string
}

function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

/**
 * A API não retorna um campo de condição já pronto (icone/descrição),
 * então o ícone é aproximado a partir de precipitação/umidade do dia.
 */
function resolveWeatherCondition(day: DayDto): WeatherNamesEnum {
    if (day.precipprob >= 70) return WeatherNamesEnum.THUNDER
    if (day.precipprob >= 40) return WeatherNamesEnum.RAIN
    if (day.precipprob >= 15) return WeatherNamesEnum.PARTLY_CLOUDY
    if (day.humidity >= 80) return WeatherNamesEnum.CLOUDY

    return WeatherNamesEnum.SUN
}

function weekdayName(dayOffset: number): string {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)

    const weekday = WEEKDAY_FORMATTER.format(date)
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

@Component({
    selector: 'app-weather-dashboard',
    templateUrl: './weather-dashboard.component.html',
    standalone: true,
    imports: [CurrentWeatherComponent, AirQualityComponent, SkyCycleComponent, WeaklyForecastComponent]
})
export class WeatherDashboardComponent implements OnInit {
    protected readonly weatherService = inject(WeatherService)
    protected readonly weather = signal<WeatherResponseDto | null>(null)

    protected readonly today = computed(() => this.weather()?.days[0] ?? null)

    protected readonly weekForecast = computed<WeekForecastDay[]>(() => {
        const days = this.weather()?.days ?? []

        return days.slice(1, 6).map((day, index) => ({
            name: index === 0 ? 'Amanhã' : weekdayName(index + 1),
            weather: resolveWeatherCondition(day),
            minTemperature: day.tempmin,
            maxTemperature: day.tempmax
        }))
    })

    /**
     * O sunrise/sunset do dia sempre vêm na ordem "nascer -> pôr". Se agora
     * (horário real) já passou do pôr do sol ou ainda não chegou o nascer,
     * estamos no período noturno: o ciclo exibido deve ir do pôr do sol de
     * hoje até o nascer do sol seguinte, não o contrário.
     */
    protected readonly skyCycleTimes = computed<SkyCycleTimes>(() => {
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

    ngOnInit(): void {
        this.getCurrentLocation()
    }

    protected async getCurrentLocation() {
        const data = await firstValueFrom(this.weatherService.getWeatherByLocation(-23.5505, -46.6333))

        this.weather.set(data)
    }

    protected resolveTodayWeatherCondition(day: DayDto): WeatherNamesEnum {
        return resolveWeatherCondition(day)
    }
}
