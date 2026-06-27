// Placeholder types

export type Role = "SUPERADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
}
