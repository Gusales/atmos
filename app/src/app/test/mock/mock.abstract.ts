export abstract class Mock<T> {
    abstract entity(partial?: Partial<T>): T

    entities(length: number): T[] {
        return Array.from({ length }, () => this.entity())
    }
}
