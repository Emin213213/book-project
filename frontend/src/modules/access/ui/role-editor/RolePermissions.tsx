import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import type { FormikErrors, FormikHelpers } from "formik";
import type { ReactElement } from "react";

import { ACCESS_PERMISSION } from "../../model/access.constants";
import { useAccess } from "../../model/useAccess";
import { useUserStore } from "@/modules/user/index";
import { getUpdateRoleMutationOptions } from "../../api/roleMutationOptions";
import type { AdminRole } from "../../model/admin-role.types";
import { useRolesStore } from "../../model/useRolesStore";
import styles from "../Access.module.css";

import RolePermissionsTable from "./RolePermissionsTable";

const MAX_ROLE_NAME_LENGTH = 100;

type EditRoleValues = { name: string };

function validateRole(values: EditRoleValues): FormikErrors<EditRoleValues> {
  return values.name.trim() ? {} : { name: "Вкажіть назву ролі" };
}

export default function RolePermissions(): ReactElement {
  const { canAccess } = useAccess();

  const canViewPermissions = canAccess(ACCESS_PERMISSION.VIEW_PERMISSIONS);
  const canUpdate = canAccess(ACCESS_PERMISSION.UPDATE_ROLES);

  const role = useRolesStore((state) => state.editingRole);
  const isSaving = useRolesStore((state) => state.isSaving);
  const saveError = useRolesStore((state) => state.saveError);
  const beginSave = useRolesStore((state) => state.beginSave);
  const getRoleUpdate = useRolesStore((state) => state.getRoleUpdate);
  const session = useUserStore((state) => state.authSessionId);
  const saveMutation = useMutation({
    ...getUpdateRoleMutationOptions({
      roleId: role?.id ?? "",
      session,
      onSaved: applySavedRole,
    }),
    onMutate: beginSave,
    onSettled: handleSaveFinished,
  });
  const formik = useFormik<EditRoleValues>({
    initialValues: { name: role?.name ?? "" },
    validate: validateRole,
    validateOnMount: true,
    onSubmit: handleSubmit,
  });
  const canSave =
    canUpdate &&
    formik.isValid &&
    !formik.isSubmitting &&
    !isSaving &&
    Boolean(role);

  function handleSaveFinished(): void {
    useRolesStore.getState().finishSave(role?.id ?? "", session);
  }

  function handleSaveError(error: Error): void {
    useRolesStore.getState().failSave(error, role?.id ?? "", session);
  }

  function applySavedRole(savedRole: AdminRole): void {
    useRolesStore.getState().applySavedRole(savedRole, session);
  }

  async function handleSubmit(
    values: EditRoleValues,
    helpers: FormikHelpers<EditRoleValues>,
  ): Promise<void> {
    if (!canUpdate || !role) {
      return;
    }
    try {
      const savedRole = await saveMutation.mutateAsync(
        getRoleUpdate(values.name),
      );
      helpers.resetForm({ values: { name: savedRole.name } });
    } catch (error: unknown) {
      handleSaveError(
        error instanceof Error
          ? error
          : new Error("Не вдалося зберегти роль", { cause: error }),
      );
    }
  }

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <fieldset
        className={styles.editorFieldset}
        disabled={!canUpdate || isSaving || formik.isSubmitting}
      >
        <label className={styles.label}>
          Назва ролі
          <input
            className={styles.input}
            required
            maxLength={MAX_ROLE_NAME_LENGTH}
            {...formik.getFieldProps("name")}
            aria-invalid={formik.touched.name && Boolean(formik.errors.name)}
            aria-describedby={
              formik.touched.name && formik.errors.name
                ? "edit-role-name-error"
                : undefined
            }
          />
          {formik.touched.name && formik.errors.name && (
            <span id="edit-role-name-error" role="alert">
              {formik.errors.name}
            </span>
          )}
        </label>
        <div className={styles.permissionTableScroll}>
          {canViewPermissions && <RolePermissionsTable />}
          {canUpdate && (
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primary}
                disabled={!canSave}
              >
                {isSaving ? "Збереження…" : "Зберегти"}
              </button>
            </div>
          )}
        </div>
      </fieldset>
      {saveError && (
        <p className={styles.notice} role="alert">
          {saveError.message}
        </p>
      )}
    </form>
  );
}
