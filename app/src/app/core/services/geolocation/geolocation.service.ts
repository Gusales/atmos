import { GeoLocationError } from "@/app/shared/errors";
import { Injectable, signal } from "@angular/core";

export interface IUserLocation {
    latitude: number;
    longitude: number;
}

@Injectable({
    providedIn: 'root'
})
export class GeoLocationService {
    readonly location = signal<IUserLocation | null>(null)
    readonly error = signal<GeoLocationError | null>(null)
    readonly loading = signal<boolean>(false)
    private readonly defaultErrorMessage: string = 'Não foi possível obter a localização atual.'

    public getCurrentLocation(): void {
        this.getCoordinates().catch(() => {})
    }

    public getCoordinates(): Promise<IUserLocation> {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                const error = new GeoLocationError(this.defaultErrorMessage)
                this.error.set(error)
                reject(error)
                return
            }

            this.loading.set(true)
            this.error.set(null)

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: IUserLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }

                    this.location.set(location)
                    this.loading.set(false)
                    resolve(location)
                },
                (error) => {
                    const geoLocationError = new GeoLocationError(error.message)
                    this.error.set(geoLocationError)
                    this.loading.set(false)
                    reject(geoLocationError)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            )
        })
    }
}