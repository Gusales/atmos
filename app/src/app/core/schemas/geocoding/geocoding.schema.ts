import { z } from 'zod';

const addressSchema = z.object({
    city: z.string().optional(),
    city_district: z.string().optional(),
    state: z.string().optional(),
    'ISO3166-2-lvl4': z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    country_code: z.string().optional()
});

export const addressTypeSchema = z.enum(['city_district', 'city', 'state']);

export const geocodingLocationSchema = z.object({
    place_id: z.number(),
    licence: z.string(),
    lat: z.string(),
    lon: z.string(),
    addresstype: z.string(),
    name: z.string(),
    address: addressSchema
});

export const geocodingSearchSchema = z.array(geocodingLocationSchema);
