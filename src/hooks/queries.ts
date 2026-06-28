import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/lib/auth-provider';
import { groupsApi, lessonsApi, homeworksApi, attendancesApi, examsApi, videosApi, profileApi } from '@/services/api';

export const useGroups = () => {
  const { role } = useAuthContext();
  return useQuery({
    queryKey: ['groups', role],
    queryFn: () => groupsApi.list(role),
    enabled: !!role,
    staleTime: 30_000,
    refetchOnMount: false,
  });
};

export const useGroupDetails = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getOne(groupId),
    enabled: !!groupId,
    staleTime: 30_000,
    refetchOnMount: false,
  });
};

export const useGroupStudents = (groupId: string) => {
  const { role } = useAuthContext();
  return useQuery({
    queryKey: ['group-students', groupId, role],
    queryFn: () => groupsApi.getStudents(groupId, role),
    enabled: !!groupId && !!role,
    staleTime: 30_000,
    refetchOnMount: false,
  });
};

export const useGroupTeachers = (groupId: string) => {
  const { role } = useAuthContext();
  return useQuery({
    queryKey: ['group-teachers', groupId, role],
    queryFn: () => groupsApi.getTeachers(groupId, role),
    enabled: !!groupId && !!role,
    staleTime: 30_000,
    refetchOnMount: false,
  });
};

export const useLessons = (groupId: string) => {
  const { role } = useAuthContext();
  return useQuery({
    queryKey: ['lessons', groupId, role],
    queryFn: () => lessonsApi.list(groupId, role),
    enabled: !!groupId && !!role,
    staleTime: 30_000,
    refetchOnMount: false,
  });
};

export const useHomeworks = (groupId: string) => {
  return useQuery({
    queryKey: ['homeworks', groupId],
    queryFn: () => homeworksApi.listGroup(groupId),
    enabled: !!groupId,
  });
};

export const useHomeworkSubmissions = (hwId: string) => {
  return useQuery({
    queryKey: ['homework-submissions', hwId],
    queryFn: () => homeworksApi.getSubmissions(hwId),
    enabled: !!hwId,
  });
};

export const useAttendancesMatrix = (groupId: string) => {
  return useQuery({
    queryKey: ['attendances-matrix', groupId],
    queryFn: () => attendancesApi.getMatrix(groupId),
    enabled: !!groupId,
  });
};

export const useProfile = () => {
  const { role } = useAuthContext();
  return useQuery({
    queryKey: ['profile', role],
    queryFn: () => profileApi.get(role),
    enabled: !!role,
    staleTime: 30_000,
    refetchOnMount: false,
  });
};
