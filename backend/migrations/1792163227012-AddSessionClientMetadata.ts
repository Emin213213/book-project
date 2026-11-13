import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionClientMetadata1792163227012 implements MigrationInterface {
    name = 'AddSessionClientMetadata1792163227012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`ip\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`user_agent\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`user_agent\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`ip\``);
    }

}
