import { GeoLocationError } from '@/app/shared/errors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoLocationService } from './geolocation.service';

function stubGeolocation(overrides: Partial<Geolocation>): void {
    Object.defineProperty(navigator, 'geolocation', {
        value: overrides,
        configurable: true,
        writable: true
    });
}

describe('GeoLocationService', () => {
    let service: GeoLocationService;
    let hadGeolocation: boolean;
    let originalGeolocation: Geolocation | undefined;

    beforeEach(() => {
        hadGeolocation = 'geolocation' in navigator;
        originalGeolocation = (navigator as { geolocation?: Geolocation }).geolocation;
        service = new GeoLocationService();
    });

    afterEach(() => {
        if (hadGeolocation) {
            stubGeolocation(originalGeolocation as Geolocation);
        } else {
            delete (navigator as { geolocation?: Geolocation }).geolocation;
        }
    });

    describe('getCoordinates', () => {
        it('resolves with the coordinates on success and updates the signals', async () => {
            const getCurrentPosition = vi.fn((success: PositionCallback) => {
                success({ coords: { latitude: -23.5, longitude: -46.6 } } as GeolocationPosition);
            });
            stubGeolocation({ getCurrentPosition } as unknown as Geolocation);

            const result = await service.getCoordinates();

            expect(result).toEqual({ latitude: -23.5, longitude: -46.6 });
            expect(service.location()).toEqual({ latitude: -23.5, longitude: -46.6 });
            expect(service.loading()).toBe(false);
            expect(service.error()).toBeNull();
        });

        it('sets loading to true while the request is in flight', () => {
            let loadingDuringRequest = false;
            const getCurrentPosition = vi.fn(() => {
                loadingDuringRequest = service.loading();
            });
            stubGeolocation({ getCurrentPosition } as unknown as Geolocation);

            void service.getCoordinates();

            expect(loadingDuringRequest).toBe(true);
        });

        it('rejects with a GeoLocationError and updates the signals on failure', async () => {
            const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
                error({ message: 'User denied Geolocation' } as GeolocationPositionError);
            });
            stubGeolocation({ getCurrentPosition } as unknown as Geolocation);

            await expect(service.getCoordinates()).rejects.toBeInstanceOf(GeoLocationError);
            expect(service.error()).toBeInstanceOf(GeoLocationError);
            expect(service.error()?.message).toBe('User denied Geolocation');
            expect(service.loading()).toBe(false);
        });

        it('rejects with a GeoLocationError when geolocation is not supported', async () => {
            delete (navigator as { geolocation?: Geolocation }).geolocation;

            await expect(service.getCoordinates()).rejects.toBeInstanceOf(GeoLocationError);
            expect(service.error()).toBeInstanceOf(GeoLocationError);
        });
    });

    describe('getCurrentLocation', () => {
        it('updates the location signal on success (fire-and-forget)', async () => {
            const getCurrentPosition = vi.fn((success: PositionCallback) => {
                success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition);
            });
            stubGeolocation({ getCurrentPosition } as unknown as Geolocation);

            service.getCurrentLocation();
            await Promise.resolve();

            expect(service.location()).toEqual({ latitude: 1, longitude: 2 });
        });

        it('does not throw when geolocation is unavailable', () => {
            delete (navigator as { geolocation?: Geolocation }).geolocation;

            expect(() => service.getCurrentLocation()).not.toThrow();
        });
    });
});
