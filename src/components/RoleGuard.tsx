import { ReactNode } from "react";
import { useAuthContext } from "@/lib/auth-provider";
import { Role } from "@/lib/api/types";

interface RoleGuardProps {
  children: ReactNode;
  roles: Role[];
  fallback?: ReactNode;
}

export default function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { role, isReady } = useAuthContext();

  if (!isReady || !role) {
    return <>{fallback}</>;
  }

  const normalizedRole = role.toUpperCase() as Role;
  if (!roles.includes(normalizedRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
