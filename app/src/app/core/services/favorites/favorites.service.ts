import { Injectable, effect, signal } from "@angular/core";
import { WeatherNamesEnum } from "../../../shared/enums";

export interface FavoritePlace {
    id: string
    name: string
    state: string
    latitude: number
    longitude: number
    weatherIcon: WeatherNamesEnum
    currentTemperature: number
    maxTemperature: number
    minTemperature: number
}

const FAVORITES_STORAGE_KEY = 'atmos:favorites'

function loadFavorites(): FavoritePlace[] {
    if (typeof localStorage === 'undefined') return []

    try {
        const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
        const favorites = raw ? JSON.parse(raw) : []
        return Array.isArray(favorites) ? favorites : []
    } catch {
        return []
    }
}

function saveFavorites(favorites: readonly FavoritePlace[]): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}

@Injectable({
    providedIn: 'root'
})
export class FavoritesService {
    readonly favorites = signal<FavoritePlace[]>(loadFavorites())

    constructor() {
        effect(() => saveFavorites(this.favorites()))
    }

    public isFavorite(id: string): boolean {
        return this.favorites().some(favorite => favorite.id === id)
    }

    public add(favorite: FavoritePlace): void {
        if (this.isFavorite(favorite.id)) return
        this.favorites.update(list => [...list, favorite])
    }

    public remove(id: string): void {
        this.favorites.update(list => list.filter(favorite => favorite.id !== id))
    }

    public toggle(favorite: FavoritePlace): void {
        if (this.isFavorite(favorite.id)) {
            this.remove(favorite.id)
        } else {
            this.add(favorite)
        }
    }
}
