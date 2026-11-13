import {DataSource} from 'typeorm';

export const seedId = (value: number): string =>
    `00000000-0000-4000-8000-${value.toString().padStart(12, '0')}`;

export async function withSeedDataSource(
    dataSource: DataSource,
    seed: (dataSource: DataSource) => Promise<void>,
): Promise<void> {
    const ownsConnection = !dataSource.isInitialized;

    if (ownsConnection) {
        await dataSource.initialize();
    }

    try {
        await seed(dataSource);
    } finally {
        if (ownsConnection) {
            await dataSource.destroy();
        }
    }
}
