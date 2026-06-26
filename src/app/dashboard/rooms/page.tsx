import RoomsClient from "../../../components/RoomsClient";

export default function Page() {
  return <RoomsClient initialRooms={[]} initialPagination={{ totalPages: 1, currentPage: 1 }} searchParams={{}} />;
}
