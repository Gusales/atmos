import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { WeatherResponseSchemaMock } from '../../schemas/weather/weather-response.schema.mock';
import { AlertDto, CurrentConditionsDto, DayDto, HourDto, WeatherResponseDto } from './weather-response.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true, exposeDefaultValues: true } as const;

describe('WeatherResponseDto (plainToInstance)', () => {
    it('maps a raw payload into a WeatherResponseDto with real nested class instances', () => {
        const raw = new WeatherResponseSchemaMock().entity();

        const result = plainToInstance(WeatherResponseDto, raw, TRANSFORM_OPTIONS);

        expect(result).toBeInstanceOf(WeatherResponseDto);
        expect(result.days[0]).toBeInstanceOf(DayDto);
        expect(result.days[0].hours[0]).toBeInstanceOf(HourDto);
        expect(result.alerts[0]).toBeInstanceOf(AlertDto);
        expect(result.currentConditions).toBeInstanceOf(CurrentConditionsDto);
    });

    it('copies the exposed scalar fields over correctly', () => {
        const raw = new WeatherResponseSchemaMock().entity();

        const result = plainToInstance(WeatherResponseDto, raw, TRANSFORM_OPTIONS);

        expect(result.queryCost).toBe(1);
        expect(result.latitude).toBe(-23.5505);
        expect(result.longitude).toBe(-46.6333);
        expect(result.timezone).toBe('America/Sao_Paulo');
        expect(result.currentConditions.temp).toBe(18.9);
        expect(result.days[0].sunrise).toBe('05:58:10');
    });

    it('strips fields that are not decorated with @Expose', () => {
        const raw = new WeatherResponseSchemaMock().entity({ someUnknownField: 'whatever' }) as Record<string, unknown>;

        const result = plainToInstance(WeatherResponseDto, raw, TRANSFORM_OPTIONS) as unknown as Record<string, unknown>;

        expect(result['someUnknownField']).toBeUndefined();
    });

    it('falls back to the class default when a field is missing from the source', () => {
        const raw = new WeatherResponseSchemaMock().entity() as Record<string, unknown>;
        delete raw['tzoffset'];

        const result = plainToInstance(WeatherResponseDto, raw, TRANSFORM_OPTIONS);

        expect(result.tzoffset).toBe(0);
    });

    it('keeps nullable pollutant fields as null instead of coercing them', () => {
        const raw = new WeatherResponseSchemaMock().entity() as Record<string, unknown>;
        (raw['currentConditions'] as Record<string, unknown>)['co'] = null;

        const result = plainToInstance(WeatherResponseDto, raw, TRANSFORM_OPTIONS);

        expect(result.currentConditions.co).toBeNull();
    });
});
