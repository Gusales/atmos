import { describe, expect, it } from 'vitest';
import { GeocodingLocationSchemaMock } from './geocoding-location.schema.mock';
import { addressTypeSchema, geocodingLocationSchema, geocodingSearchSchema } from './geocoding.schema';

describe('geocodingLocationSchema', () => {
    it('parses a valid raw location payload', () => {
        const raw = new GeocodingLocationSchemaMock().entity();

        const result = geocodingLocationSchema.parse(raw);

        expect(result.place_id).toBe(8934352);
        expect(result.name).toBe('Barueri');
        expect(result.addresstype).toBe('city');
        expect(result.address.city).toBe('Barueri');
        expect(result.address['ISO3166-2-lvl4']).toBe('BR-SP');
    });

    it('strips unknown fields like osm_type/importance/boundingbox', () => {
        const raw = new GeocodingLocationSchemaMock().entity();

        const result = geocodingLocationSchema.parse(raw) as Record<string, unknown>;

        expect(result['osm_type']).toBeUndefined();
        expect(result['importance']).toBeUndefined();
        expect(result['boundingbox']).toBeUndefined();
    });

    it('accepts an address with every field missing (all optional)', () => {
        const raw = new GeocodingLocationSchemaMock().entity({ address: {} });

        expect(() => geocodingLocationSchema.parse(raw)).not.toThrow();
    });

    it('accepts any string as addresstype (validated separately downstream)', () => {
        const raw = new GeocodingLocationSchemaMock().entity({ addresstype: 'road' });

        expect(() => geocodingLocationSchema.parse(raw)).not.toThrow();
    });

    it('rejects a payload missing a required field', () => {
        const raw = new GeocodingLocationSchemaMock().entity();
        delete (raw as Record<string, unknown>)['place_id'];

        expect(() => geocodingLocationSchema.parse(raw)).toThrow();
    });

    it('rejects a payload with the wrong type for a field', () => {
        const raw = new GeocodingLocationSchemaMock().entity({ place_id: 'not-a-number' });

        expect(() => geocodingLocationSchema.parse(raw)).toThrow();
    });
});

describe('geocodingSearchSchema', () => {
    it('parses an array of valid locations', () => {
        const raw = new GeocodingLocationSchemaMock().entities(3);

        const result = geocodingSearchSchema.parse(raw);

        expect(result).toHaveLength(3);
    });

    it('parses an empty array', () => {
        expect(geocodingSearchSchema.parse([])).toEqual([]);
    });

    it('rejects an array containing an invalid location', () => {
        const valid = new GeocodingLocationSchemaMock().entity();
        const invalid = new GeocodingLocationSchemaMock().entity({ place_id: 'not-a-number' });

        expect(() => geocodingSearchSchema.parse([valid, invalid])).toThrow();
    });
});

describe('addressTypeSchema', () => {
    it.each(['city_district', 'city', 'state'])('accepts "%s"', (value) => {
        expect(addressTypeSchema.parse(value)).toBe(value);
    });

    it('rejects any other value', () => {
        expect(() => addressTypeSchema.parse('road')).toThrow();
    });
});
