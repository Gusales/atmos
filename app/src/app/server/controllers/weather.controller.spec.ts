import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherController } from './weather.controller';

function mockRequest(query: Record<string, string>): ExpressRequest {
    return { query } as unknown as ExpressRequest;
}

function mockResponse(): ExpressResponse {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    };
    return res as unknown as ExpressResponse;
}

describe('WeatherController', () => {
    let controller: WeatherController;
    const fetchMock = vi.fn();

    beforeEach(() => {
        controller = new WeatherController('https://weather.example.com', 'test-api-key');
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        fetchMock.mockReset();
        vi.restoreAllMocks();
    });

    it('builds the upstream URL with the search path and default query params, and returns the data', async () => {
        fetchMock.mockResolvedValue({ ok: true, json: async () => ({ some: 'weather-data' }) });
        const req = mockRequest({ search: 'Barueri' });
        const res = mockResponse();

        await controller.getWeather(req, res);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        const requestUrl = new URL(url as string);

        expect(requestUrl.origin + requestUrl.pathname).toBe('https://weather.example.com/Barueri');
        expect(requestUrl.searchParams.get('lang')).toBe('pt');
        expect(requestUrl.searchParams.get('unitGroup')).toBe('metric');
        expect(requestUrl.searchParams.get('key')).toBe('test-api-key');
        expect(requestUrl.searchParams.get('elements')).toContain('pm10');
        expect((init as RequestInit).headers).toEqual({
            'Accept': 'application/json',
            'User-Agent': 'Atmos/1.0 (https://github.com/gusales/atmos; dev.gussales@gmail.com)'
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: { some: 'weather-data' } });
    });

    it('responds with the upstream status and error details when the upstream request fails', async () => {
        fetchMock.mockResolvedValue({ ok: false, status: 503, text: async () => 'service unavailable' });
        const req = mockRequest({ search: 'Barueri' });
        const res = mockResponse();

        await controller.getWeather(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith({
            statusCode: 503,
            errors: [
                {
                    name: 'UpstreamWeatherApiError',
                    message: 'Unable to retrieve data from the weather api',
                    details: 'service unavailable'
                }
            ]
        });
    });

    it('responds with a generic 500 when fetch itself throws', async () => {
        fetchMock.mockRejectedValue(new Error('network down'));
        const req = mockRequest({ search: 'Barueri' });
        const res = mockResponse();

        await controller.getWeather(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            statusCode: 500,
            errors: [
                {
                    name: 'Internal Server Error',
                    message: 'An unexpected error occurred while processing the request'
                }
            ]
        });
    });
});
