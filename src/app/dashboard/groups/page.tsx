import GroupsClient from "../../../components/GroupsClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GroupsClient
        initialGroups={[]}
        initialPagination={{ totalPages: 1, currentPage: 1 }}
        statusFilter="all"
      />
    </Suspense>
  );
}
