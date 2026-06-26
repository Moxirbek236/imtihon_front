import TeachersClient from "../../../components/TeachersClient";

export default function Page() {
  return <TeachersClient initialTeachers={[]} initialPagination={{ totalPages: 1, currentPage: 1 }} searchParams={{}} />;
}
