import type { Response as ExpressResponse } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/app/server/errors';
import { AbstractController } from './abstract-controller';

class TestController extends AbstractController {
    public expose(error: unknown, context: string, res: ExpressResponse): void {
        this.handleError(error, context, res);
    }

    public exposeHeaders(): Record<string, string> {
        return this.getDefaultHeaders();
    }
}

function mockResponse(): ExpressResponse {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    };
    return res as unknown as ExpressResponse;
}

describe('AbstractController', () => {
    describe('handleError', () => {
        it('responds with the error statusCode and details when it is an HttpError', () => {
            const controller = new TestController();
            const res = mockResponse();
            const error = new HttpError(502, 'Unable to retrieve data', 'raw upstream body');

            controller.expose(error, '[Test]', res);

            expect(res.status).toHaveBeenCalledWith(502);
            expect(res.json).toHaveBeenCalledWith({
                statusCode: 502,
                errors: [
                    {
                        name: 'HttpError',
                        message: 'Unable to retrieve data',
                        details: 'raw upstream body'
                    }
                ]
            });
        });

        it('falls back to a generic 500 response for unknown errors', () => {
            const controller = new TestController();
            const res = mockResponse();

            controller.expose(new Error('anything else'), '[Test]', res);

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

    describe('getDefaultHeaders', () => {
        it('returns the shared Accept/User-Agent headers used for upstream requests', () => {
            const controller = new TestController();

            expect(controller.exposeHeaders()).toEqual({
                'Accept': 'application/json',
                'User-Agent': 'Atmos/1.0 (https://github.com/gusales/atmos; dev.gussales@gmail.com)'
            });
        });
    });
});
