import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreviousRefreshTokenHashToSessions1793522884159 implements MigrationInterface {
    name = 'AddPreviousRefreshTokenHashToSessions1793522884159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` ADD \`previous_refresh_token_hash\` char(64) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_session_prev_refresh\` ON \`session\` (\`previous_refresh_token_hash\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_session_prev_refresh\` ON \`session\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP COLUMN \`previous_refresh_token_hash\``);
    }

}
