import {DataSource} from 'typeorm';
import dataSource from '../../../../data-source';
import {seedId, withSeedDataSource} from './seed.helpers';

export const CATEGORY_SEEDS = [
    ['Software Craftsmanship', 'software-craftsmanship'],
    ['Software Architecture', 'software-architecture'],
    ['Algorithms and Computer Science', 'algorithms-computer-science'],
    ['Java and JVM', 'java-jvm'],
    ['JavaScript and TypeScript', 'javascript-typescript'],
    ['Python', 'python'],
    ['Systems Programming', 'systems-programming'],
    ['Data Engineering', 'data-engineering'],
    ['DevOps and Cloud', 'devops-cloud'],
    ['Web Development', 'web-development'],
] as const;

export async function seedCategories(db: DataSource): Promise<void> {
    for (const [index, [title, slug]] of CATEGORY_SEEDS.entries()) {
        await db.query(
            `INSERT INTO categories (id, title, slug)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug)`,
            [seedId(index + 1), title, slug],
        );
    }

    console.log(`Seeded ${CATEGORY_SEEDS.length} categories.`);
}

if (require.main === module) {
    void withSeedDataSource(dataSource, seedCategories).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
