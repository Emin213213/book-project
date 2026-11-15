import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import type { AdminRole } from "../src/modules/access/model/admin-role.types.ts";
import { useRolesStore } from "../src/modules/access/model/useRolesStore.ts";

const FIRST_ROLE: AdminRole = {
  id: "first",
  name: "Editor",
  slug: "editor",
  is_system: false,
  permissions: { roles: ["view"] },
};
const SECOND_ROLE: AdminRole = {
  id: "second",
  name: "Reader",
  slug: "reader",
  is_system: false,
  permissions: {},
};
const SESSION = "session-one";

beforeEach(() => useRolesStore.setState(useRolesStore.getInitialState(), true));

test("initial permissions retain the server structure without modifying cached data", () => {
  useRolesStore.getState().openEditor(FIRST_ROLE, SESSION);
  assert.equal(useRolesStore.getState().permissions, FIRST_ROLE.permissions);
  useRolesStore.getState().togglePermission("roles", "update");
  assert.deepEqual(useRolesStore.getState().permissions.roles, [
    "view",
    "update",
  ]);
  assert.deepEqual(FIRST_ROLE.permissions.roles, ["view"]);
  useRolesStore.getState().togglePermission("roles", "view");
  assert.deepEqual(useRolesStore.getState().permissions.roles, ["update"]);
});

test("a module with no assigned permissions starts empty and can be selected", () => {
  useRolesStore.getState().openEditor(SECOND_ROLE, SESSION);
  useRolesStore.getState().togglePermission("roles", "create");
  assert.deepEqual(useRolesStore.getState().permissions, { roles: ["create"] });
  useRolesStore.getState().togglePermission("roles", "create");
  assert.deepEqual(useRolesStore.getState().permissions.roles, []);
});

test("refetching the same role preserves its draft; switching discards it", () => {
  useRolesStore.getState().openEditor(FIRST_ROLE, SESSION);
  useRolesStore.getState().togglePermission("roles", "update");
  useRolesStore.getState().openEditor({ ...FIRST_ROLE }, SESSION);
  assert.deepEqual(useRolesStore.getState().permissions.roles, [
    "view",
    "update",
  ]);
  useRolesStore.getState().openEditor(SECOND_ROLE, SESSION);
  useRolesStore.getState().openEditor(FIRST_ROLE, SESSION);
  assert.deepEqual(useRolesStore.getState().permissions.roles, ["view"]);
});

test("late save responses and failures do not change another role's draft", () => {
  useRolesStore.getState().openEditor(FIRST_ROLE, SESSION);
  useRolesStore.getState().beginSave();
  useRolesStore.getState().openEditor(SECOND_ROLE, SESSION);
  useRolesStore.getState().applySavedRole(FIRST_ROLE, SESSION);
  useRolesStore
    .getState()
    .failSave(new Error("failed"), FIRST_ROLE.id, SESSION);
  assert.equal(useRolesStore.getState().editingRole?.id, SECOND_ROLE.id);
  assert.equal(useRolesStore.getState().saveError, undefined);
});

test("a previous session cannot apply its save response to the current draft", () => {
  useRolesStore.getState().openEditor(FIRST_ROLE, "new-session");
  useRolesStore
    .getState()
    .applySavedRole({ ...FIRST_ROLE, name: "Old response" }, SESSION);
  assert.equal(useRolesStore.getState().editingRole?.name, FIRST_ROLE.name);
});

test("saving remains locked through cache refresh; editing clears the success message", () => {
  useRolesStore.getState().openEditor(FIRST_ROLE, SESSION);
  useRolesStore.getState().beginSave();
  useRolesStore.getState().applySavedRole(FIRST_ROLE, SESSION);
  assert.equal(useRolesStore.getState().isSaving, true);
  useRolesStore.getState().finishSave(FIRST_ROLE.id, SESSION);
  assert.equal(useRolesStore.getState().isSaving, false);
  assert.equal(useRolesStore.getState().isSaved, true);
  useRolesStore.getState().togglePermission("roles", "delete");
  assert.equal(useRolesStore.getState().isSaved, false);
});

test("reset removes the selected role, search, draft and request status", () => {
  useRolesStore.getState().selectRole(FIRST_ROLE.id);
  useRolesStore.getState().changeSearch("Editor");
  useRolesStore.getState().openEditor(FIRST_ROLE, SESSION);
  useRolesStore.getState().beginSave();
  useRolesStore.getState().reset();
  assert.equal(useRolesStore.getState().selectedRoleId, undefined);
  assert.equal(useRolesStore.getState().editingRole, undefined);
  assert.equal(useRolesStore.getState().search, "");
  assert.equal(useRolesStore.getState().isSaving, false);
  assert.deepEqual(useRolesStore.getState().permissions, {});
});
