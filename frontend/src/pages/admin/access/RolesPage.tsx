import type { ReactElement } from "react";

import {
  ACCESS_PERMISSION,
  CreateRoleForm,
  RolesWorkspace,
  useAccess,
} from "@/modules/access";
import { useUserStore } from "@/modules/user";
import AdminCard from "@/shared/ui/admin-card/AdminCard";
import AdminHeader from "@/shared/ui/admin-header/AdminHeader";

/** Отображает форму создания роли и список с редактором разрешений. */
export default function RolesPage(): ReactElement {
  const { canAccess } = useAccess();
  const session = useUserStore((state) => state.authSessionId);

  return (
    <>
      <AdminHeader title="Ролі та дозволи" />
      {canAccess(ACCESS_PERMISSION.CREATE_ROLES) && (
        <AdminCard title="Додати роль" icon="add_moderator">
          <CreateRoleForm key={session} />
        </AdminCard>
      )}
      <RolesWorkspace />
    </>
  );
}
