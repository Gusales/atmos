import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AirQualityComponent } from './components/air-quality';
import { CurrentWeatherComponent } from './components/current-weather';
import { SkyCycleComponent } from './components/sky-cicle';
import { WeaklyForecastComponent } from './components/weakly-forecast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CurrentWeatherComponent, AirQualityComponent, SkyCycleComponent, WeaklyForecastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
