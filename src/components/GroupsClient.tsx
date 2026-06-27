"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";
import {
  Add,
  ArchiveOutlined,
  CalendarTodayOutlined,
  Close,
  GroupsOutlined,
  MoreVert,
  PeopleAltOutlined,
  Refresh,
  SchoolOutlined,
  Search,
  TimerOutlined,
  Delete,
  Edit,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

const dayOptions = [
  { label: "Dushanba", value: "Monday", short: "Du" },
  { label: "Seshanba", value: "Tuesday", short: "Se" },
  { label: "Chorshanba", value: "Wednesday", short: "Chor" },
  { label: "Payshanba", value: "Thursday", short: "Pay" },
  { label: "Juma", value: "Friday", short: "Ju" },
  { label: "Shanba", value: "Saturday", short: "Shan" },
  { label: "Yakshanba", value: "Sunday", short: "Yak" },
];

const initialForm: {
  name: string;
  course_id: string;
  room_id: string;
  week_day: string[];
  start_time: string;
  start_date: string;
  description: string;
  teachers: number[];
  students: number[];
  max_student: number;
} = {
  name: "",
  course_id: "",
  room_id: "",
  week_day: [],
  start_time: "09:00",
  start_date: "",
  description: "",
  teachers: [],
  students: [],
  max_student: 20,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 38,
    borderRadius: 2,
    fontSize: 13,
    bgcolor: "white",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#d1d5db" },
    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
  },
  "& .MuiInputBase-input": {
    py: 1,
  },
};

const labelSx = {
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  mb: 0.7,
};

function getData(payload) {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}


function getDays(days) {
  if (!Array.isArray(days) || !days.length) return "-";
  return days
    .map((day) => dayOptions.find((item) => item.value === day)?.short || day)
    .join(", ");
}

