import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';
import { GeocodingLocationSchemaMock } from '../../schemas/geocoding/geocoding-location.schema.mock';
import { AddressDto, GeocodingLocationDto } from './geocoding-location.dto';

const TRANSFORM_OPTIONS = { excludeExtraneousValues: true, exposeDefaultValues: true } as const;

describe('GeocodingLocationDto (plainToInstance)', () => {
    it('maps a raw payload into a GeocodingLocationDto with a real AddressDto instance', () => {
        const raw = new GeocodingLocationSchemaMock().entity();

        const result = plainToInstance(GeocodingLocationDto, raw, TRANSFORM_OPTIONS);

        expect(result).toBeInstanceOf(GeocodingLocationDto);
        expect(result.address).toBeInstanceOf(AddressDto);
    });

    it('copies the exposed scalar fields over correctly', () => {
        const raw = new GeocodingLocationSchemaMock().entity();

        const result = plainToInstance(GeocodingLocationDto, raw, TRANSFORM_OPTIONS);

        expect(result.place_id).toBe(8934352);
        expect(result.name).toBe('Barueri');
        expect(result.addresstype).toBe('city');
        expect(result.address.city).toBe('Barueri');
        expect(result.address['ISO3166-2-lvl4']).toBe('BR-SP');
    });

    it('strips fields that are not decorated with @Expose (osm_type, importance, boundingbox, ...)', () => {
        const raw = new GeocodingLocationSchemaMock().entity();

        const result = plainToInstance(GeocodingLocationDto, raw, TRANSFORM_OPTIONS) as unknown as Record<string, unknown>;

        expect(result['osm_type']).toBeUndefined();
        expect(result['importance']).toBeUndefined();
        expect(result['boundingbox']).toBeUndefined();
        expect(result['display_name']).toBeUndefined();
    });

    it('falls back to the class default when a field is missing from the source', () => {
        const raw = new GeocodingLocationSchemaMock().entity() as Record<string, unknown>;
        delete raw['licence'];

        const result = plainToInstance(GeocodingLocationDto, raw, TRANSFORM_OPTIONS);

        expect(result.licence).toBe('');
    });

    it('falls back to a default (empty) AddressDto when address is missing from the source', () => {
        const raw = new GeocodingLocationSchemaMock().entity() as Record<string, unknown>;
        delete raw['address'];

        const result = plainToInstance(GeocodingLocationDto, raw, TRANSFORM_OPTIONS);

        expect(result.address).toBeInstanceOf(AddressDto);
        expect(result.address.city).toBeNull();
    });

    it('maps an array of raw locations into an array of DTO instances', () => {
        const raw = new GeocodingLocationSchemaMock().entities(3);

        const result = plainToInstance(GeocodingLocationDto, raw, TRANSFORM_OPTIONS);

        expect(result).toHaveLength(3);
        expect(result[0]).toBeInstanceOf(GeocodingLocationDto);
    });
});
