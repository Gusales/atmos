import { Mock } from "@test/mock";
import { IUserLocation } from "./geolocation.service";

export class UserLocationMock extends Mock<IUserLocation> {
    entity(partial: Partial<IUserLocation> = {}): IUserLocation {
        return {
            latitude: -23.5505,
            longitude: -46.6333,
            ...partial
        }
    }
}