export default function GroupsClient({ initialGroups, initialPagination, statusFilter }) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [groups, setGroups] = useState(initialGroups || []);
  const [courses, setCourses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" | "info" }>({ open: false, message: "", severity: "error" });
  
  const [page, setPage] = useState(() => Number(urlSearchParams.get("page")) || initialPagination?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [searchQuery, setSearchQuery] = useState(() => urlSearchParams.get("search") || "");
  const [editId, setEditId] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    console.log("Role from localStorage:", role);
    setCurrentRole(role);
  }, []);

  const displayedGroups = useMemo(() => {
    const arr = Array.isArray(groups) ? groups : [];
    console.log("Groups before filter:", arr);
    console.log("Status filter:", statusFilter, "Current role:", currentRole);
    
    if (currentRole === "TEACHER") {
      if (statusFilter === "planned") {
        const filtered = arr.filter(g => g.status === "planned");
        console.log("Filtered by planned:", filtered);
        return filtered;
      } else {
        const filtered = arr.filter(g => g.status === "active" || !g.status);
        console.log("Filtered by active:", filtered);
        return filtered;
      }
    }
    console.log("Returning all groups:", arr);
    return arr;
  }, [groups, statusFilter, currentRole]);



  const handleCloseAlert = (event: any, reason?: string) => {
    if (reason === "clickaway") return;
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const courseMap = useMemo(() => {
    return courses.reduce((acc, course) => {
      acc[course.id] = course;
      return acc;
    }, {});
  }, [courses]);

  const selectedCourse = courseMap[form.course_id];

  useEffect(() => {
    if (isDrawerOpen) {
      const getApi = async () => {
        try {
          const coursesRes = await axiosClient.get("/courses/all?limit=1000");
          if(coursesRes?.data?.success) setCourses(coursesRes.data.data);
          
          const roomsRes = await axiosClient.get("/rooms?limit=1000");
          if(roomsRes?.data?.success) setRooms(roomsRes.data.data);
        } catch (error) {
          console.error(error);
        }
      };
      getApi();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isTeacherModalOpen) return;
    if (teacherSearch.trim().length < 3) {
      setTeachers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/teachers?search=${teacherSearch.trim()}`);
        if(res?.data?.success) setTeachers(res.data.data);
      } catch (error) {
        console.error(error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [teacherSearch, isTeacherModalOpen]);

  useEffect(() => {
    if (!isStudentModalOpen) return;
    if (studentSearch.trim().length < 3) {
      setStudents([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/students/all?search=${studentSearch.trim()}`);
        if(res?.data?.success) setStudents(res.data.data);
      } catch (error) {
        console.error(error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [studentSearch, isStudentModalOpen]);

  useEffect(() => {
    // Client-side fetch: server props bo'lmaganda o'zida fetch qiladi
    async function fetchGroups() {
      try {
        const role = currentRole?.toUpperCase();
        let endpoint;
        
        // Role-based endpoint routing
        if (role === "TEACHER") {
          endpoint = "/teachers/my/groups";
        } else if (role === "STUDENT") {
          endpoint = "/students/my/groups";
        } else {
          // SUPERADMIN or ADMIN
          endpoint = `/groups?page=${page}&limit=10`;
        }
        
        console.log("Current role:", currentRole, "Endpoint:", endpoint);
        const res = await axiosClient.get(endpoint);
        console.log("API Response:", res.data);
        
        if (res.data?.success) {
          const rawData = res.data.data || [];
          console.log("Raw data:", rawData);
          
          // Map API response to frontend structure based on role
          const mappedData = rawData.map((group) => {
            if (role === "TEACHER" || role === "STUDENT") {
              // Teacher/Student API returns different structure
              return {
                ...group,
                course: {
                  name: group.course,
                  duration_month: group.course_duration
                },
                teachers: group.teachers || [],
                student_count: group.students || 0
              };
            }
            return group;
          });
          
          console.log("Mapped data:", mappedData);
          setGroups(mappedData);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error("Guruhlar yuklanmadi:", err);
      }
    }
    // Only fetch if currentRole is set
    if (currentRole !== null) {
      fetchGroups();
    }
  }, [page, searchQuery, statusFilter, currentRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextQuery = new URLSearchParams({
        page: String(page),
        search: searchQuery,
        status: statusFilter || "active",
      }).toString();

      if (urlSearchParams.toString() !== nextQuery) {
        router.replace(`?${nextQuery}`);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery, statusFilter, router, urlSearchParams]);

  const stats = useMemo(() => {
    const uniqueTeacherIds = new Set();
    displayedGroups.forEach((group) => {
      group.groupTeachers?.forEach((item) => {
        if (item.teacher?.id) uniqueTeacherIds.add(item.teacher.id);
      });
    });

    let studentCount = 0;
    if (currentRole === "TEACHER") {
      studentCount = displayedGroups.reduce((acc, g) => acc + (g.student_count || 0), 0);
    } else {
      studentCount = students.length;
    }

    return {
      groupCount: displayedGroups.length,
      teacherCount: currentRole === "TEACHER" ? 1 : (uniqueTeacherIds.size || teachers.length),
      studentCount: studentCount,
    };
  }, [displayedGroups, students.length, teachers.length, currentRole]);

  const filteredTeachers = teachers;

  const filteredStudents = students;

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      week_day: prev.week_day.includes(day)
        ? prev.week_day.filter((item) => item !== day)
        : [...prev.week_day, day],
    }));
  };

  const toggleArrayItem = (key, id) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((item) => item !== id)
        : [...prev[key], id],
    }));
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTeacherSearch("");
    setStudentSearch("");
  };

  async function handleCreateGroup() {
    const payload = {
      name: form.name,
      description: form.description,
      course_id: Number(form.course_id),
      room_id: Number(form.room_id),
      start_date: form.start_date,
      week_day: form.week_day,
      start_time: form.start_time,
      teachers: form.teachers,
      students: form.students,
      max_students: Number(form.max_student) || 20,
    };
    setForm(initialForm);
    setEditId(null);
  };

  const handleEditOpen = (group) => {
    setForm({
      name: group.name,
      course_id: group.course_id || "",
      room_id: group.rooms_id || "",
      week_day: group.week_day || [],
      start_time: group.start_time || "09:00",
      start_date: group.start_date ? group.start_date.split("T")[0] : "",
      description: group.description || "",
      teachers: group.teachers?.map(t => t.id) || [],
      students: [],
      max_student: group.max_students || 20,
    });
    setEditId(group.id);
    setIsDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await axiosClient.delete(`/groups/${deleteId}`);
      if (res.data?.success) {
        setIsDeleteDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.course_id || !form.room_id || form.week_day.length === 0 || !form.start_date) {
        setAlert({ open: true, message: "Iltimos barcha majburiy maydonlarni to'ldiring!", severity: "error" });
        return;
      }
      
      const payload = {
        name: form.name,
        description: form.description,
        course_id: Number(form.course_id),
        room_id: Number(form.room_id),
        start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
        week_day: form.week_day,
        start_time: form.start_time,
        teachers: form.teachers,
        students: form.students,
        max_students: Number(form.max_student) || 20,
      };
      if (editId) {
        const res = await axiosClient.put(`/groups/${editId}`, payload);
        if (res.data?.success) {
          closeDrawer();
          router.refresh();
        } else {
          setAlert({ open: true, message: res.data?.message || "Xatolik yuz berdi", severity: "error" });
        }
      } else {
        const res = await axiosClient.post("/groups", payload);
        if (res.data?.success) {
          closeDrawer();
          router.refresh();
        } else {
          setAlert({ open: true, message: res.data?.message || "Xatolik yuz berdi", severity: "error" });
        }
      }
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || "Serverda xatolik yuz berdi", severity: "error" });
    }
  };

  const renderTeacherNames = (group) => {
    const names = group.teachers?.map((item) => item.teacher?.full_name).filter(Boolean);
    if (!names?.length) return "O'qituvchi yo'q";
    return names;
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: { xs: 2, lg: 3 },
        py: 2.5,
        boxSizing: "border-box",
        bgcolor: "#f3f4f6",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.3,
        }}
      >
        <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#111827", letterSpacing: 0 }}>
          {statusFilter === "planned" ? "Yig'ilayotgan guruhlar" : "Guruhlar"}
        </Typography>
        {currentRole !== "TEACHER" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              py: 1,
              boxShadow: "0 10px 22px rgba(124,58,237,0.22)",
            }}
          >
            Guruh qo'shish
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.4 }}>
        <TextField
          size="small"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          sx={{ bgcolor: "white", borderRadius: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <Button
          variant="contained"
          disableElevation
          sx={{
            minHeight: 33,
            bgcolor: "white",
            color: "#111827",
            border: "1px solid #e5e7eb",
            textTransform: "none",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 1.5,
            px: 1.6,
            "&:hover": { bgcolor: "white" },
          }}
        >
          Guruhlar
        </Button>
        <Button
          startIcon={<ArchiveOutlined sx={{ fontSize: 17 }} />}
          sx={{
            minHeight: 33,
            color: "#111827",
            textTransform: "none",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 1.5,
            px: 1.1,
            "&:hover": { bgcolor: "#ede9fe" },
          }}
        >
          Arxiv
        </Button>
      </Box>

      {currentRole !== "TEACHER" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            mb: 2,
          }}
        >
          {[
            {
              label: "Jami guruhlar",
              value: stats.groupCount,
              icon: <PeopleAltOutlined sx={{ fontSize: 21 }} />,
            },
            {
              label: "O'qituvchilar",
              value: stats.teacherCount,
              icon: <GroupsOutlined sx={{ fontSize: 21 }} />,
            },
            {
              label: "O'quvchilar",
              value: stats.studentCount,
              icon: <SchoolOutlined sx={{ fontSize: 21 }} />,
              avatars: true,
            },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                bgcolor: "white",
                minHeight: 118,
                borderRadius: 3,
                border: "1px solid #eef0f4",
                boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
                p: 2.2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 11,
                  right: 10,
                  color: "#9ca3af",
                  p: 0.2,
                }}
              >
                <MoreVert sx={{ fontSize: 17 }} />
              </IconButton>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #eef2f7",
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.2, fontWeight: 500 }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                    {item.value}
                  </Typography>
                  {item.avatars && (
                    <Box sx={{ display: "flex", alignItems: "center", pr: 1.2 }}>
                      {["I", "M", "S"].map((name, index) => (
                        <Avatar
                          key={name}
                          sx={{
                            width: 23,
                            height: 23,
                            ml: index ? -0.8 : 0,
                            bgcolor: ["#111827", "#f97316", "#ec4899"][index],
                            color: "white",
                            fontSize: 10,
                            fontWeight: 700,
                            border: "2px solid white",
                          }}
                        >
                          {name}
                        </Avatar>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          bgcolor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 1180 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 42px",
                minHeight: 48,
                alignItems: "center",
                px: 1.8,
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #eef0f4",
              }}
            >
              {[
                "Status",
                "Guruh nomi",
                "Kurs",
                "Davomiyligi",
                "Dars vaqti",
                "Xona",
                "O'qituvchi",
                "Talabalar",
              ].map((header) => (
                <Typography key={header} sx={{ fontSize: 11, fontWeight: 600, color: "#4b5563", textAlign: "center" }}>
                  {header}
                </Typography>
              ))}
              <IconButton size="small" onClick={() => router.refresh()} sx={{ color: "#6b7280", p: 0.3, ml: "auto" }}>
                <Refresh sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            {displayedGroups.map((group) => {
              return (
                <Box
                  key={group.id}
                  onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 42px",
                    minHeight: 70,
                    alignItems: "center",
                    px: 1.8,
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#fafafa" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.7 }}>
                    <Switch
                      size="small"
                      checked={group.status !== "planned"}
                      inputProps={{ readOnly: true }}
                      sx={{
                        width: 34,
                        height: 22,
                        p: 0,
                        "& .MuiSwitch-switchBase": {
                          p: "2px",
                          "&.Mui-checked": {
                            transform: "translateX(12px)",
                            color: "white",
                            "& + .MuiSwitch-track": {
                              bgcolor: "#8b5cf6",
                              opacity: 1,
                            },
                          },
                        },
                        "& .MuiSwitch-thumb": { width: 18, height: 18 },
                        "& .MuiSwitch-track": {
                          borderRadius: 99,
                          bgcolor: "#e5e7eb",
                          opacity: 1,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.25,
                        bgcolor: group.status === "planned" ? "#fef3c7" : "#dcfce7",
                        color: group.status === "planned" ? "#d97706" : "#16a34a",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {group.status === "planned" ? "KUTILMOQDA" : "FAOL"}
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#111827", textAlign: "center" }}>
                    {group.name}
                  </Typography>

                  <Box sx={{ textAlign: "center" }}>
                    <Box
                      component="span"
                      sx={{
                        px: 0.9,
                        py: 0.35,
                        borderRadius: 99,
                        border: "1px solid #f0d9ff",
                        bgcolor: "#fff7ff",
                        color: "#a21caf",
                        fontSize: 11, 
                        fontWeight: 600,
                      }}
                    >
                      {group.course.name}
                    </Box>
                  </Box> 

                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 12, color: "#374151" }}>
                      {group.course.duration_month} oy
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827", mb: 0.2 }}>
                      {group.start_time || "-"}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#4b5563" }}>
                      {getDays(group.week_day)}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 12, color: "#374151", textAlign: "center" }}>
                    {group.rooms || "-"}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "center" }}>
                    {
                      (group.teachers || []).map((teacher) => (
                        <Box 
                          key={`${teacher.id}`}
                          component="span" 
                          sx={{
                            px: 0.8,
                            py: 0.25,
                            bgcolor: "white",
                            border: "1px solid #edf0f5",
                            borderRadius: 99,
                            color: "#111827",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {teacher.full_name}
                        </Box>
                      ))
                    }
                  </Box>

                  <Typography sx={{ fontSize: 12.5, color: "#111827", fontWeight: 700, textAlign: "center" }}>
                    {group.student_count}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <IconButton onClick={(e) => { e.stopPropagation(); setDeleteId(group.id); setIsDeleteDialogOpen(true); }} size="small" sx={{ color: "#6b7280" }}>
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton onClick={(e) => { e.stopPropagation(); handleEditOpen(group); }} size="small" sx={{ color: "#7c3aed" }}>
                      <Edit sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}

            {!displayedGroups.length && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
                  Hozircha guruhlar yo'q
                </Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} shape="rounded" color="primary" sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: "#8b5cf6", color: "white" } }} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 390 },
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-10px 0 30px rgba(15,23,42,0.12)",
            borderRadius: 0,
          },
        }}
        SlideProps={{ direction: "left", timeout: 320 }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.7,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
              {editId ? "Guruhni tahrirlash" : "Guruh qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "#4b5563", lineHeight: 1.35, mt: 0.4 }}>
              Guruh ma'lumotlarini kiriting.
            </Typography>
          </Box>
          <IconButton onClick={closeDrawer} size="small" sx={{ mt: -0.6, mr: -0.6, color: "#9ca3af" }}>
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1.35,
          }}
        >
          <Box>
            <Typography sx={labelSx}>
              Guruh nomi <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="Frontend 2024"
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>
              Kurs <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={form.course_id}
              onChange={(e) => updateForm("course_id", e.target.value)}
              placeholder="Kursni tanlang"
              sx={inputSx}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="" disabled>
                Kursni tanlang
              </MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={labelSx}>
              Xona <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={form.room_id}
              onChange={(e) => {
                const room = rooms.find((item) => item.id === Number(e.target.value));
                updateForm("room_id", e.target.value);
                if (room?.capacity) updateForm("max_student", room.capacity);
              }}
              sx={inputSx}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="" disabled>
                Xonani tanlang
              </MenuItem>
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography sx={labelSx}>
              Dars kunlari <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
              {dayOptions.map((day) => (
                <Box
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  sx={{
                    height: 34,
                    border: "1px solid #e5e7eb",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    px: 1,
                    cursor: "pointer",
                    bgcolor: form.week_day.includes(day?.value) ? "#faf5ff" : "white",
                  }}
                >
                  <Checkbox
                    checked={form.week_day.includes(day.value)}
                    size="small"
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleDay(day.value)}
                    sx={{
                      p: 0,
                      mr: 0.8,
                      color: "#cbd5e1",
                      "&.Mui-checked": { color: "#8b5cf6" },
                    }}
                  />
                  <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
                    {day.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={labelSx}>
              Dars vaqti <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="time"
              value={form.start_time}
              onChange={(e) => updateForm("start_time", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TimerOutlined sx={{ fontSize: 17, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>
              Boshlanish sanasi <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={form.start_date}
              onChange={(e) => updateForm("start_date", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayOutlined sx={{ fontSize: 16, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>
              Tavsif
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography sx={{ ...labelSx, mb: 0.4 }}>O'qituvchilar</Typography>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "center",
                minHeight: 40,
                "&:hover": { borderColor: "#a855f7" },
              }}
            >
              {form.teachers.map((id) => {
                const teacher = teachers.find((t) => t.id === id);
                return teacher ? (
                  <Box
                    key={id}
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontSize: 12,
                      height: 24,
                      px: 1,
                      bgcolor: "#f3e8ff",
                      color: "#9333ea",
                      borderRadius: 1,
                    }}
                  >
                    {teacher.full_name}
                    <Close 
                      sx={{ fontSize: 14, cursor: "pointer", "&:hover": { color: "#7e22ce" } }} 
                      onClick={() => toggleArrayItem("teachers", id)} 
                    />
                  </Box>
                ) : null;
              })}
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={() => setIsTeacherModalOpen(true)}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#a855f7",
                  minWidth: "auto",
                  p: "4px 8px",
                  "&:hover": { bgcolor: "transparent", opacity: 0.8 },
                }}
              >
                Qo'shish
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ ...labelSx, mb: 0.4 }}>Talabalar</Typography>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "center",
                minHeight: 40,
                "&:hover": { borderColor: "#a855f7" },
              }}
            >
              {form.students.map((id) => {
                const student = students.find((s) => s.id === id);
                return student ? (
                  <Box
                    key={id}
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontSize: 12,
                      height: 24,
                      px: 1,
                      bgcolor: "#f3e8ff",
                      color: "#9333ea",
                      borderRadius: 1,
                    }}
                  >
                    {student.full_name}
                    <Close 
                      sx={{ fontSize: 14, cursor: "pointer", "&:hover": { color: "#7e22ce" } }} 
                      onClick={() => toggleArrayItem("students", id)} 
                    />
                  </Box>
                ) : null;
              })}
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={() => setIsStudentModalOpen(true)}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#a855f7",
                  minWidth: "auto",
                  p: "4px 8px",
                  "&:hover": { bgcolor: "transparent", opacity: 0.8 },
                }}
              >
                Qo'shish
              </Button>
            </Box>
          </Box>

          {selectedCourse?.duration_hours && (
            <Typography sx={{ fontSize: 11, color: "#6b7280", mt: -0.5 }}>
              Dars davomiyligi: {selectedCourse.duration_hours * 60} minut
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            bgcolor: "white",
          }}
        >
          <Button
            variant="outlined"
            onClick={closeDrawer}
            sx={{
              color: "#111827",
              borderColor: "#e5e7eb",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              px: 2,
              "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: "#a855f7",
              "&:hover": { bgcolor: "#9333ea" },
              color: "white",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              boxShadow: "none",
              px: 2,
            }}
          >
            Saqlash
          </Button>
        </Box>
      </Drawer>

      {/* Teacher Modal */}
      <Dialog
        open={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              O'qituvchi qo'shish
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Bitta yoki bir nechta o'qituvchini tanlang
            </Typography>
          </Box>
          <IconButton onClick={() => setIsTeacherModalOpen(false)} size="small" sx={{ color: "#6b7280" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="O'qituvchi qidirish..."
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
          <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden", maxHeight: 300, overflowY: "auto" }}>
            <List disablePadding>
              {filteredTeachers.map((teacher, idx, arr) => (
                <ListItem
                  key={teacher.id}
                  disablePadding
                  sx={{
                    borderBottom: idx < arr.length - 1 ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={form.teachers.includes(teacher.id)}
                        onChange={() => toggleArrayItem("teachers", teacher.id)}
                        sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#8b5cf6" }, ml: 1 }}
                      />
                    }
                    label={teacher.full_name}
                    sx={{ width: "100%", m: 0, py: 1, "& .MuiFormControlLabel-label": { fontSize: 13, color: "#374151" } }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={() => setIsTeacherModalOpen(false)}
            variant="text"
            sx={{ textTransform: "none", color: "#6b7280", fontWeight: 600, fontSize: 13 }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={() => setIsTeacherModalOpen(false)}
            variant="contained"
            sx={{ textTransform: "none", bgcolor: "#a855f7", "&:hover": { bgcolor: "#9333ea" }, fontWeight: 600, fontSize: 13, boxShadow: "none" }}
          >
            Saqlash
          </Button>
        </Box>
      </Dialog>

      {/* Student Modal */}
      <Dialog
        open={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              Talaba qo'shish
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Bitta yoki bir nechta talabani tanlang
            </Typography>
          </Box>
          <IconButton onClick={() => setIsStudentModalOpen(false)} size="small" sx={{ color: "#6b7280" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Talaba qidirish..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
          <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden", maxHeight: 300, overflowY: "auto" }}>
            <List disablePadding>
              {filteredStudents.map((student, idx, arr) => (
                <ListItem
                  key={student.id}
                  disablePadding
                  sx={{
                    borderBottom: idx < arr.length - 1 ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={form.students.includes(student.id)}
                        onChange={() => toggleArrayItem("students", student.id)}
                        sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#8b5cf6" }, ml: 1 }}
                      />
                    }
                    label={student.full_name}
                    sx={{ width: "100%", m: 0, py: 1, "& .MuiFormControlLabel-label": { fontSize: 13, color: "#374151" } }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={() => setIsStudentModalOpen(false)}
            variant="text"
            sx={{ textTransform: "none", color: "#6b7280", fontWeight: 600, fontSize: 13 }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={() => setIsStudentModalOpen(false)}
            variant="contained"
            sx={{ textTransform: "none", bgcolor: "#a855f7", "&:hover": { bgcolor: "#9333ea" }, fontWeight: 600, fontSize: 13, boxShadow: "none" }}
          >
            Saqlash
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setAlert((prev) => ({ ...prev, open: false }))} 
          severity={alert.severity} 
          variant="filled"
          sx={{ 
            width: "100%", 
            bgcolor: "#991b1b", // Dark red
            color: "white",
            fontWeight: 600,
            "& .MuiAlert-icon": { color: "white" }
          }} 
        >
          {alert.message}
        </Alert>
      </Snackbar>

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Guruhni o'chirish</DialogTitle>
        <DialogContent>
          <Typography>Rostdan ham ushbu guruhni o'chirishni xohlaysizmi?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)} sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}>Bekor qilish</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none", borderRadius: 2 }}>Ha</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
