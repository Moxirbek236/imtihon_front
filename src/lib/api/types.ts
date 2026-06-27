// Placeholder types

export type Role = "CREATOR" | "SUPERADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
}
