export class HttpError extends Error {
    public readonly statusCode: number
    public readonly details?: unknown

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message)
        this.name = new.target.name
        this.statusCode = statusCode
        this.details = details
    }
}

export class InvalidCoordinatesError extends HttpError {
    constructor() {
        super(400, 'latitude and longitude headers must be valid numbers within range (-90..90, -180..180)')
    }
}

export class UpstreamWeatherApiError extends HttpError {
    constructor(statusCode: number, details: string) {
        super(statusCode, 'Unable to retrieve data from the weather api', details)
    }
}
