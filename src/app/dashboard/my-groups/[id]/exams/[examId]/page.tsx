import StudentExamInner from "../../../../../../components/StudentExamInner";

export default async function Page({ params }: { params: Promise<{ id: string; examId: string }> }) {
  const resolvedParams = await params;
  return <StudentExamInner groupId={resolvedParams.id} examId={resolvedParams.examId} />;
}
