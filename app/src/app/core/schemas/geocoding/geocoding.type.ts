import { z } from 'zod';
import { geocodingLocationSchema, geocodingSearchSchema } from './geocoding.schema';

export type GeocodingLocationType = z.infer<typeof geocodingLocationSchema>;
export type GeocodingSearchType = z.infer<typeof geocodingSearchSchema>;
