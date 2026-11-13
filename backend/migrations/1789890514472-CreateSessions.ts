import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSessions1789890514472 implements MigrationInterface {
    name = 'CreateSessions1789890514472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`session\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`accessTokenValidUntil\` timestamp NOT NULL, \`access_token\` char(64) NOT NULL, \`revoked_at\` timestamp NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_dd3bfba3a86f80dc44b1834cdf\` (\`access_token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD CONSTRAINT \`FK_30e98e8746699fb9af235410aff\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` DROP FOREIGN KEY \`FK_30e98e8746699fb9af235410aff\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd3bfba3a86f80dc44b1834cdf\` ON \`session\``);
        await queryRunner.query(`DROP TABLE \`session\``);
    }
}
