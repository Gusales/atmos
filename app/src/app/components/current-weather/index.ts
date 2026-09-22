import { Component, Input } from "@angular/core";
import { WeatherIconComponent } from "../../shared/components/ui/icons/weather-icon";
import { WeatherNamesEnum } from "../../shared/enums";

@Component({
    selector: 'app-current-weather',
    templateUrl: './current-weather.component.html',
    standalone: true,
    imports: [WeatherIconComponent]
})
export class CurrentWeatherComponent {
    @Input() currentWeather: WeatherNamesEnum = WeatherNamesEnum.SUN

    @Input() location: string = "São Paulo, SP"
    @Input() currentTemperature: number = 0
    @Input() minimumTemperature: number = 0
    @Input() maximunTemperature: number = 0
    @Input() windSpeed: number = 0
    @Input() humidity: number = 0
    @Input() rainProbabilityPercent: number = 0
}