import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AirQualityComponent } from './index';

describe('AirQualityComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AirQualityComponent]
        });
    });

    it('renders the overall IQAr index/qualification and each pollutant reading', () => {
        const fixture = TestBed.createComponent(AirQualityComponent);
        const component = fixture.componentInstance;
        fixture.componentRef.setInput('pm10', 26.0);
        fixture.componentRef.setInput('so2', 10.0);
        fixture.componentRef.setInput('no2', 25.0);
        fixture.componentRef.setInput('o3', 95.0);
        fixture.componentRef.setInput('co', 304.0);
        fixture.detectChanges();

        // Mesmos valores/resultado do exemplo comentado em BrazilianAqiCalculator.
        expect((component as any).airQualityIndex).toBe(48);
        expect((component as any).airQualityQualification).toBe('Boa');
        expect((component as any).airQualityCriticalPollutant).toBe('o3');

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Boa');
        expect(compiled.textContent).toContain('48');
        expect(compiled.textContent).toContain('26');
        expect(compiled.textContent).toContain('304');
    });

    it('maps the qualification name to the matching color class', () => {
        const fixture = TestBed.createComponent(AirQualityComponent);
        const component = fixture.componentInstance;
        // pm10 muito alto isolado -> índice geral "Péssima"
        fixture.componentRef.setInput('pm10', 700);
        fixture.detectChanges();

        expect((component as any).airQualityQualification).toBe('Péssima');

        const qualificationEl = fixture.nativeElement.querySelector('h3');
        expect(qualificationEl.className).toContain('text-critical');
    });

    it('colors each pollutant independently based on its own sub-index', () => {
        const fixture = TestBed.createComponent(AirQualityComponent);
        const component = fixture.componentInstance;
        // pm10 baixo (Boa) e so2 extremamente alto (Péssima) ao mesmo tempo.
        fixture.componentRef.setInput('pm10', 10);
        fixture.componentRef.setInput('so2', 2000);
        fixture.detectChanges();

        expect((component as any).pollutantColorClass('pm10')).toBe('text-accent');
        expect((component as any).pollutantColorClass('so2')).toBe('text-critical');
    });
});
