import StudentGroupLessons from "../../../../components/StudentGroupLessons";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <StudentGroupLessons id={resolvedParams.id} />;
}
