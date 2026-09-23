import { Component, Input } from "@angular/core";
import { WeatherIconComponent } from "../../shared/components/ui/icons/weather-icon";
import { WeatherNamesEnum, weatherNameLabels } from "../../shared/enums";

interface IHourForecast {
    time: string
    weather: WeatherNamesEnum
    temperature: number
    isNow: boolean
}

@Component({
    selector: 'app-hourly-forecast',
    templateUrl: './hourly-forecast.component.html',
    standalone: true,
    imports: [WeatherIconComponent]
})
export class HourlyForecastComponent {
    @Input() hours: IHourForecast[] = []

    protected readonly weatherNameLabels = weatherNameLabels

    protected ariaLabelFor(hour: IHourForecast): string {
        return `${hour.time}, ${hour.temperature} graus, ${weatherNameLabels[hour.weather].toLowerCase()}`
    }
}
