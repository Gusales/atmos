import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WeatherNamesEnum } from '../../shared/enums';
import { CurrentWeatherComponent } from './index';

describe('CurrentWeatherComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CurrentWeatherComponent]
        });
    });

    it('renders the bound weather data', () => {
        const fixture = TestBed.createComponent(CurrentWeatherComponent);
        fixture.componentRef.setInput('currentWeather', WeatherNamesEnum.SUN);
        fixture.componentRef.setInput('location', 'Barueri, SP');
        fixture.componentRef.setInput('currentTemperature', 24);
        fixture.componentRef.setInput('minimumTemperature', 18);
        fixture.componentRef.setInput('maximunTemperature', 27);
        fixture.componentRef.setInput('windSpeed', 12);
        fixture.componentRef.setInput('humidity', 60);
        fixture.componentRef.setInput('rainProbabilityPercent', 10);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Barueri, SP');
        expect(compiled.textContent).toContain('24');
        expect(compiled.textContent).toContain('18°');
        expect(compiled.textContent).toContain('27°');
        expect(compiled.textContent).toContain('12');
        expect(compiled.textContent).toContain('60');
        expect(compiled.textContent).toContain('10');
    });

    it('reflects isFavorite on the button and the nested star icon', () => {
        const fixture = TestBed.createComponent(CurrentWeatherComponent);
        fixture.componentRef.setInput('isFavorite', true);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(button.getAttribute('aria-label')).toBe('Remover dos favoritos');
    });

    it('shows the "add to favorites" label when isFavorite is false', () => {
        const fixture = TestBed.createComponent(CurrentWeatherComponent);
        fixture.componentRef.setInput('isFavorite', false);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('aria-label')).toBe('Adicionar aos favoritos');
    });

    it('emits favoriteToggled when the star button is clicked', () => {
        const fixture = TestBed.createComponent(CurrentWeatherComponent);
        fixture.detectChanges();

        let emitted = false;
        fixture.componentInstance.favoriteToggled.subscribe(() => (emitted = true));

        fixture.nativeElement.querySelector('button').click();

        expect(emitted).toBe(true);
    });
});
