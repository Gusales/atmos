import { describe, expect, it } from 'vitest';
import { WeatherResponseSchemaMock } from './weather-response.schema.mock';
import { weatherSchema } from './weather.schema';

describe('weatherSchema', () => {
    it('parses a valid raw API payload', () => {
        const raw = new WeatherResponseSchemaMock().entity();

        const result = weatherSchema.parse(raw);

        expect(result.queryCost).toBe(1);
        expect(result.latitude).toBe(-23.5505);
        expect(result.days).toHaveLength(1);
        expect(result.days[0].hours).toHaveLength(1);
        expect(result.days[0].hours[0].datetime).toBe('08:00:00');
        expect(result.alerts).toHaveLength(1);
        expect(result.currentConditions.temp).toBe(18.9);
    });

    it('allows nullable pollutant fields on days/hours/currentConditions', () => {
        const raw = new WeatherResponseSchemaMock().entity() as Record<string, unknown>;
        const currentConditions = raw['currentConditions'] as Record<string, unknown>;
        currentConditions['pm10'] = null;
        currentConditions['so2'] = null;
        currentConditions['no2'] = null;
        currentConditions['o3'] = null;
        currentConditions['co'] = null;

        const result = weatherSchema.parse(raw);

        expect(result.currentConditions.pm10).toBeNull();
        expect(result.currentConditions.co).toBeNull();
    });

    it('strips unknown top-level fields instead of failing', () => {
        const raw = new WeatherResponseSchemaMock().entity({ someUnknownField: 'whatever' });

        const result = weatherSchema.parse(raw) as Record<string, unknown>;

        expect(result['someUnknownField']).toBeUndefined();
    });

    it('rejects a payload missing a required field', () => {
        const raw = new WeatherResponseSchemaMock().entity();
        delete (raw as Record<string, unknown>)['latitude'];

        expect(() => weatherSchema.parse(raw)).toThrow();
    });

    it('rejects a payload with the wrong type for a field', () => {
        const raw = new WeatherResponseSchemaMock().entity({ latitude: 'not-a-number' });

        expect(() => weatherSchema.parse(raw)).toThrow();
    });

    it('rejects a day missing its hours array', () => {
        const raw = new WeatherResponseSchemaMock().entity();
        const days = (raw as Record<string, unknown>)['days'] as Record<string, unknown>[];
        delete days[0]['hours'];

        expect(() => weatherSchema.parse(raw)).toThrow();
    });

    it('rejects an hour missing its datetime', () => {
        const raw = new WeatherResponseSchemaMock().entity();
        const days = (raw as Record<string, unknown>)['days'] as Record<string, unknown>[];
        const hours = days[0]['hours'] as Record<string, unknown>[];
        delete hours[0]['datetime'];

        expect(() => weatherSchema.parse(raw)).toThrow();
    });
});
