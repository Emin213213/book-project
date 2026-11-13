import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBooks1789890514471 implements MigrationInterface {
    name = 'CreateBooks1789890514471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`books\` (\`id\` varchar(36) NOT NULL, \`isbn\` varchar(17) NOT NULL, \`slug\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` longtext NULL, \`price\` decimal(12,6) NOT NULL, \`pages\` int NOT NULL, \`year\` int NOT NULL, \`quantity\` int NOT NULL DEFAULT '0', \`real_quantity\` int NOT NULL DEFAULT '0', \`cover\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`category_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD CONSTRAINT \`FK_46f5b35b90175a660f99810bc97\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`books\` DROP FOREIGN KEY \`FK_46f5b35b90175a660f99810bc97\``);
        await queryRunner.query(`DROP TABLE \`books\``);
    }
}
