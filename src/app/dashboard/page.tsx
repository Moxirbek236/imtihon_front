"use client";

import { useEffect, useState } from "react";
import DashboardHome from "../../components/DashboardHome";
import StudentDashboardHome from "../../components/StudentDashboardHome";

export default function Page() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  if (role === "STUDENT") {
    return <StudentDashboardHome />;
  }

  return <DashboardHome />;
}
