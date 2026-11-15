import { createMongoAbility } from "@casl/ability";
import { ACCESS_ACTION, ACCESS_SUBJECT } from "./access.constants.ts";
import type {
  AccessAction,
  AccessPermission,
  AccessSubject,
  AppAbility,
} from "./access.types";

const ACCESS_ACTIONS: readonly string[] = Object.values(ACCESS_ACTION);
const ACCESS_SUBJECTS: readonly string[] = Object.values(ACCESS_SUBJECT);

/** Преобразует серверные module.action в правила CASL; неизвестные права не дают доступа. */
export function createAppAbility(permissions: readonly string[]): AppAbility {
  const rules = permissions.flatMap((permission) => {
    const [subject, action, extra] = permission.split(".");
    if (extra !== undefined || !isAction(action) || !isSubject(subject)) {
      return [];
    }
    return [{ action, subject }];
  });
  return createMongoAbility<[AccessAction, AccessSubject]>(rules);
}

function isAction(action: string | undefined): action is AccessAction {
  return action !== undefined && ACCESS_ACTIONS.includes(action);
}

function isSubject(subject: string | undefined): subject is AccessSubject {
  return subject !== undefined && ACCESS_SUBJECTS.includes(subject);
}

/** Проверяет именованное разрешение через CASL. */
export function canAccess(
  ability: AppAbility,
  permission: AccessPermission,
): boolean {
  return ability.can(permission.action, permission.subject);
}
