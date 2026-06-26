import { serverFetch } from "../../../api/server";
import StudentsClient from "../../../components/StudentsClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, search?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page || "1";
  const search = resolvedSearchParams?.search || "";

  let initialStudents = [];
  let initialPagination = { totalPages: 1, currentPage: 1 };

  try {
    const data = await serverFetch(`/students/all?page=${page}&limit=10&search=${search}`, {
      cache: "no-store"
    });
    initialStudents = data?.data || data || [];
    initialPagination = data?.pagination || { totalPages: 1, currentPage: Number(page) };
  } catch (err) {
    console.error("Error fetching students on server", err);
  }

  return (
    <StudentsClient 
      initialStudents={initialStudents} 
      initialPagination={initialPagination} 
      searchParams={resolvedSearchParams}
    />
  );
}
