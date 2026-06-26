import { serverFetch } from "../../../api/server";
import CoursesClient from "../../../components/CoursesClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, search?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page || "1";
  const search = resolvedSearchParams?.search || "";

  let initialCourses = [];
  let initialPagination = { totalPages: 1, currentPage: 1 };

  try {
    const data = await serverFetch(`/courses/all?limit=1000&page=${page}&search=${search}`, {
      cache: "no-store"
    });
    initialCourses = data?.data || data || [];
    initialPagination = data?.pagination || { totalPages: 1, currentPage: Number(page) };
  } catch (err) {
    console.error("Error fetching courses on server", err);
  }

  return (
    <CoursesClient 
      initialCourses={initialCourses} 
      initialPagination={initialPagination} 
      searchParams={resolvedSearchParams} 
    />
  );
}
