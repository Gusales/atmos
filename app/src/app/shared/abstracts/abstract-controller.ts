import type { Response as ExpressResponse } from 'express'

import { HttpError } from '@/app/server/errors'

export abstract class AbstractController {
    protected handleError(error: unknown, context: string, res: ExpressResponse): void {
        console.error(`${context} - Ocorreu o seguinte erro ao fazer a requisição: ${(error as Error).name} | ${(error as Error).message}`)

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

    protected getDefaultHeaders(): Record<string, string> {
        return {
            'Accept': 'application/json',
            'User-Agent': 'Atmos/1.0 (https://github.com/gusales/atmos; dev.gussales@gmail.com)'
        }
    }
}