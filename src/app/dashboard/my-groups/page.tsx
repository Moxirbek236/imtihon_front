"use client";

import { useAuthContext } from "@/lib/auth-provider";
import StudentMyGroups from "../../../components/StudentMyGroups";
import GroupsClient from "../../../components/GroupsClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (role === "SUPERADMIN" || role === "ADMIN" || role === "CREATOR") {
      router.replace("/dashboard/groups");
    }
  }, [role, router]);

  if (!role) return null;

  if (role === "STUDENT") {
    return <StudentMyGroups />;
  }

  if (role === "TEACHER") {
    return (
      <GroupsClient
        initialGroups={[]}
        initialPagination={{ totalPages: 1, currentPage: 1 }}
        statusFilter="active"
      />
    );
  }

  return null;
}
