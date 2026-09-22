import { z } from 'zod';

const pollutantSchema = z.object({
    pm10: z.number().nullable(),
    so2: z.number().nullable(),
    no2: z.number().nullable(),
    o3: z.number().nullable(),
    co: z.number().nullable()
});

const hourSchema = pollutantSchema.extend({
    temp: z.number(),
    humidity: z.number(),
    precipprob: z.number(),
    windspeed: z.number()
});

const daySchema = pollutantSchema.extend({
    tempmax: z.number(),
    tempmin: z.number(),
    temp: z.number(),
    humidity: z.number(),
    precipprob: z.number(),
    windspeed: z.number(),
    sunrise: z.string(),
    sunset: z.string(),
    hours: z.array(hourSchema)
});

const alertSchema = z.object({
    event: z.string(),
    headline: z.string(),
    ends: z.string(),
    endsEpoch: z.number(),
    onset: z.string(),
    onsetEpoch: z.number(),
    id: z.string(),
    language: z.string(),
    link: z.string(),
    description: z.string()
});

const currentConditionsSchema = pollutantSchema.extend({
    temp: z.number(),
    humidity: z.number(),
    precipprob: z.number(),
    windspeed: z.number(),
    sunrise: z.string(),
    sunset: z.string()
});

export const weatherSchema = z.object({
    queryCost: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    resolvedAddress: z.string(),
    address: z.string(),
    timezone: z.string(),
    tzoffset: z.number(),
    days: z.array(daySchema),
    alerts: z.array(alertSchema),
    currentConditions: currentConditionsSchema
});
