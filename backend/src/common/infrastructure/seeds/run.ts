import dataSource from '../../../../data-source';
import {seedAuthors} from '@/book/infrastructure/seeds/authors.seed';
import {seedBooks} from '@/book/infrastructure/seeds/books.seed';
import {seedCategories} from '@/book/infrastructure/seeds/categories.seed';
import {withSeedDataSource} from '@/book/infrastructure/seeds/seed.helpers';
import {PermissionSeeder} from "@/user/infrastructure/seed/permission.seed";

void withSeedDataSource(dataSource, async (db) => {
    await seedCategories(db);
    await seedAuthors(db);
    await seedBooks(db);
    await new PermissionSeeder(db).run();
}).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
