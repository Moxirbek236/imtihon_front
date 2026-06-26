import GroupInner from "../../../../components/GroupInner";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <GroupInner id={resolvedParams.id} />;
}
