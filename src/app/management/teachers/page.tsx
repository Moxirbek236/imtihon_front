import { serverFetch } from "../../../api/server";
import TeachersClient from "../../../components/TeachersClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, search?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page || "1";
  const search = resolvedSearchParams?.search || "";

  let initialTeachers = [];
  let initialPagination = { totalPages: 1, currentPage: 1 };

  try {
    const data = await serverFetch(`/teachers?limit=1000&page=${page}&search=${search}`, {
      cache: "no-store"
    });
    initialTeachers = data?.data || data || [];
    initialPagination = data?.pagination || { totalPages: 1, currentPage: Number(page) };
  } catch (err) {
    console.error("Error fetching teachers on server", err);
  }

  return (
    <TeachersClient 
      initialTeachers={initialTeachers} 
      initialPagination={initialPagination} 
      searchParams={resolvedSearchParams} 
    />
  );
}
