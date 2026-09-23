import { describe, expect, it } from 'vitest';
import { HttpError, UpstreamGeoCodingApiError, UpstreamWeatherApiError } from './http.error';

describe('HttpError', () => {
    it('carries the status code, message and optional details', () => {
        const error = new HttpError(418, "I'm a teapot", { reason: 'brewing' });

        expect(error.statusCode).toBe(418);
        expect(error.message).toBe("I'm a teapot");
        expect(error.details).toEqual({ reason: 'brewing' });
    });

    it('sets its name to the concrete subclass name', () => {
        const error = new HttpError(500, 'boom');

        expect(error.name).toBe('HttpError');
        expect(error).toBeInstanceOf(Error);
    });
});

describe('UpstreamGeoCodingApiError', () => {
    it('builds a fixed message with the upstream status code and details', () => {
        const error = new UpstreamGeoCodingApiError(502, 'bad gateway body');

        expect(error.name).toBe('UpstreamGeoCodingApiError');
        expect(error.statusCode).toBe(502);
        expect(error.message).toBe('Unable to retrieve data from the Geocoding api');
        expect(error.details).toBe('bad gateway body');
        expect(error).toBeInstanceOf(HttpError);
    });
});

describe('UpstreamWeatherApiError', () => {
    it('builds a fixed message with the upstream status code and details', () => {
        const error = new UpstreamWeatherApiError(503, 'service unavailable body');

        expect(error.name).toBe('UpstreamWeatherApiError');
        expect(error.statusCode).toBe(503);
        expect(error.message).toBe('Unable to retrieve data from the weather api');
        expect(error.details).toBe('service unavailable body');
        expect(error).toBeInstanceOf(HttpError);
    });
});
