import { Component, Input } from "@angular/core";
import { WeatherIconComponent } from "../../shared/components/ui/icons/weather-icon";
import { WeatherNamesEnum } from "../../shared/enums";

interface IWeatherDay {
    name: string
    weather: WeatherNamesEnum
    minTemperature: number
    maxTemperature: number
}

@Component({
    selector: 'app-weakly-forecast',
    templateUrl: './weakly-forecast.component.html',
    standalone: true,
    imports: [WeatherIconComponent]
})
export class WeaklyForecastComponent {
    @Input() weatherDays: IWeatherDay[] = []
}