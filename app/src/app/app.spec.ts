import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { WeatherResponseMock } from '@/app/core/dtos/weather';
import { GeoCodingService } from '@/app/core/services/geocoding';
import { GeoLocationService } from '@/app/core/services/geolocation';
import { WeatherService } from '@/app/core/services/weather';
import { WeatherDashboardComponent } from './features/weather-dashboard';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    vi.spyOn(TestBed.inject(GeoLocationService), 'getCoordinates').mockRejectedValue(new Error('denied'));
    vi.spyOn(TestBed.inject(WeatherService), 'getWeatherByLocation').mockReturnValue(of(new WeatherResponseMock().entity()));
    vi.spyOn(TestBed.inject(GeoCodingService), 'getPlaceByCoordinates').mockReturnValue(of());
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the weather dashboard once the current location resolves', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const dashboard = fixture.debugElement.query(By.directive(WeatherDashboardComponent)).componentInstance as WeatherDashboardComponent;
    await dashboard['getCurrentLocation']();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-weather-dashboard')).not.toBeNull();
    expect(compiled.querySelector('app-current-weather')).not.toBeNull();
  });
});
