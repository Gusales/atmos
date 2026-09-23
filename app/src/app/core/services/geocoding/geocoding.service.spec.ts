import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GeocodingLocationDto } from '../../dtos/geocoding';
import { GeocodingLocationSchemaMock } from '../../schemas/geocoding';
import { GeoCodingService } from './geocoding.service';

describe('GeoCodingService', () => {
    let service: GeoCodingService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(GeoCodingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getPlaceBySearch', () => {
        it('requests /api/geocoding with the search term as a query param', () => {
            service.getPlaceBySearch('Barueri').subscribe();

            const req = httpMock.expectOne(request => request.url === '/api/geocoding');
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('search')).toBe('Barueri');

            req.flush({ data: [] });
        });

        it('validates and transforms matching results into GeocodingLocationDto instances', () => {
            let result: GeocodingLocationDto[] | undefined;
            service.getPlaceBySearch('Barueri').subscribe(value => (result = value));

            const req = httpMock.expectOne(request => request.url === '/api/geocoding');
            req.flush({ data: new GeocodingLocationSchemaMock().entities(2) });

            expect(result).toHaveLength(2);
            expect(result?.[0]).toBeInstanceOf(GeocodingLocationDto);
        });

        it('filters out locations whose addresstype is not allowed', () => {
            let result: GeocodingLocationDto[] | undefined;
            service.getPlaceBySearch('Rua Carapicu').subscribe(value => (result = value));

            const allowed = new GeocodingLocationSchemaMock().entity({ addresstype: 'city' });
            const disallowed = new GeocodingLocationSchemaMock().entity({ addresstype: 'road', place_id: 123 });

            const req = httpMock.expectOne(request => request.url === '/api/geocoding');
            req.flush({ data: [allowed, disallowed] });

            expect(result).toHaveLength(1);
            expect(result?.[0].addresstype).toBe('city');
        });

        it('errors out when the response does not match geocodingSearchSchema', () => {
            let error: unknown;
            service.getPlaceBySearch('invalid').subscribe({ error: (err) => (error = err) });

            const req = httpMock.expectOne(request => request.url === '/api/geocoding');
            req.flush({ data: { unexpected: 'shape' } });

            expect(error).toBeDefined();
        });
    });

    describe('getPlaceByCoordinates', () => {
        it('requests /api/geocoding/coordinates with latitude/longitude as query params', () => {
            service.getPlaceByCoordinates(-23.5112184, -46.8764612).subscribe();

            const req = httpMock.expectOne(request => request.url === '/api/geocoding/coordinates');
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('latitude')).toBe('-23.5112184');
            expect(req.request.params.get('longitude')).toBe('-46.8764612');

            req.flush({ data: new GeocodingLocationSchemaMock().entity() });
        });

        it('validates and transforms the response into a single GeocodingLocationDto', () => {
            let result: GeocodingLocationDto | undefined;
            service.getPlaceByCoordinates(-23.5112184, -46.8764612).subscribe(value => (result = value));

            const req = httpMock.expectOne(request => request.url === '/api/geocoding/coordinates');
            req.flush({ data: new GeocodingLocationSchemaMock().entity() });

            expect(result).toBeInstanceOf(GeocodingLocationDto);
            expect(result?.name).toBe('Barueri');
        });

        it('does not filter by addresstype (any type is accepted for a reverse lookup)', () => {
            let result: GeocodingLocationDto | undefined;
            service.getPlaceByCoordinates(-23.5112184, -46.8764612).subscribe(value => (result = value));

            const req = httpMock.expectOne(request => request.url === '/api/geocoding/coordinates');
            req.flush({ data: new GeocodingLocationSchemaMock().entity({ addresstype: 'road' }) });

            expect(result?.addresstype).toBe('road');
        });
    });
});
