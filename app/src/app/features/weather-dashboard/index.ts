import { Component } from "@angular/core";

import { AirQualityComponent } from "../../components/air-quality";
import { CurrentWeatherComponent } from "../../components/current-weather";
import { SkyCycleComponent } from "../../components/sky-cicle";
import { WeaklyForecastComponent } from "../../components/weakly-forecast";

@Component({
    selector: 'app-weather-dashboard',
    templateUrl: './weather-dashboard.component.html',
    standalone: true,
    imports: [CurrentWeatherComponent, AirQualityComponent, SkyCycleComponent, WeaklyForecastComponent]
})
export class WeatherDashboardComponent {}