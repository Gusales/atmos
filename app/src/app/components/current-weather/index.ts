import { Component, EventEmitter, Input, Output } from "@angular/core";
import { StarIconComponent } from "../../shared/components/ui/icons/star-icon";
import { WeatherIconComponent } from "../../shared/components/ui/icons/weather-icon";
import { WeatherNamesEnum } from "../../shared/enums";

@Component({
    selector: 'app-current-weather',
    templateUrl: './current-weather.component.html',
    standalone: true,
    imports: [WeatherIconComponent, StarIconComponent]
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

    /** Controlado por fora: o dashboard é quem sabe se o local atual está na lista de favoritos. */
    @Input() isFavorite: boolean = false
    @Output() favoriteToggled = new EventEmitter<void>()
}