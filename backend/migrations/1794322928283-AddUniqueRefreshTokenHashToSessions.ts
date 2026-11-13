import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueRefreshTokenHashToSessions1794322928283 implements MigrationInterface {
    name = 'AddUniqueRefreshTokenHashToSessions1794322928283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` ADD UNIQUE INDEX \`IDX_e131e569c75b7d1aa8a73ffa83\` (\`refresh_token_hash\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_session_refresh_token_hash\` ON \`session\` (\`refresh_token_hash\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`UQ_session_refresh_token_hash\` ON \`session\``);
        await queryRunner.query(`ALTER TABLE \`session\` DROP INDEX \`IDX_e131e569c75b7d1aa8a73ffa83\``);
    }

}
