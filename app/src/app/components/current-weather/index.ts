import { Component, Input } from "@angular/core";
import { WeatherNamesEnum } from "../../shared/enums";


const alternativeTexts = {
    clouds: 'Ícone de tempo nublado',
    sun: 'Ícone de tempo ensolarado',
    'clouds-rain': 'Ícone de tempo chuvoso',
    'clouds-thunder': 'Ícone de tempo tempestuoso',
    'clouds-sun': 'Ícone de tempo parcialmente nublado, com sol e nuvens'
} as const

const baseIconPath = (iconName: keyof typeof alternativeTexts) => `/assets/svg/${iconName}.svg`

const baseIconAlt = (iconName: keyof typeof alternativeTexts) => {
    return alternativeTexts[iconName]
}

@Component({
    selector: 'app-current-weather',
    templateUrl: './current-weather.component.html',
    standalone: true
})
export class CurrentWeatherComponent {
    @Input() protected readonly currentWeather: WeatherNamesEnum = WeatherNamesEnum.SUN

    @Input() protected readonly city: string = "São Paulo, SP"
    @Input() protected readonly currentTemperature: number = 0
    @Input() protected readonly minimumTemperature: number = 0
    @Input() protected readonly maximunTemperature: number = 0
    @Input() protected readonly windSpeed: number = 0
    @Input() protected readonly humidity: number = 0
    @Input() protected readonly rainProbabilityPercent: number = 0

    protected get getCurrentWeatherIcon() {
        return baseIconPath(this.resolveWeatherNames(this.currentWeather))
    }

    protected get getCurrentWeatherIconAlt() {
        return baseIconAlt(this.resolveWeatherNames(this.currentWeather))
    }

    private resolveWeatherNames(currentWeather: WeatherNamesEnum): keyof typeof alternativeTexts {
        switch (currentWeather) {
            case WeatherNamesEnum.SUN:
                return 'sun'
            case WeatherNamesEnum.CLOUDY:
                return 'clouds'
            case WeatherNamesEnum.PARTLY_CLOUDY:
                return 'clouds-sun'
            case WeatherNamesEnum.RAIN:
                return 'clouds-sun'
            case WeatherNamesEnum.THUNDER:
                return 'clouds-thunder'
            default:
                return 'sun'
        }
    }

}