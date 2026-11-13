import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSessionAccessTokenValidUntil1789890767173 implements MigrationInterface {
    name = 'RenameSessionAccessTokenValidUntil1789890767173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`accessTokenValidUntil\` \`access_token_valid_until\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` CHANGE \`access_token_valid_until\` \`accessTokenValidUntil\` timestamp NOT NULL`);
    }

}
