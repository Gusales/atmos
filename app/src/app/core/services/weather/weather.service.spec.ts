import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WeatherResponseDto } from '../../dtos/weather';
import { WeatherResponseSchemaMock } from '../../schemas/weather';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
    let service: WeatherService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(WeatherService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getWeatherBySearch', () => {
        it('requests /api/weather with the search term as a query param', () => {
            service.getWeatherBySearch('-23.5505,-46.6333').subscribe();

            const req = httpMock.expectOne(request => request.url === '/api/weather');
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('search')).toBe('-23.5505,-46.6333');

            req.flush({ data: new WeatherResponseSchemaMock().entity() });
        });

        it('validates and transforms the response into a WeatherResponseDto', () => {
            let result: WeatherResponseDto | undefined;
            service.getWeatherBySearch('-23.5505,-46.6333').subscribe(value => (result = value));

            const req = httpMock.expectOne(request => request.url === '/api/weather');
            req.flush({ data: new WeatherResponseSchemaMock().entity() });

            expect(result).toBeInstanceOf(WeatherResponseDto);
            expect(result?.currentConditions.temp).toBe(18.9);
        });

        it('validates and transforms a response whose day has no hours', () => {
            let result: WeatherResponseDto | undefined;
            service.getWeatherBySearch('-23.5505,-46.6333').subscribe(value => (result = value));

            const raw = new WeatherResponseSchemaMock().entity() as { days: Array<Record<string, unknown>> };
            raw.days[0]['hours'] = [];

            const req = httpMock.expectOne(request => request.url === '/api/weather');
            req.flush({ data: raw });

            expect(result).toBeInstanceOf(WeatherResponseDto);
            expect(result?.days[0].hours).toEqual([]);
        });

        it('errors out when the response does not match weatherSchema', () => {
            let error: unknown;
            service.getWeatherBySearch('invalid').subscribe({ error: (err) => (error = err) });

            const req = httpMock.expectOne(request => request.url === '/api/weather');
            req.flush({ data: { unexpected: 'shape' } });

            expect(error).toBeDefined();
        });
    });

    describe('getWeatherByLocation', () => {
        it('delegates to getWeatherBySearch with "latitude,longitude"', () => {
            service.getWeatherByLocation(-23.5505, -46.6333).subscribe();

            const req = httpMock.expectOne(request => request.url === '/api/weather');
            expect(req.request.params.get('search')).toBe('-23.5505,-46.6333');

            req.flush({ data: new WeatherResponseSchemaMock().entity() });
        });
    });
});
