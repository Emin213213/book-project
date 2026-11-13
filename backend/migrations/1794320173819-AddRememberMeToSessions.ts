import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRememberMeToSessions1794320173819 implements MigrationInterface {
    name = 'AddRememberMeToSessions1794320173819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`remember_me\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`remember_me\``);
    }

}
