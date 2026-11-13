import dataSource from "../../../../data-source";
import {readdir} from 'node:fs/promises'
import {join} from 'node:path'
import {existsSync} from 'node:fs'
import type {PermissionDefinition} from "@/user/infrastructure/types/permission-definition.type";
import {DefaultAdminRoleName} from "@/user/domain/constants/default-admin-role-name";
import type {DataSource, EntityManager} from "typeorm";
import {Role} from "@/user/domain/entities/role.entity";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
import type {StrHelperInterface} from "@/common/application/ports/str-helper.interface";
import {Str} from "@/common/infrastructure/service/str";
import {IPermissionRepository} from "@/user/domain/repositories/permission.repository.interface";
import {PermissionRepository} from "@/user/infrastructure/repository/permission.repository";
import {Permission} from "@/user/domain/entities/permission.entity";
import type {PermissionType} from "@/common/domain/permission.type";
import {IRoleRepository} from "@/user/domain/repositories/role.repository.interface";
import {RoleRepository} from "@/user/infrastructure/repository/role.repository";


class SyncPermissionsCommand {

    constructor(
        private readonly datasource: DataSource,
        private readonly strHelper: StrHelperInterface,
        private readonly permissionRepository: IPermissionRepository,
        private readonly roleRepository: IRoleRepository,
    ) {
    }

    public async run(): Promise<void> {
        const configurations: PermissionDefinition[] = await this.loadPermissions()

        const permissions = configurations.map((permission) => ({
            name: permission.name,
            description: permission.description,
        }))

        await this.savePermissions(permissions)

        const [superAdmin, admin, manager, moderator] = Object.values(DefaultAdminRoleName)

        const rolesAndPermissions: {
            [roleName: string]: Permission[],
        } = {
            [superAdmin]: [],
            [admin]: [],
            [manager]: [],
            [moderator]: []
        }

        for (const configuration of configurations) {
            const permission = await this.permissionRepository.findBySlug(configuration.name)

            if (!permission) continue

            if (configuration.roles.includes(superAdmin)) {
                rolesAndPermissions[superAdmin].push(permission)
            }
            if (configuration.roles.includes(admin)) {
                rolesAndPermissions[admin].push(permission)
            }
            if (configuration.roles.includes(manager)) {
                rolesAndPermissions[manager].push(permission)
            }
            if (configuration.roles.includes(moderator)) {
                rolesAndPermissions[moderator].push(permission)
            }
        }

        await this.syncSystemRoles(rolesAndPermissions)

    }

    private async savePermissions(permissions: {
        name: PermissionType,
        description: string,
    }[]): Promise<void> {
        await this.datasource.transaction(async (em: EntityManager) => {
            for (const el of permissions) {


                const existPermission = await this.permissionRepository.findBySlug(el.name)

                if (existPermission) {
                    existPermission.changeDescription(el.description);
                    await this.permissionRepository.update(existPermission)


                } else {
                    const newPermission =
                        Permission.create(
                            el.name,
                            Uuid.generate(),
                            el.description
                        );

                    await em.save(newPermission)
                }
            }
        })


    }


    private async syncSystemRoles(config: Record<string, Permission[]>): Promise<void> {
        for (const roleName of Object.keys(config)) {
            const slug = this.strHelper.slug(roleName);

            const existingRole = await this.roleRepository.findBySlug(slug);

            const permissions = config[roleName];

            if (existingRole) {
                await this.roleRepository.syncPermission(
                    existingRole.getId(),
                    permissions.map((permission) => permission.getId()),
                );
                continue;
            }

            const systemRole = Role.create(
                Uuid.generate(),
                roleName,
                slug,
                true,
                permissions,
            );

            await this.roleRepository.save(systemRole);
        }
    }


    private async loadPermissions(): Promise<PermissionDefinition[]> {
        const EXT = '.ts'
        const MODULES_ROOT = join(__dirname, '..', '..', '..')
        const PERMISSION_FILE = join('infrastructure', 'config', `permissions${EXT}`)

        const entries = await readdir(MODULES_ROOT, {withFileTypes: true})
        const modules = entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort()

        const all: PermissionDefinition[] = [];

        for (const module of modules) {
            const file = join(MODULES_ROOT, module, PERMISSION_FILE)

            if (!existsSync(file)) continue;

            const loadedFile: unknown = (await import(file)).default

            if (!Array.isArray(loadedFile)) {
                throw new Error(` '${file}' is not an correct permission definitions'`)
            }

            all.push(...loadedFile)

        }
        return all
    }
}


async function main(): Promise<void> {
    try {
        await dataSource.initialize();

        const permissionRepository = new PermissionRepository(
            dataSource.getRepository(Permission),
            dataSource,
        );
        const roleRepository = new RoleRepository(
            dataSource.getRepository(Role),
            dataSource,
        );
        const command = new SyncPermissionsCommand(dataSource, new Str(), permissionRepository, roleRepository);
        await command.run();
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

void main()
