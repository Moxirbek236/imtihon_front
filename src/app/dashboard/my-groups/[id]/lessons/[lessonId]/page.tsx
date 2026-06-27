import StudentLessonInner from "../../../../../../components/StudentLessonInner";

export default async function Page({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const resolvedParams = await params;
  return <StudentLessonInner groupId={resolvedParams.id} lessonId={resolvedParams.lessonId} />;
}
