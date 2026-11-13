import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1793520703029 implements MigrationInterface {
    name = 'Migration1793520703029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`refresh_token_hash\` char(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`refresh_expires_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`rotation_count\` int UNSIGNED NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`revoked_reason\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`ip\` \`ip\` varchar(255) NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`ip\` \`ip\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`revoked_reason\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`rotation_count\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`refresh_expires_at\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`refresh_token_hash\``);
    }

}
