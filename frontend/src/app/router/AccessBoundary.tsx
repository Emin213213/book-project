import type { ReactElement, ReactNode } from "react";

import { useAccess } from "@/modules/access";
import type { AccessPermission } from "@/modules/access";

type AccessBoundaryProps = {
  readonly permission: AccessPermission;
  readonly children: ReactNode;
};

/** Закрывает прямой переход к разделу до проверки актуальных прав. */
export default function AccessBoundary({
  permission,
  children,
}: AccessBoundaryProps): ReactElement | undefined {
  const access = useAccess();
  if (access.isPending) {
    return <p role="status">Перевірка доступу…</p>;
  }
  if (access.error) {
    return (
      <div role="alert">
        <p>Не вдалося перевірити доступ.</p>
        <button type="button" onClick={access.retry}>
          Спробувати ще раз
        </button>
      </div>
    );
  }
  if (!access.canAccess(permission)) {
    return undefined;
  }
  return <>{children}</>;
}
