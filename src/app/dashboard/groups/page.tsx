import { serverFetch } from "../../../api/server";
import GroupsClient from "../../../components/GroupsClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, search?: string, status?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page || "1";
  const search = resolvedSearchParams?.search || "";
  const status = resolvedSearchParams?.status || "active";

  let initialGroups = [];
  let initialPagination = { totalPages: 1, currentPage: 1 };

  try {
    const data = await serverFetch(`/groups/all?page=${page}&limit=10&search=${search}&status=${status}`, {
      cache: "no-store"
    });
    initialGroups = data?.data || data || [];
    initialPagination = data?.pagination || { totalPages: 1, currentPage: Number(page) };
  } catch (err) {
    console.error("Error fetching groups on server", err);
  }

  return (
    <GroupsClient 
      initialGroups={initialGroups} 
      initialPagination={initialPagination} 
      searchParams={resolvedSearchParams}
      statusFilter={status}
    />
  );
}
