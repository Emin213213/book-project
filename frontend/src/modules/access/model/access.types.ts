import type { MongoAbility } from "@casl/ability";

import type {
  ACCESS_ACTION,
  ACCESS_PERMISSION,
  ACCESS_SUBJECT,
} from "./access.constants";

export type AccessAction = (typeof ACCESS_ACTION)[keyof typeof ACCESS_ACTION];
export type AccessSubject =
  (typeof ACCESS_SUBJECT)[keyof typeof ACCESS_SUBJECT];
export type AccessPermission =
  (typeof ACCESS_PERMISSION)[keyof typeof ACCESS_PERMISSION];
export type AppAbility = MongoAbility<[AccessAction, AccessSubject]>;
