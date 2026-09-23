import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { AbstractController } from '@/app/shared/abstracts';

import { UpstreamWeatherApiError } from '../errors';

export class WeatherController extends AbstractController {
    private readonly weatherApiUrl: string
    private readonly weatherApiKey: string
    constructor(
        weatherApiUrl?: string,
        weatherApiKey?: string
    ) {
        super();
        this.weatherApiUrl = (process.env['WEATHER_API_URL'] || weatherApiUrl || '')
        this.weatherApiKey = process.env['WEATHER_API_KEY'] || weatherApiKey || ''
    }

    public async getWeather (req: ExpressRequest, res: ExpressResponse): Promise<void> {
        const context: string = '[WeatherController.getWeather]'
        try {
            const search = req.query['search'] as string
            const weatherApi = this.buildWeatherApiUrl(search)

            const request = await fetch(weatherApi, {
                headers: this.getDefaultHeaders()
            })

            if (!request.ok) {
                throw new UpstreamWeatherApiError(request.status, await request.text())
            }

            const response = await request.json()

            res.status(200).json({ data: response })
        } catch (error) {
            this.handleError(error, context, res)
        }
    }

    private buildWeatherApiUrl(search: string): URL {
        const weatherApi = new URL(`${this.weatherApiUrl}/${search}`)
        return this.setDefaultQueryParams(weatherApi)
    }

    private setDefaultQueryParams(weatherApi: URL): URL {
        weatherApi.searchParams.set('lang', 'pt');
        weatherApi.searchParams.set('unitGroup', 'metric');
        weatherApi.searchParams.set('key', this.weatherApiKey);
        weatherApi.searchParams.set('elements', 'add:pm10,so2,no2,o3,co,temp,tempmax,tempmin,windspeed,humidity,precipprob,sunrise,sunset,datetime');

        return weatherApi;
    }
}
