import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { HttpError, UpstreamWeatherApiError } from '../errors';

export class WeatherController {
    private readonly weatherApiUrl: string
    private readonly weatherApiKey: string
    constructor(
        weatherApiUrl?: string,
        weatherApiKey?: string
    ) {
        this.weatherApiUrl = (process.env['WEATHER_API_URL'] || weatherApiUrl || '')
        this.weatherApiKey = process.env['WEATHER_API_KEY'] || weatherApiKey || ''
    }

    public async getWeather (req: ExpressRequest, res: ExpressResponse): Promise<void> {
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
            this.handleError(error, res)
        }
    }

    private buildWeatherApiUrl(search: string): URL {
        const weatherApi = new URL(`${this.weatherApiUrl}/${search}`)
        return this.setDefaultQueryParams(weatherApi)
    }

    private handleError(error: unknown, res: ExpressResponse): void {
        if (error instanceof HttpError) {
            res
                .status(error.statusCode)
                .json({
                    statusCode: error.statusCode,
                    errors: [
                        {
                            name: error.name,
                            message: error.message,
                            details: error.details
                        }
                    ]
                })
            return
        }

        console.error(`[WeatherController] - Ocorreu o seguinte erro: ${(error as Error).name} | ${(error as Error).message}`)

        res
            .status(500)
            .json({
                statusCode: 500,
                errors: [
                    {
                        name: 'Internal Server Error',
                        message: 'An unexpected error occurred while processing the request'
                    }
                ]
            })
    }

    private setDefaultQueryParams(weatherApi: URL): URL {
        weatherApi.searchParams.set('lang', 'pt');
        weatherApi.searchParams.set('unitGroup', 'metric');
        weatherApi.searchParams.set('key', this.weatherApiKey);
        weatherApi.searchParams.set('elements', 'add:pm10,so2,no2,o3,co,temp,tempmax,tempmin,windspeed,humidity,precipprob,sunrise,sunset');

        return weatherApi;
    }

    private getDefaultHeaders(): Record<string, string> {
        return {
            'Accept': 'application/json',
            'User-Agent': `atmos_server_${process.env['NODE_ENV']}`
        }
    }
}
