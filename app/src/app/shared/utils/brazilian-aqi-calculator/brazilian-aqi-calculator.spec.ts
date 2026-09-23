import { describe, expect, it } from 'vitest';
import { BrazilianAqiCalculator } from './brazilian-aqi-calculator';

describe('BrazilianAqiCalculator', () => {
    describe('convertCoToPpm', () => {
        it('returns null for null/undefined input', () => {
            expect(BrazilianAqiCalculator.convertCoToPpm(null)).toBeNull();
            expect(BrazilianAqiCalculator.convertCoToPpm(undefined)).toBeNull();
        });

        it('converts µg/m³ to ppm using the 1145 factor', () => {
            expect(BrazilianAqiCalculator.convertCoToPpm(1145)).toBe(1);
            expect(BrazilianAqiCalculator.convertCoToPpm(2290)).toBe(2);
        });
    });

    describe('calculateSubIndex', () => {
        it('returns null when concentration is null/undefined', () => {
            expect(BrazilianAqiCalculator.calculateSubIndex('pm10', null)).toBeNull();
            expect(BrazilianAqiCalculator.calculateSubIndex('pm10', undefined)).toBeNull();
        });

        it('interpolates within a breakpoint range', () => {
            // pm10 0-45 -> index 0-50: 22.5 fica no meio da faixa -> índice 25
            expect(BrazilianAqiCalculator.calculateSubIndex('pm10', 22.5)).toBe(25);
        });

        it('clamps to the last range when concentration exceeds every breakpoint', () => {
            // pm10 acima de 600 (a última faixa vai até 600) ainda extrapola pela última faixa
            expect(BrazilianAqiCalculator.calculateSubIndex('pm10', 700)).toBe(329);
        });

        it('rounds the interpolated value', () => {
            // so2 0-40 -> index 0-50: 10 -> 12.5 -> arredonda pra 13
            expect(BrazilianAqiCalculator.calculateSubIndex('so2', 10)).toBe(13);
        });
    });

    describe('classify', () => {
        it('returns "Indisponível" for a null index', () => {
            expect(BrazilianAqiCalculator.classify(null)).toEqual({ name: 'Indisponível' });
        });

        it.each([
            [0, 'Boa'],
            [50, 'Boa'],
            [51, 'Moderada'],
            [100, 'Moderada'],
            [101, 'Ruim'],
            [150, 'Ruim'],
            [151, 'Muito ruim'],
            [200, 'Muito ruim'],
            [201, 'Péssima'],
            [500, 'Péssima'],
        ])('classifies index %i as "%s"', (index, name) => {
            expect(BrazilianAqiCalculator.classify(index)).toEqual({ name });
        });
    });

    describe('calculate', () => {
        it('returns null index/criticalPollutant and "Indisponível" when every reading is missing', () => {
            const result = BrazilianAqiCalculator.calculate({});

            expect(result.index).toBeNull();
            expect(result.criticalPollutant).toBeNull();
            expect(result.name).toBe('Indisponível');
            expect(result.subIndices).toEqual({
                pm10: null,
                so2: null,
                no2: null,
                o3: null,
                co: null,
            });
        });

        it('picks the pollutant with the highest sub-index as the critical one', () => {
            // Mesmos valores do exemplo comentado no arquivo fonte.
            const result = BrazilianAqiCalculator.calculate({
                pm10: 26.0,
                so2: 10.0,
                no2: 25.0,
                o3: 95.0,
                co: 304.0,
            });

            expect(result.criticalPollutant).toBe('o3');
            expect(result.index).toBe(48);
            expect(result.name).toBe('Boa');
        });

        it('ignores missing pollutants when picking the maximum', () => {
            const result = BrazilianAqiCalculator.calculate({ pm10: 700 });

            expect(result.criticalPollutant).toBe('pm10');
            expect(result.index).toBe(329);
            expect(result.name).toBe('Péssima');
            expect(result.subIndices.so2).toBeNull();
        });
    });
});
