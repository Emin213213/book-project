import { randomUUID } from "node:crypto";


export class Uuid {

    constructor(public readonly value: string) {
        Uuid.isValid(value)
    }

    private static isValid(value: string) {
        const patterns = value.split('-')
        if (patterns.length !== 5) {
            throw new Error('Invalid UUID format');
        }
        if (patterns[0]?.length !== 8) {
            throw new Error('Invalid UUID format');
        }
        if (patterns[1]?.length !== 4) {
            throw new Error('Invalid UUID format');

        }
        if (patterns[2]?.length !== 4) {
            throw new Error('Invalid UUID format');

        }
        if (patterns[3]?.length !== 4) {
            throw new Error('Invalid UUID format');

        }
        if (patterns[4]?.length !== 12) {
            throw new Error('Invalid UUID format');

        }

        return true

    }

    public static generate(): Uuid {
        return new Uuid(randomUUID())
    }

    toString(): string {
        return this.value;
    }

    public static fromString(value: string) {
        return new Uuid(value)
    }

    public equals(other: Uuid): boolean {
        return this.value === other.value;
    }
}
