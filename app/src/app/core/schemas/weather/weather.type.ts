import { z } from 'zod';
import { weatherSchema } from './weather.schema';

export type WeatherType = z.infer<typeof weatherSchema>;