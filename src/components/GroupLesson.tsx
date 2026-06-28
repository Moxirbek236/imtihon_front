"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Avatar,
  Grid,
  Paper,
  Switch,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function GroupLesson() {
  const params = useParams();
  const id = params.id as string;
  const lessonId = params.lessonId as string;
  const router = useRouter();

  const [oneGroup, setOneGroup] = useState<any>(null);
  const [schedules, setSchedules] = useState({});
  const [tabValue, setTabValue] = useState(1);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("warning");
  const [saving, setSaving] = useState(false);

  // Lesson form state
  const [existingLesson, setExistingLesson] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [topicType, setTopicType] = useState("other");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [topics, setTopics] = useState<string[]>([]);
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const durationMonth = Object.keys(schedules).length || 0;

  const isPastDay = (d: any) => {
    if (!d.date) return false;
    const [y, m, day] = d.date.split('-').map(Number);
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lesson = new Date(y, m - 1, day);
    return lesson < target;
  };

  const isFutureDay = (d: any) => {
    if (!d.date) return false;
    const [y, m, day] = d.date.split('-').map(Number);
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lesson = new Date(y, m - 1, day);
    return lesson > target;
  };

  const getFullDate = (d: any) => {
    return d.date || "";
  };

  const getDayStyle = (d) => {
    const isSelected = getFullDate(d) === lessonId;
    if (isSelected) return { bgcolor: "#10b981", color: "white", border: "none" };
    if (d.isCompleted) return { bgcolor: "#dcfce7", border: "1px solid #86efac", color: "#15803d" };
    if (isPastDay(d)) return { bgcolor: "#e2e8f0", border: "none", color: "#94a3b8" };
    return { bgcolor: "white", border: "1px solid #e5e7eb", color: "#6b7280" };
  };

  const getHoverStyle = (d) => {
    const isSelected = getFullDate(d) === lessonId;
    if (isSelected) return { bgcolor: "#059669" };
    if (d.isCompleted) return { bgcolor: "#bbf7d0", borderColor: "#4ade80" };
    if (isPastDay(d)) return { bgcolor: "#cbd5e1" };
    return { bgcolor: "#f8fafc", borderColor: "#d1d5db" };
  };

  // Fetch group info, schedules, and lesson+attendance for this date
  useEffect(() => {
    async function initData() {
      try {
        let groupStudents = [];
        const resG = await axiosClient.get(`/groups/${id}`);
        const gData = resG?.data?.data;
        setOneGroup(gData);
        groupStudents = gData?.students || gData?.studentGroups || [];

        const resL = await axiosClient.get(`/attendances/by-date?group_id=${id}&date=${lessonId}`);
        const data = resL?.data?.data || resL?.data;
        if (data?.lesson) {
          setExistingLesson(data.lesson);
          setTopic(data.lesson.topic || "");
          setDescription(data.lesson.description || "");
        }
        
        if (data?.attendances?.length) {
          setAttendance(data.attendances.map((s: any) => ({
            student_id: s.student_id,
            full_name: s.students?.full_name,
            photo: s.students?.photo,
            present: s.isPresent
          })));
        } else {
          setAttendance(groupStudents.map((sg: any) => ({
            student_id: sg.students?.id || sg.id,
            full_name: sg.students?.full_name || sg.full_name,
            photo: sg.students?.photo || sg.photo,
            present: false
          })));
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchSchedules() {
      try {
        const res = await axiosClient.get(`/groups/${id}/schedule`);
        const dataArray = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        
        const mappedSchedules: Record<string, any> = {};
        const todayStr = new Date().toISOString().split('T')[0];
        let foundActive = false;
        let activeKey = "1";

        dataArray.forEach((monthData: any) => {
           const key = String(monthData.learning_month);
           const isCurrentMonth = monthData.lessons.some((l: any) => l.date === todayStr || l.date > todayStr);
           
           if (!foundActive && isCurrentMonth) {
             foundActive = true;
             activeKey = key;
           }

           mappedSchedules[key] = {
             isActive: false,
             days: monthData.lessons.map((l: any) => ({
               month: monthData.month_name,
               day: l.day_of_month,
               date: l.date,
               isCompleted: false
             }))
           };
        });

        if (mappedSchedules[activeKey]) mappedSchedules[activeKey].isActive = true;

        setSchedules(mappedSchedules);
        setCurrentMonthIndex(Number(activeKey) - 1);
      } catch (err) {
        console.error(err);
      }
    }


    async function fetchTopics() {
      try {
        const res = await axiosClient.get(`/lessons?group_id=${id}`);
        if (Array.isArray(res?.data)) {
           const uniqueTopics = Array.from(new Set(res.data.map((l: any) => l.topic).filter(Boolean)));
           setTopics(uniqueTopics as string[]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    initData();
    fetchSchedules();
    fetchTopics();
  }, [id, lessonId]);
  
  const isPastDate = (dateStr: string) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lesson = new Date(y, m - 1, d);
    return lesson < target;
  };

  const isFutureDate = (dateStr: string) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lesson = new Date(y, m - 1, d);
    return lesson > target;
  };
  
  const currentMonthKey = String(currentMonthIndex + 1);
  const currentMonthData = schedules[currentMonthKey] || { isActive: false, days: [] };
  const currentMonthDays = currentMonthData.days || [];

  const handleDayClick = (d) => {
    if (isFutureDay(d)) {
      setSnackbarMsg("Hali dars boshlanish vaqti kelmagan!");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    router.push(`/dashboard/groups/${id}/lesson/${getFullDate(d)}`);
  };

  const handleToggle = (studentId) => {
    setAttendance(prev =>
      prev.map(s => s.student_id === studentId ? { ...s, present: !s.present } : s)
    );
  };

  const handleSave = async () => {
    const finalTopic = topicType === "plan" ? selectedTopic : topic;
    if (!finalTopic) {
      setSnackbarMsg("Mavzuni kiriting!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSaving(true);
    try {
      const presentStudentIds = attendance
        .filter(s => s.present)
        .map(s => Number(s.student_id));

      await axiosClient.post(`/attendances`, {
        group_id: Number(id),
        date: lessonId,
        topic: finalTopic,
        type: topicType,
        records: attendance.map(s => ({
          student_id: Number(s.student_id),
          present: Boolean(s.present)
        }))
      });

      setSnackbarMsg("Dars va davomat muvaffaqiyatli saqlandi!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Xatolik yuz berdi!";
      setSnackbarMsg(Array.isArray(msg) ? msg.join(", ") : msg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };

  // Format lessonId (2026-05-12) for display
  const displayDate = lessonId
    ? new Date(lessonId).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <Box sx={{ p: { xs: 2, lg: 3 }, bgcolor: "#f9fafb", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* Header / Month Selector */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3, boxShadow: "none", border: "1px solid #e5e7eb" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton
            size="small"
            onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
            disabled={currentMonthIndex === 0}
            sx={{ opacity: currentMonthIndex === 0 ? 0.4 : 1 }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            {currentMonthIndex + 1}-o'quv oyi
          </Typography>
          <IconButton
            size="small"
            onClick={() => setCurrentMonthIndex(prev => Math.min(durationMonth - 1, prev + 1))}
            disabled={currentMonthIndex >= durationMonth - 1}
            sx={{ opacity: currentMonthIndex >= durationMonth - 1 ? 0.4 : 1 }}
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {currentMonthDays.length === 0 && (
            <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Yuklanmoqda...</Typography>
          )}
          {currentMonthDays.map((d, i) => (
            <Box
              key={i}
              onClick={() => handleDayClick(d)}
              sx={{
                width: 50,
                py: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                cursor: "pointer",
                transition: "0.2s",
                ...getDayStyle(d),
                "&:hover": getHoverStyle(d),
              }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{d.month?.slice(0, 3)}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{d.day}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": { textTransform: "none", fontSize: 14, fontWeight: 600, color: "#6b7280", minHeight: 40, px: 3 },
            "& .Mui-selected": { color: "#10b981 !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#10b981", height: 2 },
          }}
        >
          <Tab label="Assistant" />
          <Tab label="Teacher" />
        </Tabs>
      </Box>

      {/* Teacher Info Card */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "none", border: "1px solid #e5e7eb", bgcolor: "#f8fafc" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Ma'lumot</Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, border: "2px solid #e5e7eb" }}>
              {oneGroup?.teachers?.[0]?.full_name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                {oneGroup?.teachers?.[0]?.full_name || "—"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Teacher</Typography>
            </Box>
          </Grid>
          <Grid item xs sx={{ display: "flex", gap: 4, ml: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.5 }}>Dars kuni</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{displayDate}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#94a3b8", mb: 0.5 }}>Holat</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: existingLesson ? "#10b981" : "#94a3b8" }}>
                {existingLesson ? "Dars o'tilgan" : "Dars o'tilmagan"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Form */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "none", border: "1px solid #e5e7eb" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 3 }}>Yo'qlama va mavzu kiritish</Typography>

        <RadioGroup row value={topicType} onChange={(e) => setTopicType(e.target.value)} sx={{ mb: 3 }}>
          <FormControlLabel
            value="plan"
            control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
            label={<Typography sx={{ fontSize: 13, color: topicType === 'plan' ? "#10b981" : "#94a3b8", fontWeight: topicType === 'plan' ? 600 : 400 }}>O'quv reja bo'yicha</Typography>}
          />
          <FormControlLabel
            value="other"
            control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
            label={<Typography sx={{ fontSize: 13, color: topicType === 'other' ? "#10b981" : "#94a3b8", fontWeight: topicType === 'other' ? 600 : 400 }}>Boshqa</Typography>}
          />
        </RadioGroup>

        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, color: "#ef4444" }}>* Mavzu</Typography>
          {topicType === "plan" ? (
            <FormControl fullWidth size="small">
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                displayEmpty
                sx={{ bgcolor: "#f8fafc", borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" } }}
              >
                <MenuItem value="" disabled>Mavzuni tanlang</MenuItem>
                {topics.map((t, i) => <MenuItem key={i} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Mavzuni kiriting..."
              variant="outlined"
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f8fafc", borderRadius: 2, "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
          )}
        </Box>



        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f1f5f9", py: 1.5, color: "#94a3b8", fontWeight: 600, fontSize: 12 } }}>
                <TableCell width="50">#</TableCell>
                <TableCell>O'quvchi ismi</TableCell>
                <TableCell align="center">Vaqti</TableCell>
                <TableCell align="right">Keldi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#94a3b8", fontSize: 13 }}>
                    O'quvchilar yuklanmoqda...
                  </TableCell>
                </TableRow>
              )}
              {attendance.map((row, index) => (
                <TableRow key={row.student_id} sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f1f5f9", py: 2, fontSize: 13, fontWeight: 500 } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={row.photo ? `https://seven-oy-crm-backned-1.onrender.com/files/${row.photo}` : ""}
                        sx={{ width: 32, height: 32, fontSize: 13 }}
                      >
                        {row.full_name?.charAt(0)}
                      </Avatar>
                      {row.full_name}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ color: "#ef4444", fontWeight: 600 }}>
                    {oneGroup?.start_time || "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Switch
                      checked={row.present}
                      onChange={() => handleToggle(row.student_id)}
                      disabled={isFutureDate(lessonId) || (isPastDate(lessonId) && role === 'TEACHER') || (!!existingLesson && role === 'TEACHER')}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#10b981" },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          {(isFutureDate(lessonId) || (isPastDate(lessonId) && role === 'TEACHER') || (!!existingLesson && role === 'TEACHER')) ? (
            <Button
              variant="outlined"
              disabled
              sx={{ textTransform: "none", px: 4, py: 1, borderRadius: 2, fontWeight: 600 }}
            >
              {isFutureDate(lessonId) ? "Hali dars vaqti kelmagan" : (!!existingLesson ? "Dars allaqachon saqlangan" : "Tahrirlash mumkin emas")}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                bgcolor: "#7c3aed",
                textTransform: "none",
                px: 4,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                "&:hover": { bgcolor: "#6d28d9" },
              }}
            >
              {saving ? "Saqlanmoqda..." : (existingLesson ? "Tahrirlash" : "Saqlash")}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ fontWeight: 600, fontSize: 14, borderRadius: 2 }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
