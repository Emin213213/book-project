import { API_CLIENT } from "@/shared/api/apiClient";

/** Загружает актуальное объединение разрешений всех ролей пользователя. */
export async function getCurrentPermissions(
  signal?: AbortSignal,
): Promise<readonly string[]> {
  const response = await API_CLIENT.get<unknown>("/auth/permissions", {
    signal,
  });
  const body = response.data;
  if (
    typeof body !== "object" ||
    body === null ||
    !("permissions" in body) ||
    !Array.isArray(body.permissions) ||
    !body.permissions.every(
      (permission: unknown) => typeof permission === "string",
    )
  ) {
    throw new Error("Некоректна відповідь сервера з дозволами");
  }
  return body.permissions;
}
