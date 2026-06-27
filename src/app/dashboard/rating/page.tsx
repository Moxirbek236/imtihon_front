"use client";

import StudentRating from "../../../components/StudentRating";
import AdminRating from "../../../components/AdminRating";
import { useAuthContext } from "@/lib/auth-provider";

export default function RatingPage() {
  const { role } = useAuthContext();
  
  if (role === "STUDENT") {
    return <StudentRating />;
  }

  return <AdminRating />;
}
