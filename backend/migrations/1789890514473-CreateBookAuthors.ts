import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBookAuthors1789890514473 implements MigrationInterface {
    name = 'CreateBookAuthors1789890514473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_authors\` (\`book_id\` varchar(36) NOT NULL, \`author_id\` varchar(36) NOT NULL, INDEX \`IDX_1d68802baf370cd6818cad7a50\` (\`book_id\`), INDEX \`IDX_6fb8ac32a0a0bbca076b2cf7c5\` (\`author_id\`), PRIMARY KEY (\`book_id\`, \`author_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_authors\` ADD CONSTRAINT \`FK_1d68802baf370cd6818cad7a503\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`book_authors\` ADD CONSTRAINT \`FK_6fb8ac32a0a0bbca076b2cf7c5a\` FOREIGN KEY (\`author_id\`) REFERENCES \`authors\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_authors\` DROP FOREIGN KEY \`FK_6fb8ac32a0a0bbca076b2cf7c5a\``);
        await queryRunner.query(`ALTER TABLE \`book_authors\` DROP FOREIGN KEY \`FK_1d68802baf370cd6818cad7a503\``);
        await queryRunner.query(`DROP INDEX \`IDX_6fb8ac32a0a0bbca076b2cf7c5\` ON \`book_authors\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d68802baf370cd6818cad7a50\` ON \`book_authors\``);
        await queryRunner.query(`DROP TABLE \`book_authors\``);
    }
}
