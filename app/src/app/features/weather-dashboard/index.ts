import { Component, inject, OnInit } from "@angular/core";

import { WeatherService } from "@/app/core/services/weather";
import { firstValueFrom } from "rxjs";
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
export class WeatherDashboardComponent implements OnInit {
    protected readonly weatherService = inject(WeatherService)

    ngOnInit(): void {
        this.getCurrentLocation()
    }

    protected async getCurrentLocation() {
        const data = await firstValueFrom(this.weatherService.getWeatherByLocation(-23.5505,-46.6333))

        console.log(JSON.stringify(data))
    }
}