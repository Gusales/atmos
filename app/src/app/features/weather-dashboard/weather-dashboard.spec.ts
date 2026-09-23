import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeocodingLocationMock } from '@/app/core/dtos/geocoding';
import { WeatherNamesEnum } from '../../shared/enums';
import {
    formatLocationAddress,
    parseTimeToMinutes,
    resolveWeatherCondition,
    toCurrentPlace,
    toPlace,
    weekdayName
} from './index';

describe('weather-dashboard pure helpers', () => {
    describe('parseTimeToMinutes', () => {
        it('converts an "HH:MM" string into total minutes', () => {
            expect(parseTimeToMinutes('00:00')).toBe(0);
            expect(parseTimeToMinutes('05:58')).toBe(358);
            expect(parseTimeToMinutes('18:02')).toBe(1082);
            expect(parseTimeToMinutes('23:59')).toBe(1439);
        });
    });

    describe('resolveWeatherCondition', () => {
        it('returns THUNDER for high precipitation probability', () => {
            expect(resolveWeatherCondition({ precipprob: 70, humidity: 0 })).toBe(WeatherNamesEnum.THUNDER);
        });

        it('returns RAIN for moderate-high precipitation probability', () => {
            expect(resolveWeatherCondition({ precipprob: 40, humidity: 0 })).toBe(WeatherNamesEnum.RAIN);
        });

        it('returns PARTLY_CLOUDY for moderate precipitation probability', () => {
            expect(resolveWeatherCondition({ precipprob: 15, humidity: 0 })).toBe(WeatherNamesEnum.PARTLY_CLOUDY);
        });

        it('returns CLOUDY for high humidity when precipitation is low', () => {
            expect(resolveWeatherCondition({ precipprob: 0, humidity: 80 })).toBe(WeatherNamesEnum.CLOUDY);
        });

        it('returns SUN otherwise', () => {
            expect(resolveWeatherCondition({ precipprob: 0, humidity: 0 })).toBe(WeatherNamesEnum.SUN);
        });
    });

    describe('weekdayName', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-09-23T12:00:00'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('capitalizes the weekday name for the given day offset', () => {
            expect(weekdayName(1)).toBe('Quinta-feira');
            expect(weekdayName(2)).toBe('Sexta-feira');
        });
    });

    describe('toPlace', () => {
        it('maps a GeocodingLocationDto into a Place', () => {
            const location = new GeocodingLocationMock().entity();

            expect(toPlace(location)).toEqual({
                id: '8934352',
                name: 'Barueri',
                neighborhood: '',
                city: 'Barueri',
                state: 'São Paulo'
            });
        });

        it('falls back to the location name for city when the address lacks it', () => {
            const location = new GeocodingLocationMock().entity();
            location.address.city = null;

            const place = toPlace(location);

            expect(place.city).toBe(location.name);
        });
    });

    describe('toCurrentPlace', () => {
        it('maps a GeocodingLocationDto into an ICurrentPlace with numeric coordinates', () => {
            const location = new GeocodingLocationMock().entity();

            expect(toCurrentPlace(location)).toEqual({
                id: '8934352',
                name: 'Barueri',
                state: 'São Paulo',
                latitude: -23.5112184,
                longitude: -46.8764612
            });
        });
    });

    describe('formatLocationAddress', () => {
        it('formats a city_district location as "bairro, cidade, UF"', () => {
            const location = new GeocodingLocationMock().entity({ addresstype: 'city_district' });
            location.address.city_district = 'Pinheiros';

            expect(formatLocationAddress(location)).toBe('Pinheiros, Barueri, SP');
        });

        it('formats a city location as "cidade, UF"', () => {
            const location = new GeocodingLocationMock().entity({ addresstype: 'city' });

            expect(formatLocationAddress(location)).toBe('Barueri, SP');
        });

        it('formats a state location as "estado, BR"', () => {
            const location = new GeocodingLocationMock().entity({ addresstype: 'state' });

            expect(formatLocationAddress(location)).toBe('São Paulo, BR');
        });

        it('falls back to the location name for any other addresstype', () => {
            const location = new GeocodingLocationMock().entity({ addresstype: 'suburb' as never });

            expect(formatLocationAddress(location)).toBe('Barueri');
        });
    });
});
