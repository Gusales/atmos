import { Mock } from "@test/mock";
import { Place } from "./place.type";

export class PlaceMock extends Mock<Place> {
    entity(partial: Partial<Place> = {}): Place {
        return {
            id: '8934352',
            name: 'Barueri',
            neighborhood: '',
            city: 'Barueri',
            state: 'São Paulo',
            ...partial
        }
    }
}
