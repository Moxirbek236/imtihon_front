import GroupsClient from "../../../components/GroupsClient";

export default function Page() {
  return <GroupsClient initialGroups={[]} initialPagination={{ totalPages: 1, currentPage: 1 }} searchParams={{}} statusFilter="active" />;
}
