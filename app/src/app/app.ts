import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AirQualityComponent } from './components/air-quality';
import { CurrentWeatherComponent } from './components/current-weather';
import { SunScheduleComponent } from './components/sun-schedule';
import { WeaklyForecastComponent } from './components/weakly-forecast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CurrentWeatherComponent, AirQualityComponent, SunScheduleComponent, WeaklyForecastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
