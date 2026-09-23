import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeoCodingController } from './geocoding.controller';

function mockRequest(query: Record<string, string>): ExpressRequest {
    return { query } as unknown as ExpressRequest;
}

function mockResponse(): ExpressResponse {
    const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    };
    return res as unknown as ExpressResponse;
}

describe('GeoCodingController', () => {
    let controller: GeoCodingController;
    const fetchMock = vi.fn();

    beforeEach(() => {
        controller = new GeoCodingController('https://geocoding.example.com');
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        fetchMock.mockReset();
        vi.restoreAllMocks();
    });

    describe('getLocationBySearch', () => {
        it('strips diacritics from the search term and sets the default query params', async () => {
            fetchMock.mockResolvedValue({ ok: true, json: async () => [{ some: 'location' }] });
            const req = mockRequest({ search: 'Carapicuíba' });
            const res = mockResponse();

            await controller.getLocationBySearch(req, res);

            const [url] = fetchMock.mock.calls[0];
            const requestUrl = new URL(url as string);

            expect(requestUrl.origin + requestUrl.pathname).toBe('https://geocoding.example.com//search');
            expect(requestUrl.searchParams.get('q')).toBe('Carapicuiba');
            expect(requestUrl.searchParams.get('format')).toBe('json');
            expect(requestUrl.searchParams.get('accept-language')).toBe('pt-BR');
            expect(requestUrl.searchParams.get('limit')).toBe('10');
            expect(requestUrl.searchParams.get('addressdetails')).toBe('1');
            expect(requestUrl.searchParams.get('featureType')).toBe('settlement');

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ data: [{ some: 'location' }] });
        });

        it('responds with the upstream status and error details when the upstream request fails', async () => {
            fetchMock.mockResolvedValue({ ok: false, status: 502, text: async () => 'bad gateway' });
            const req = mockRequest({ search: 'Barueri' });
            const res = mockResponse();

            await controller.getLocationBySearch(req, res);

            expect(res.status).toHaveBeenCalledWith(502);
            expect(res.json).toHaveBeenCalledWith({
                statusCode: 502,
                errors: [
                    {
                        name: 'UpstreamGeoCodingApiError',
                        message: 'Unable to retrieve data from the Geocoding api',
                        details: 'bad gateway'
                    }
                ]
            });
            expect(res.send).not.toHaveBeenCalled();
        });
    });

    describe('getLocationByLatitudeAndLongitude', () => {
        it('sets lat/lon query params and returns the data', async () => {
            fetchMock.mockResolvedValue({ ok: true, json: async () => ({ some: 'reverse-location' }) });
            const req = mockRequest({ latitude: '-23.5505', longitude: '-46.6333' });
            const res = mockResponse();

            await controller.getLocationByLatitudeAndLongitude(req, res);

            const [url] = fetchMock.mock.calls[0];
            const requestUrl = new URL(url as string);

            expect(requestUrl.origin + requestUrl.pathname).toBe('https://geocoding.example.com//reverse');
            expect(requestUrl.searchParams.get('lat')).toBe('-23.5505');
            expect(requestUrl.searchParams.get('lon')).toBe('-46.6333');

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ data: { some: 'reverse-location' } });
        });

        it('responds with the upstream status and error details when the upstream request fails', async () => {
            fetchMock.mockResolvedValue({ ok: false, status: 502, text: async () => 'bad gateway' });
            const req = mockRequest({ latitude: '-23.5505', longitude: '-46.6333' });
            const res = mockResponse();

            await controller.getLocationByLatitudeAndLongitude(req, res);

            expect(res.status).toHaveBeenCalledWith(502);
            expect(res.json).toHaveBeenCalledWith({
                statusCode: 502,
                errors: [
                    {
                        name: 'UpstreamGeoCodingApiError',
                        message: 'Unable to retrieve data from the Geocoding api',
                        details: 'bad gateway'
                    }
                ]
            });
            expect(res.send).not.toHaveBeenCalled();
        });
    });
});
