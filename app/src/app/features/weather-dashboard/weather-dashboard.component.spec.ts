import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeocodingLocationMock } from '@/app/core/dtos/geocoding';
import { WeatherResponseMock } from '@/app/core/dtos/weather';
import { FavoritesService } from '@/app/core/services/favorites';
import { GeoCodingService } from '@/app/core/services/geocoding';
import { GeoLocationService } from '@/app/core/services/geolocation';
import { WeatherService } from '@/app/core/services/weather';
import { of, throwError } from 'rxjs';
import { WeatherDashboardComponent } from './index';

describe('WeatherDashboardComponent (integration)', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<WeatherDashboardComponent>>;
    let component: WeatherDashboardComponent;
    let weatherService: WeatherService;
    let geocodingService: GeoCodingService;
    let geoLocationService: GeoLocationService;
    let favoritesService: FavoritesService;

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({ imports: [WeatherDashboardComponent] });

        weatherService = TestBed.inject(WeatherService);
        geocodingService = TestBed.inject(GeoCodingService);
        geoLocationService = TestBed.inject(GeoLocationService);
        favoritesService = TestBed.inject(FavoritesService);

        fixture = TestBed.createComponent(WeatherDashboardComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('resolves the current location on init and renders the dashboard', async () => {
        const location = new GeocodingLocationMock().entity({ addresstype: 'city' });
        const weather = new WeatherResponseMock().entity();

        vi.spyOn(geoLocationService, 'getCoordinates').mockResolvedValue({ latitude: -23.51, longitude: -46.87 });
        vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(of(weather));
        vi.spyOn(geocodingService, 'getPlaceByCoordinates').mockReturnValue(of(location));

        await component['getCurrentLocation']();
        fixture.detectChanges();

        expect(weatherService.getWeatherByLocation).toHaveBeenCalledWith(-23.51, -46.87);
        expect(component['currentPlace']()).toEqual({
            id: '8934352',
            name: 'Barueri',
            state: 'São Paulo',
            latitude: -23.5112184,
            longitude: -46.8764612
        });

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('app-current-weather')).not.toBeNull();
        expect(compiled.querySelector('app-air-quality')).not.toBeNull();
        expect(compiled.querySelector('app-sky-cycle')).not.toBeNull();
        expect(compiled.querySelector('app-weakly-forecast')).not.toBeNull();
    });

    it('falls back to São Paulo when geolocation fails', async () => {
        const weather = new WeatherResponseMock().entity();

        vi.spyOn(geoLocationService, 'getCoordinates').mockRejectedValue(new Error('denied'));
        vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(of(weather));

        await component['getCurrentLocation']();
        fixture.detectChanges();

        expect(weatherService.getWeatherByLocation).toHaveBeenCalledWith(-23.5505, -46.6333);
        expect(component['currentPlace']()).toEqual({
            id: 'current',
            name: 'São Paulo',
            state: 'SP',
            latitude: -23.5505,
            longitude: -46.6333
        });
        expect(component['weather']()?.resolvedAddress).toBe('São Paulo, SP');
    });

    describe('searching for a place', () => {
        beforeEach(async () => {
            vi.spyOn(geoLocationService, 'getCoordinates').mockRejectedValue(new Error('denied'));
            vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(of(new WeatherResponseMock().entity()));
            await component['getCurrentLocation']();
            fixture.detectChanges();
        });

        it('maps search results into places and toggles isSearching', async () => {
            const location = new GeocodingLocationMock().entity();
            vi.spyOn(geocodingService, 'getPlaceBySearch').mockReturnValue(of([location]));

            const promise = component['onSearch']('Barueri');
            expect(component['isSearching']()).toBe(true);

            await promise;

            expect(component['isSearching']()).toBe(false);
            expect(component['places']()).toEqual([
                {
                    id: '8934352',
                    name: 'Barueri',
                    neighborhood: '',
                    city: 'Barueri',
                    state: 'São Paulo'
                }
            ]);
        });

        it('selects a place from the last search results and fetches its weather', async () => {
            const location = new GeocodingLocationMock().entity();
            vi.spyOn(geocodingService, 'getPlaceBySearch').mockReturnValue(of([location]));
            await component['onSearch']('Barueri');

            const weather = new WeatherResponseMock().entity();
            vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(of(weather));

            await component['onPlaceSelected']({ id: '8934352', name: 'Barueri', neighborhood: '', city: 'Barueri', state: 'São Paulo' });

            expect(weatherService.getWeatherByLocation).toHaveBeenCalledWith(-23.5112184, -46.8764612);
            expect(component['currentPlace']()?.id).toBe('8934352');
        });

        it('does nothing when the selected place is not in the last search results', async () => {
            vi.spyOn(weatherService, 'getWeatherByLocation').mockClear();

            await component['onPlaceSelected']({ id: 'unknown', name: 'X', neighborhood: '', city: 'X', state: 'X' });

            expect(weatherService.getWeatherByLocation).not.toHaveBeenCalled();
        });
    });

    describe('favorites', () => {
        beforeEach(async () => {
            vi.spyOn(geoLocationService, 'getCoordinates').mockRejectedValue(new Error('denied'));
            vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(of(new WeatherResponseMock().entity()));
            await component['getCurrentLocation']();
            fixture.detectChanges();
        });

        it('toggles the current place as a favorite with the resolved weather data', () => {
            const toggleSpy = vi.spyOn(favoritesService, 'toggle');

            component['toggleCurrentFavorite']();

            expect(toggleSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'current',
                    name: 'São Paulo',
                    state: 'SP'
                })
            );
            expect(component['isCurrentFavorite']()).toBe(true);
        });

        it('fetches weather for a selected favorite and updates the current place', async () => {
            const weather = new WeatherResponseMock().entity();
            vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(of(weather));

            await component['onFavoriteSelected']({
                id: 'fav-1',
                name: 'Osasco',
                state: 'SP',
                latitude: -23.53,
                longitude: -46.79,
                weatherIcon: 0 as never,
                currentTemperature: 20,
                maxTemperature: 25,
                minTemperature: 15
            });

            expect(weatherService.getWeatherByLocation).toHaveBeenCalledWith(-23.53, -46.79);
            expect(component['currentPlace']()?.id).toBe('fav-1');
            expect(component['weather']()?.resolvedAddress).toBe('Osasco, SP');
        });

        it('removes a favorite by id', () => {
            const removeSpy = vi.spyOn(favoritesService, 'remove');

            component['onFavoriteRemoved']('fav-1');

            expect(removeSpy).toHaveBeenCalledWith('fav-1');
        });

        it('opens and closes the favorites modal', () => {
            component['openFavoritesModal']();
            expect(component['isFavoritesModalOpen']()).toBe(true);

            component['closeFavoritesModal']();
            expect(component['isFavoritesModalOpen']()).toBe(false);
        });
    });

    it('propagates a weather-service failure from getCurrentLocation', async () => {
        vi.spyOn(geoLocationService, 'getCoordinates').mockResolvedValue({ latitude: -23.51, longitude: -46.87 });
        vi.spyOn(weatherService, 'getWeatherByLocation').mockReturnValue(throwError(() => new Error('network error')));
        vi.spyOn(geocodingService, 'getPlaceByCoordinates').mockReturnValue(of(new GeocodingLocationMock().entity()));

        await expect(component['getCurrentLocation']()).rejects.toThrow('network error');
    });
});
