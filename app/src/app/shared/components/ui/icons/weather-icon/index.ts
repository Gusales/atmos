import { Component, Input } from "@angular/core";

import { alternativeTexts } from "../../../../constants";
import { WeatherNamesEnum } from "../../../../enums";
import { IconNameType } from "../../../../types";

@Component({
    selector: 'app-weather-icon',
    templateUrl: './weather-icon.component.html',
    standalone: true
})
export class WeatherIconComponent {
    @Input({ required: true }) name!: WeatherNamesEnum
    @Input('class') className: string = ''

    private static resolveIconName(weather: WeatherNamesEnum): IconNameType {
        switch (weather) {
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

    protected get iconName(): IconNameType {
        return WeatherIconComponent.resolveIconName(this.name)
    }

    protected get iconPath(): string {
        return `/assets/svg/${this.iconName}.svg`
    }

    protected get iconAlt(): string {
        return alternativeTexts[this.iconName]
    }
}