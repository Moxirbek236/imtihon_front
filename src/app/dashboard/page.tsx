"use client";

import { useEffect } from "react";
import DashboardHome from "../../components/DashboardHome";
import StudentDashboardHome from "../../components/StudentDashboardHome";
import { useAuthContext } from "@/lib/auth-provider";
import { useRouter } from "next/navigation";

export default function Page() {
  const { role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (role === "TEACHER") {
      router.replace("/dashboard/my-groups");
    }
  }, [role, router]);

  if (!role) return null;

  if (role === "STUDENT") {
    return <StudentDashboardHome />;
  }

  if (role === "TEACHER") {
    return null; // redirecting
  }

  return <DashboardHome />;
}
