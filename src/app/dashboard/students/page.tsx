import StudentsClient from "../../../components/StudentsClient";

export default function Page() {
  return <StudentsClient initialStudents={[]} initialPagination={{ totalPages: 1, currentPage: 1 }} searchParams={{}} />;
}
