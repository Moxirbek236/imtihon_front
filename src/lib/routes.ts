export type AppRole = "SUPERADMIN" | "TEACHER" | "STUDENT";

export function normalizeRole(role: string | null | undefined): AppRole | null {
  if (!role) return null;
  const upper = role.toUpperCase();
  if (upper === "SUPERADMIN" || upper === "ADMIN") return "SUPERADMIN";
  if (upper === "TEACHER") return "TEACHER";
  if (upper === "STUDENT") return "STUDENT";
  return null;
}

export function getHomeRouteForRole(role: string | null | undefined): string {
  switch (normalizeRole(role)) {
    case "TEACHER":
      return "/dashboard/groups";
    case "STUDENT":
      return "/dashboard/my-groups";
    case "SUPERADMIN":
    default:
      return "/dashboard";
  }
}

export function parseLoginResponse(data: Record<string, unknown> | null | undefined) {
  const payload = (data?.data as Record<string, unknown> | undefined) ?? data ?? {};
  const token =
    (payload.accessToken as string | undefined) ||
    (payload.token as string | undefined) ||
    (data?.accessToken as string | undefined) ||
    (data?.token as string | undefined);
  const role =
    (payload.role as string | undefined) ||
    (data?.role as string | undefined) ||
    null;
  const user = payload.user ?? data?.user ?? null;
  const success = !!token || data?.success === true;

  return { token, role, user, success };
}

export function persistAuthSession(token: string, role: string | null | undefined, user?: unknown) {
  const normalizedRole = normalizeRole(role);
  localStorage.setItem("token", token);
  if (normalizedRole) {
    localStorage.setItem("role", normalizedRole);
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
}
