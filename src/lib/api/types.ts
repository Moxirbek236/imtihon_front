// Placeholder types

export type Role = "superadmin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
}
