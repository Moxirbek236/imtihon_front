import { serverFetch } from "../../../api/server";
import RoomsClient from "../../../components/RoomsClient";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, search?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page || "1";
  const search = resolvedSearchParams?.search || "";

  let initialRooms = [];
  let initialPagination = { totalPages: 1, currentPage: 1 };

  try {
    const data = await serverFetch(`/rooms?limit=1000&page=${page}&search=${search}`, {
      cache: "no-store"
    });
    initialRooms = data?.data || data || [];
    initialPagination = data?.pagination || { totalPages: 1, currentPage: Number(page) };
  } catch (err) {
    console.error("Error fetching rooms on server", err);
  }

  return (
    <RoomsClient 
      initialRooms={initialRooms} 
      initialPagination={initialPagination} 
      searchParams={resolvedSearchParams} 
    />
  );
}
