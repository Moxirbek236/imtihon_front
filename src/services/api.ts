import axiosClient from '@/api/axios';
import { Role } from '@/lib/api/types';

export const unwrap = <T>(res: { data: { data: T } }) => res.data.data as T;

export const groupsApi = {
  list: (role: Role | null) => {
    let url = '/groups';
    if (role === 'TEACHER') url = '/teachers/my/groups';
    else if (role === 'STUDENT') url = '/students/my/groups';
    return axiosClient.get(url).then(unwrap);
  },
  getOne: (id: string) => axiosClient.get(`/groups/${id}`).then(unwrap),
  getSchedule: (id: string) => axiosClient.get(`/groups/${id}/schedule`).then(unwrap),
  getStudents: (groupId: string, role: Role | null) => {
    if (role === 'TEACHER') return axiosClient.get(`/teachers/group/students?groupId=${groupId}`).then(unwrap);
    return Promise.resolve([]); // Not explicitly needed for students/admins based on spec, but can adapt
  },
  getTeachers: (groupId: string, role: Role | null) => {
    if (role === 'STUDENT') return axiosClient.get(`/students/my/group/${groupId}/teachers`).then(unwrap);
    return Promise.resolve([]);
  }
};

export const lessonsApi = {
  list: (groupId: string, role: Role | null) => {
    if (role === 'STUDENT') return axiosClient.get(`/students/my/group/${groupId}/lessons`).then(unwrap);
    return axiosClient.get(`/lesson?groupId=${groupId}`).then(unwrap); // TEACHER and ADMIN use lesson
  },
  create: (data: any) => axiosClient.post('/lesson', data).then(unwrap),
  update: (id: string, data: any) => axiosClient.put(`/lesson/${id}`, data).then(unwrap),
  delete: (id: string) => axiosClient.delete(`/lesson/${id}`).then(unwrap)
};

export const attendancesApi = {
  create: (data: { lessonId: string, presentStudentIds: number[] }) => axiosClient.post('/attendances', data).then(unwrap),
  getByDate: (groupId: string, date: string) => axiosClient.get(`/attendances/by-date?groupId=${groupId}&date=${date}`).then(unwrap),
  getMatrix: (groupId: string) => axiosClient.get(`/groups/${groupId}/student-attendances`).then(unwrap)
};

export const homeworksApi = {
  create: (data: any) => axiosClient.post('/home-works', data).then(unwrap),
  listGroup: (groupId: string) => axiosClient.get(`/home-works/group/${groupId}`).then(unwrap),
  getOne: (id: string) => axiosClient.get(`/home-works/${id}`).then(unwrap),
  getSubmissions: (hwId: string) => axiosClient.get(`/home-works/${hwId}/submissions`).then(unwrap), // TEACHER
  getStudentSubmission: (hwId: string, studentId: string) => axiosClient.get(`/home-works/${hwId}/student/${studentId}`).then(unwrap), // STUDENT
  submit: (hwId: string, data: any) => axiosClient.post(`/home-works/${hwId}/submit`, data).then(unwrap),
  grade: (hwId: string, answerId: string, data: { score: number, status: string, comment?: string }) => axiosClient.post(`/home-works/${hwId}/grade/${answerId}`, data).then(unwrap),
  update: (id: string, data: any) => axiosClient.put(`/home-works/${id}`, data).then(unwrap),
  delete: (id: string) => axiosClient.delete(`/home-works/${id}`).then(unwrap)
};

export const examsApi = {
  create: (data: any) => axiosClient.post('/exams', data).then(unwrap),
  listGroup: (groupId: string) => axiosClient.get(`/exams/group/${groupId}`).then(unwrap),
  getSubmissions: (examId: string) => axiosClient.get(`/exams/${examId}/submissions`).then(unwrap),
  grade: (answerId: string, data: any) => axiosClient.post(`/exams/submissions/${answerId}/grade`, data).then(unwrap),
  publish: (examId: string) => axiosClient.post(`/exams/${examId}/publish`).then(unwrap),
  update: (id: string, data: any) => axiosClient.put(`/exams/${id}`, data).then(unwrap),
  delete: (id: string) => axiosClient.delete(`/exams/${id}`).then(unwrap)
};

export const videosApi = {
  listGroup: (groupId: string) => axiosClient.get(`/videos/group/${groupId}`).then(unwrap),
  create: (data: any) => axiosClient.post('/videos', data).then(unwrap),
  delete: (id: string) => axiosClient.delete(`/videos/${id}`).then(unwrap)
};

export const profileApi = {
  get: (role: Role | null) => {
    return axiosClient.get('/auth/profile').then(unwrap);
  }
};
