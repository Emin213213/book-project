import type {
  MutationFunctionContext,
  UseMutationOptions,
} from "@tanstack/react-query";

import type { AdminRole, UpdateAdminRole } from "../model/admin-role.types";
import {
  createAdminRole,
  deleteAdminRole,
  updateAdminRole,
} from "./roleService";

type UpdateRoleOptions = {
  readonly roleId: string;
  readonly session: string | undefined;
  readonly onSaved: (role: AdminRole) => void;
};

type CreateRoleInput = Parameters<typeof createAdminRole>[0];

/** Настраивает запрос изменения роли и синхронизацию кеша после успешной записи. */
export function getUpdateRoleMutationOptions({
  roleId,
  session,
  onSaved,
}: UpdateRoleOptions): UseMutationOptions<AdminRole, Error, UpdateAdminRole> {
  async function handleSuccess(
    savedRole: AdminRole,
    _input: UpdateAdminRole,
    _result: unknown,
    context: MutationFunctionContext,
  ): Promise<void> {
    onSaved(savedRole);
    context.client.setQueryData(["admin-role", { roleId, session }], savedRole);
    await Promise.all([
      context.client.invalidateQueries({ queryKey: ["admin-roles"] }),
      context.client.invalidateQueries({ queryKey: ["current-permissions"] }),
    ]);
  }

  function sendUpdate(input: UpdateAdminRole): Promise<AdminRole> {
    return updateAdminRole(roleId, input);
  }

  return { mutationFn: sendUpdate, onSuccess: handleSuccess };
}

/** Обновляет список ролей перед открытием созданной роли. */
export function getCreateRoleMutationOptions(
  onCreated: (roleId: string) => void,
): UseMutationOptions<AdminRole, Error, CreateRoleInput> {
  async function handleSuccess(
    role: AdminRole,
    _input: CreateRoleInput,
    _result: unknown,
    context: MutationFunctionContext,
  ): Promise<void> {
    await context.client.invalidateQueries({ queryKey: ["admin-roles"] });
    onCreated(role.id);
  }

  return { mutationFn: createAdminRole, onSuccess: handleSuccess };
}

/** Удаляет кеш выбранной роли и обновляет список и права пользователя. */
export function getDeleteRoleMutationOptions(): UseMutationOptions<
  void,
  Error,
  string
> {
  async function handleSuccess(
    _response: void,
    roleId: string,
    _result: unknown,
    context: MutationFunctionContext,
  ): Promise<void> {
    context.client.removeQueries({ queryKey: ["admin-role", { roleId }] });
    await Promise.all([
      context.client.invalidateQueries({ queryKey: ["admin-roles"] }),
      context.client.invalidateQueries({ queryKey: ["current-permissions"] }),
    ]);
  }

  return { mutationFn: deleteAdminRole, onSuccess: handleSuccess };
}
