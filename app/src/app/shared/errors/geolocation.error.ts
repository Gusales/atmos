export class GeoLocationError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "Geolocation Error";
        this.message = message;
    }
}