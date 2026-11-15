import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import type { FormikErrors, FormikHelpers } from "formik";
import type { ReactElement } from "react";

import Icon from "@/shared/ui/Icon";
import { getCreateRoleMutationOptions } from "../../api/roleMutationOptions";
import { ACCESS_PERMISSION } from "../../model/access.constants";
import { useAccess } from "../../model/useAccess";
import { useRolesStore } from "../../model/useRolesStore";
import styles from "./CreateRoleForm.module.css";

const MAX_ROLE_NAME_LENGTH = 100;
const MAX_ROLE_SLUG_LENGTH = 255;
const INITIAL_VALUES = { name: "", slug: "" };

type CreateRoleValues = { name: string; slug: string };

function validateRole(
  values: CreateRoleValues,
): FormikErrors<CreateRoleValues> {
  const errors: FormikErrors<CreateRoleValues> = {};
  if (!values.name.trim()) {
    errors.name = "Вкажіть назву ролі";
  }
  if (!values.slug.trim()) {
    errors.slug = "Вкажіть унікальний код ролі";
  }
  return errors;
}

/** Отправляет название и slug новой роли; состоянием полей управляет Formik. */
export default function CreateRoleForm(): ReactElement {
  const { canAccess } = useAccess();

  const selectCreatedRole = useRolesStore((state) => state.selectCreatedRole);

  const mutation = useMutation(getCreateRoleMutationOptions(selectCreatedRole));

  const formik = useFormik<CreateRoleValues>({
    initialValues: INITIAL_VALUES,
    validate: validateRole,
    validateOnMount: true,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(
    values: CreateRoleValues,
    helpers: FormikHelpers<CreateRoleValues>,
  ): Promise<void> {
    if (!canAccess(ACCESS_PERMISSION.CREATE_ROLES)) {
      helpers.setStatus("Немає дозволу на створення ролей");
      return;
    }
    helpers.setStatus(undefined);
    try {
      await mutation.mutateAsync({
        name: values.name.trim(),
        slug: values.slug.trim(),
      });
      helpers.resetForm();
    } catch (error: unknown) {
      helpers.setStatus(
        error instanceof Error ? error.message : "Не вдалося створити роль",
      );
    }
  }

  return (
    <form className={styles.addForm} onSubmit={formik.handleSubmit}>
      <fieldset className={styles.fields} disabled={formik.isSubmitting}>
        <div className={styles.formGrid}>
          <label className={styles.group}>
            <span className={styles.label}>
              Назва <span className={styles.required}>*</span>
            </span>
            <input
              {...formik.getFieldProps("name")}
              className={styles.input}
              type="text"
              required
              maxLength={MAX_ROLE_NAME_LENGTH}
              placeholder="Назва ролі…"
              aria-invalid={formik.touched.name && Boolean(formik.errors.name)}
              aria-describedby={
                formik.touched.name && formik.errors.name
                  ? "role-name-error"
                  : undefined
              }
            />
            {formik.touched.name && formik.errors.name && (
              <span id="role-name-error" className={styles.fieldError}>
                {formik.errors.name}
              </span>
            )}
          </label>
          <label className={styles.group}>
            <span className={styles.label}>
              Slug (унікальний код) <span className={styles.required}>*</span>
            </span>
            <input
              {...formik.getFieldProps("slug")}
              className={styles.input}
              type="text"
              required
              maxLength={MAX_ROLE_SLUG_LENGTH}
              placeholder="Наприклад, editor"
              aria-invalid={formik.touched.slug && Boolean(formik.errors.slug)}
              aria-describedby={
                formik.touched.slug && formik.errors.slug
                  ? "role-slug-error"
                  : undefined
              }
            />
            {formik.touched.slug && formik.errors.slug && (
              <span id="role-slug-error" className={styles.fieldError}>
                {formik.errors.slug}
              </span>
            )}
          </label>
        </div>
        <div className={styles.formActions}>
          <button
            className={styles.btnPrimary}
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            <Icon name="add_moderator" />
            {formik.isSubmitting ? "Створення…" : "Додати"}
          </button>
        </div>
      </fieldset>
      {typeof formik.status === "string" && (
        <p className={styles.error} role="alert">
          {formik.status}
        </p>
      )}
    </form>
  );
}
