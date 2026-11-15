import assert from "node:assert/strict";
import { test } from "node:test";

import { ACCESS_PERMISSION } from "../src/modules/access/model/access.constants.ts";
import {
  canAccess,
  createAppAbility,
} from "../src/modules/access/model/ability.ts";

test("no permissions grants no role actions", () => {
  const ability = createAppAbility([]);
  for (const permission of Object.values(ACCESS_PERMISSION)) {
    assert.equal(canAccess(ability, permission), false);
  }
});

test("viewing roles does not grant mutation or permission viewing", () => {
  const ability = createAppAbility(["roles.view"]);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.VIEW_ROLES), true);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.CREATE_ROLES), false);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.UPDATE_ROLES), false);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.DELETE_ROLES), false);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.VIEW_PERMISSIONS), false);
});

test("each backend slug grants only its matching action and subject", () => {
  const ability = createAppAbility([
    "roles.create",
    "roles.update",
    "permissions.view",
  ]);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.CREATE_ROLES), true);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.UPDATE_ROLES), true);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.VIEW_PERMISSIONS), true);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.DELETE_ROLES), false);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.UPDATE_PERMISSIONS), false);
});

test("duplicates are harmless and malformed or wildcard permissions grant nothing", () => {
  const ability = createAppAbility([
    "roles.view",
    "roles.view",
    "manage.all",
    "roles.manage",
    "*.delete",
    "roles.delete.extra",
    "roles.",
    ".delete",
    "",
    "roles",
  ]);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.VIEW_ROLES), true);
  assert.equal(canAccess(ability, ACCESS_PERMISSION.DELETE_ROLES), false);
});

test("a fresh permission snapshot revokes previously granted actions", () => {
  const previous = createAppAbility(["roles.view", "roles.delete"]);
  const current = createAppAbility(["roles.view"]);
  assert.equal(canAccess(previous, ACCESS_PERMISSION.DELETE_ROLES), true);
  assert.equal(canAccess(current, ACCESS_PERMISSION.DELETE_ROLES), false);
});

test("all named permissions map to their backend slugs without granting other actions", () => {
  const permissions = Object.values(ACCESS_PERMISSION);
  for (const permission of permissions) {
    const ability = createAppAbility([
      `${permission.subject}.${permission.action}`,
    ]);
    for (const candidate of permissions) {
      assert.equal(canAccess(ability, candidate), candidate === permission);
    }
  }
});
