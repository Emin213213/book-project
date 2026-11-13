import type { MigrationInterface, QueryRunner } from "typeorm";

/** Добавляет описание права доступа с пустым значением для существующих записей. */
export class AddDescriptionToPermissions1792923382642 implements MigrationInterface {
  public readonly name = "AddDescriptionToPermissions1792923382642";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `permissions` ADD `description` varchar(255) NOT NULL DEFAULT ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `permissions` DROP COLUMN `description`");
  }
}
