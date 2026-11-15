import { GUARDS_METADATA } from "@nestjs/common/constants";

import { AuthContext } from "@/common/application/auth/auth-context";
import { AuthUser } from "@/common/application/auth/auth-user";
import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { Email } from "@/user/domain/value-objects/email.vo";
import { AuthGuard } from "@/user/infrastructure/http/guards/auth.guard";
import { CurrentAccessController } from "./current-access.controller";

const USER = new AuthUser(
  Uuid.fromString("11111111-1111-4111-8111-111111111111"),
  new Email("reader@example.com"),
);

describe("CurrentAccessController", () => {
  it("returns the permissions already calculated by AuthGuard", () => {
    const permissions = new Set(["roles.view", "permissions.view"]);
    const auth = new AuthContext(USER, undefined, permissions);
    const result = new CurrentAccessController().getPermissions({ auth });
    expect(result.permissions).toEqual(["roles.view", "permissions.view"]);
    expect(permissions.size).toBe(2);
  });

  it("returns an empty list when no permissions are assigned", () => {
    const auth = new AuthContext(USER);
    expect(new CurrentAccessController().getPermissions({ auth })).toEqual({
      permissions: [],
    });
  });

  it("requires authentication independently of permissions", () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, CurrentAccessController),
    ).toContain(AuthGuard);
  });
});
