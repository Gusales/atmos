import { Mock } from "@test/mock";
import { WeatherNamesEnum } from "../../../shared/enums";
import { FavoritePlace } from "./favorites.service";

export class FavoritePlaceMock extends Mock<FavoritePlace> {
    entity(partial: Partial<FavoritePlace> = {}): FavoritePlace {
        return {
            id: '8934352',
            name: 'Barueri',
            state: 'São Paulo',
            latitude: -23.5112184,
            longitude: -46.8764612,
            weatherIcon: WeatherNamesEnum.SUN,
            currentTemperature: 24,
            maxTemperature: 27,
            minTemperature: 18,
            ...partial
        }
    }
}
