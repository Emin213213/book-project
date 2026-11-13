import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoginTrackingToUsers1792256746916 implements MigrationInterface {
    name = 'AddLoginTrackingToUsers1792256746916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`last_login_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`last_login_ip\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`login_count\` int UNSIGNED NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`password_changed_at\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`password_changed_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`login_count\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_login_ip\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_login_at\``);
    }

}
