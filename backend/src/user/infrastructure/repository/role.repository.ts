import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { EntityManager } from "typeorm";
import { DataSource, QueryFailedError, Repository } from "typeorm";

import type { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { Role } from "@/user/domain/entities/role.entity";
import { RoleExistException } from "@/user/domain/exceptions/role/role-exist.exception";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role) private readonly repository: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  public async findAll(role?: string): Promise<Role[]> {
    const query = this.repository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permission");

    if (role) {
      query.where("role.name LIKE :role", { role: `%${role}%` });
    }

    return query.getMany();
  }

  public async findById(id: Uuid): Promise<Role | undefined> {
    return (
      (await this.repository
        .createQueryBuilder("role")
        .leftJoinAndSelect("role.permissions", "permission")
        .where("role.id = :id", { id: id.toString() })
        .getOne()) ?? undefined
    );
  }

  public async findBySlug(slug: string): Promise<Role | undefined> {
    return (
      (await this.repository
        .createQueryBuilder("role")
        .leftJoinAndSelect("role.permissions", "permission")
        .where("role.slug = :slug", { slug })
        .getOne()) ?? undefined
    );
  }

  public async syncPermission(
    roleId: Uuid,
    permissionIds: readonly Uuid[],
  ): Promise<void> {
    const roleKey = roleId.toString();
    const permissionKeys = [
      ...new Set(permissionIds.map((id) => id.toString())),
    ];
    await this.dataSource.transaction(async (entityManager): Promise<void> => {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from("role_permissions")
        .where("role_id = :roleId", { roleId: roleKey })
        .execute();
      if (permissionKeys.length > 0) {
        await this.insertPermissions(entityManager, roleKey, permissionKeys);
      }
    });
  }

  private async insertPermissions(
    entityManager: EntityManager,
    roleId: string,
    permissionIds: readonly string[],
  ): Promise<void> {
    await entityManager
      .createQueryBuilder()
      .insert()
      .into("role_permissions")
      .values(
        permissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
      )
      .execute();
  }

  public async save(role: Role): Promise<void> {
    try {
      await this.repository.save(role);
    } catch (error: unknown) {
      this.rethrowWriteError(error);
    }
  }

  public async update(role: Role): Promise<void> {
    try {
      await this.dataSource.transaction(
        async (entityManager): Promise<void> => {
          await entityManager.update(Role, role.id, {
            name: role.name,
            slug: role.slug,
          });
          await entityManager
            .createQueryBuilder()
            .delete()
            .from("role_permissions")
            .where("role_id = :roleId", { roleId: role.id })
            .execute();
          if (role.permissions.length > 0) {
            await this.insertPermissions(
              entityManager,
              role.id,
              role.permissions.map((permission) =>
                permission.getId().toString(),
              ),
            );
          }
        },
      );
    } catch (error: unknown) {
      this.rethrowWriteError(error);
    }
  }

  private rethrowWriteError(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      "code" in error.driverError &&
      error.driverError.code === "ER_DUP_ENTRY"
    ) {
      throw new RoleExistException({ cause: error });
    }
    throw error;
  }

  public async delete(id: Uuid): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(Role)
      .where("id = :id", { id: id.toString() })
      .execute();
  }
}
