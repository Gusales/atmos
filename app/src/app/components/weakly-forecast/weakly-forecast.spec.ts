import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WeatherNamesEnum } from '../../shared/enums';
import { WeaklyForecastComponent } from './index';

describe('WeaklyForecastComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [WeaklyForecastComponent]
        });
    });

    it('renders nothing when weatherDays is empty', () => {
        const fixture = TestBed.createComponent(WeaklyForecastComponent);
        fixture.detectChanges();

        const headers = fixture.nativeElement.querySelectorAll('h2');
        expect(headers.length).toBe(0);
    });

    it('renders one entry per day in weatherDays, in order', () => {
        const fixture = TestBed.createComponent(WeaklyForecastComponent);
        fixture.componentRef.setInput('weatherDays', [
            { name: 'Amanhã', weather: WeatherNamesEnum.SUN, minTemperature: 16, maxTemperature: 21 },
            { name: 'Terça', weather: WeatherNamesEnum.CLOUDY, minTemperature: 14, maxTemperature: 20 }
        ]);
        fixture.detectChanges();

        const headers: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('h2'));
        expect(headers.map(h => h.textContent?.trim())).toEqual(['Amanhã', 'Terça']);

        const icons = fixture.nativeElement.querySelectorAll('app-weather-icon');
        expect(icons.length).toBe(2);
    });

    it('renders each day\'s own min/max temperature instead of a fixed value', () => {
        const fixture = TestBed.createComponent(WeaklyForecastComponent);
        fixture.componentRef.setInput('weatherDays', [
            { name: 'Amanhã', weather: WeatherNamesEnum.SUN, minTemperature: 16, maxTemperature: 21 },
            { name: 'Terça', weather: WeatherNamesEnum.CLOUDY, minTemperature: 5, maxTemperature: 9 }
        ]);
        fixture.detectChanges();

        const days: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('div.flex.flex-col'));
        expect(days[0].textContent).toContain('21°');
        expect(days[0].textContent).toContain('16°');
        expect(days[1].textContent).toContain('9°');
        expect(days[1].textContent).toContain('5°');
    });
});
