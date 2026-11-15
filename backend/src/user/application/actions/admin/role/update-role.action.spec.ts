import { BadRequestException, ForbiddenException } from "@nestjs/common";

import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { Permission } from "@/user/domain/entities/permission.entity";
import { Role } from "@/user/domain/entities/role.entity";
import type { IPermissionRepository } from "@/user/domain/repositories/permission.repository.interface";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";
import { DeleteRoleAction } from "./delete-role.action";
import { UpdateRoleAction } from "./update-role.action";

const ROLE_ID = Uuid.fromString("11111111-1111-4111-8111-111111111111");
const PERMISSION_ID = Uuid.fromString("22222222-2222-4222-8222-222222222222");

function createContext() {
  const permission = Permission.create("roles.view", PERMISSION_ID);
  const role = Role.create(ROLE_ID, "Manager", "manager", false, [permission]);
  const roleRepository: IRoleRepository = {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(role),
    findBySlug: jest.fn(),
    syncPermission: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const permissionRepository: IPermissionRepository = {
    findAll: jest.fn().mockResolvedValue([permission]),
    findBySlug: jest.fn(),
    findByDescription: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  return {
    role,
    roleRepository,
    action: new UpdateRoleAction(roleRepository, permissionRepository),
  };
}

describe("UpdateRoleAction", () => {
  it("updates the name and resolves requested permissions", async () => {
    const { action, roleRepository } = createContext();
    const updated = await action.handle(ROLE_ID, {
      name: "Editor",
      permissions: ["roles.view"],
    });
    expect(updated.name).toBe("Editor");
    expect(
      updated.permissions.map((permission) => permission.getSlug()),
    ).toEqual(["roles.view"]);
    expect(roleRepository.update).toHaveBeenCalledWith(updated);
  });

  it("removes every permission when the requested list is empty", async () => {
    const { action } = createContext();
    expect(
      (await action.handle(ROLE_ID, { permissions: [] })).permissions,
    ).toEqual([]);
  });

  it("preserves permissions when only the name changes", async () => {
    const { action } = createContext();
    expect(
      (await action.handle(ROLE_ID, { name: "Editor" })).permissions,
    ).toHaveLength(1);
  });

  it("rejects unknown permissions before changing or writing the role", async () => {
    const { action, role, roleRepository } = createContext();
    await expect(
      action.handle(ROLE_ID, {
        name: "Editor",
        permissions: ["unknown.update"],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(role.name).toBe("Manager");
    expect(roleRepository.update).not.toHaveBeenCalled();
  });
});

describe("DeleteRoleAction", () => {
  it("rejects system roles without deleting them", async () => {
    const { role, roleRepository } = createContext();
    role.isSystem = true;
    await expect(
      new DeleteRoleAction(roleRepository).handle(ROLE_ID),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(roleRepository.delete).not.toHaveBeenCalled();
  });

  it("deletes non-system roles", async () => {
    const { roleRepository } = createContext();
    await new DeleteRoleAction(roleRepository).handle(ROLE_ID);
    expect(roleRepository.delete).toHaveBeenCalledWith(ROLE_ID);
  });
});
