import type {Uuid} from "@/common/domain/value-objects/uuid.vo";
import type {Role} from "@/user/domain/entities/role.entity";


export const ROLE_REPOSITORY = Symbol("ROLE_REPOSITORY");

export interface IRoleRepository {
    findAll(page: number, per_page: number, role?: string);

    findById(id: Uuid): Promise<Role | undefined>;

    findBySlug(slug: string): Promise<Role | undefined>;

    syncPermission(roleId: Uuid, permissionIds: readonly Uuid[]): Promise<void>;

    save(role: Role): Promise<void>;

    update(role: Role): Promise<void>;

    delete(id: Uuid): Promise<void>;
}
