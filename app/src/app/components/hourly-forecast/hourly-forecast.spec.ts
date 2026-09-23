import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WeatherNamesEnum } from '../../shared/enums';
import { HourlyForecastComponent } from './index';

describe('HourlyForecastComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HourlyForecastComponent]
        });
    });

    it('renders the empty state when hours is empty', () => {
        const fixture = TestBed.createComponent(HourlyForecastComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Previsão horária indisponível');
        expect(fixture.nativeElement.querySelectorAll('li[role="listitem"]').length).toBe(0);
    });

    it('renders one item per hour, with time, temperature, condition and icon', () => {
        const fixture = TestBed.createComponent(HourlyForecastComponent);
        fixture.componentInstance.hours = [
            { time: '08:00', weather: WeatherNamesEnum.SUN, temperature: 18, isNow: true },
            { time: '09:00', weather: WeatherNamesEnum.CLOUDY, temperature: 19, isNow: false }
        ];
        fixture.detectChanges();

        const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li[role="listitem"]'));
        expect(items).toHaveLength(2);

        expect(items[0].textContent).toContain('Agora');
        expect(items[0].textContent).toContain('18°');
        expect(items[0].textContent).toContain('Ensolarado');
        expect(items[0].getAttribute('aria-label')).toBe('08:00, 18 graus, ensolarado');
        expect(items[0].querySelector('app-weather-icon')).not.toBeNull();

        expect(items[1].textContent).toContain('09:00');
        expect(items[1].textContent).toContain('19°');
        expect(items[1].textContent).toContain('Nublado');
        expect(items[1].getAttribute('aria-label')).toBe('09:00, 19 graus, nublado');
    });

    it('highlights the item marked as isNow', () => {
        const fixture = TestBed.createComponent(HourlyForecastComponent);
        fixture.componentInstance.hours = [
            { time: '08:00', weather: WeatherNamesEnum.SUN, temperature: 18, isNow: true },
            { time: '09:00', weather: WeatherNamesEnum.SUN, temperature: 19, isNow: false }
        ];
        fixture.detectChanges();

        const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li[role="listitem"]'));
        expect(items[0].classList.contains('bg-white/10')).toBe(true);
        expect(items[1].classList.contains('bg-white/10')).toBe(false);
    });

    it('updates when a new hours input is received', () => {
        const fixture = TestBed.createComponent(HourlyForecastComponent);
        fixture.componentRef.setInput('hours', [{ time: '08:00', weather: WeatherNamesEnum.SUN, temperature: 18, isNow: true }]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('li[role="listitem"]').length).toBe(1);

        fixture.componentRef.setInput('hours', [
            { time: '08:00', weather: WeatherNamesEnum.SUN, temperature: 18, isNow: true },
            { time: '09:00', weather: WeatherNamesEnum.RAIN, temperature: 17, isNow: false }
        ]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('li[role="listitem"]').length).toBe(2);
    });
});
