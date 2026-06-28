"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Divider,
  Collapse,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  BarChart,
  Close,
  Add,
  KeyboardArrowRight,
} from "@mui/icons-material";
import axiosClient from "../api/axios";
import GroupCoursework from "./GroupCoursework";

export default function GroupInner({ id }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oneGroup, setOneGroup] = useState<any>(null);
  interface DayData {
    month: string;
    day: number;
    date: string;
    isCompleted?: boolean;
  }

  interface ScheduleMonth {
    isActive: boolean;
    days: DayData[];
  }

  const [schedules, setSchedules] = useState<Record<string, ScheduleMonth>>({});
  const [tabValue, setTabValue] = useState(Number(searchParams.get("tab")) || 0);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [openMentors, setOpenMentors] = useState(true);
  const [openAcademics, setOpenAcademics] = useState(false);
  const [openParams, setOpenParams] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const durationMonth = Object.keys(schedules).length || oneGroup?.course?.duration_month || 0;
 
  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => Math.min(durationMonth - 1, prev + 1));
  };

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await axiosClient.get(`/groups/${id}`);
        setOneGroup(res?.data?.data);
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    }
    async function fetchSchedules() {
      try {
        const res = await axiosClient.get(`/groups/${id}/schedule`);
        const dataArray = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        
        const mappedSchedules: Record<string, ScheduleMonth> = {};
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
             isActive: false, // We'll set the active one below
             days: monthData.lessons.map((l: any) => ({
               month: monthData.month_name,
               day: l.day_of_month,
               date: l.date,
               isCompleted: false // Default to false
             }))
           };
        });

        if (mappedSchedules[activeKey]) {
          mappedSchedules[activeKey].isActive = true;
        }

        setSchedules(mappedSchedules);
        setCurrentMonthIndex(Number(activeKey) - 1);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    }
    fetchGroup();
    fetchSchedules();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    router.push(`?tab=${newValue}`);
  };

  const currentMonthKey = String(currentMonthIndex + 1);
  const currentMonthData = schedules[currentMonthKey] || { isActive: false, days: [] };
  const currentMonthDays = currentMonthData.days || [];

  const isPastDay = (d: DayData) => {
    if (!d.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lessonDate = new Date(d.date);
    return lessonDate < today;
  };

  const getDayStyle = (d: DayData) => {
    if (d.isCompleted) return { bgcolor: "#dcfce7", border: "1px solid #86efac", color: "#15803d" };
    if (isPastDay(d)) return { bgcolor: "#e2e8f0", border: "none", color: "#94a3b8" };
    return { bgcolor: "white", border: "1px solid #e5e7eb", color: "#6b7280" };
  };

  const getHoverStyle = (d: DayData) => {
    if (d.isCompleted) return { bgcolor: "#bbf7d0", borderColor: "#4ade80" };
    if (isPastDay(d)) return { bgcolor: "#cbd5e1", borderColor: "transparent" };
    return { bgcolor: "#f8fafc", borderColor: "#d1d5db" };
  };

  const getFullDate = (d: DayData) => {
    return d.date || "";
  };

  const renderParameters = () => {
    const params = [
      { label: "Kurs:", value: oneGroup?.course?.name || "Yuklanmoqda..." },
      { label: "O'rta yosh:", value: oneGroup?.averageAge || "0" },
      { label: "O'quvchilar sig'imi:", value: oneGroup?.room_capacity || "0" },
      { label: "Mavjud o'quvchilar:", value: oneGroup?.student_count || "0" },
      { label: "O'quv oyidagi darslar soni:", value: "20" },
      { label: "Kurs davomiyligi (oy):", value: `${oneGroup?.course?.duration_month || 0}.0` },
      { label: "Jami darslar soni:", value: 20 },
    ];
 
    return params.map((param, index) => (
      <Box key={index} sx={{ display: "flex", justifyContent: "space-between", py: 1.2 }}>
        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>{param.label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: (param as any).link ? "#3b82f6" : "#111827", cursor: (param as any).link ? "pointer" : "default" }}>
          {param.value}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box sx={{ bgcolor: "#f9fafb", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ p: { xs: 2, lg: 3 }, pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => router.push("/dashboard/groups")} size="small">
            <KeyboardArrowLeft sx={{ fontSize: 24, color: "#4b5563" }} />
          </IconButton>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
            {"Bootcamp Full Stack N26"}
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.3,
              bgcolor: "#dcfce7",
              color: "#16a34a",
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 700,
              ml: 1,
              border: "1px solid #bbf7d0",
            }}
          >
            Aktiv
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<BarChart sx={{ fontSize: 18 }} />}
          sx={{
            borderColor: "#e5e7eb",
            color: "#4b5563",
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            bgcolor: "white",
            "&:hover": { bgcolor: "#f3f4f6", borderColor: "#d1d5db" },
          }}
        >
          Statistika
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, px: { xs: 2, lg: 3 } }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#6b7280",
              minHeight: 40,
              px: 2,
            },
            "& .Mui-selected": {
              color: "#7c3aed !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#7c3aed",
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
          }}
        >
          <Tab label="Ma'lumotlar" />
          <Tab label="Uy ishlari va Baholash" />
          <Tab label="Akademik davomati" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box sx={{ px: 0 }}>
          <Grid container spacing={0}>
            {/* Left Column */}
            <Grid item xs={6} sx={{width: "50%"}}>
            {/* Mentors Card */}
          <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <Box sx={{ bgcolor: "#3b82f6", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpenMentors(!openMentors)}>
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: 15 }}>Guruh mentorlari</Typography>
              <IconButton size="small" sx={{ color: "white", p: 0 }}>
                <Close sx={{ fontSize: 18, transform: openMentors ? "rotate(0deg)" : "rotate(45deg)", transition: "0.3s" }} />
              </IconButton>
            </Box>
            <Collapse in={openMentors}>
              <Box sx={{ p: 3, display: "flex", gap: 4, flexWrap: "wrap", bgcolor: "white" }}>
                {/* Main Teacher */}
                {oneGroup?.teachers?.map((teacher, index) => (
                  <Box key={teacher.id || index} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar 
                      src={teacher.photo ? `https://seven-oy-crm-backned-1.onrender.com/files/${teacher.photo}` : ""} 
                      sx={{ width: 56, height: 56, bgcolor: "#f0fdf4", color: "#22c55e", mb: 1, border: "2px solid #e5e7eb" }}
                    >
                      {teacher.full_name?.charAt(0)}
                    </Avatar>
                    <Typography sx={{ fontSize: 12, color: "#10b981", fontWeight: 700, mb: 0.5 }}>
                      {"Teacher"}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                      {teacher.full_name}
                    </Typography>
                  </Box>
                ))}
                
              </Box>
            </Collapse>
          </Paper>
            </Grid>

        {/* Right Column */}
         <Grid item xs={6} sx={{width: "50%"}}>
          {/* Params Card */} 
          <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <Box sx={{ bgcolor: "#3b82f6", px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpenParams(!openParams)}>
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: 15 }}>Parametrlar</Typography>
              <IconButton size="small" sx={{ color: "white", p: 0 }}>
                <Close sx={{ fontSize: 18, transform: openParams ? "rotate(0deg)" : "rotate(45deg)", transition: "0.3s" }} />
              </IconButton>
            </Box>
            <Collapse in={openParams}>
              <Box sx={{ p: 2.5, bgcolor: "white" }}>
                {renderParameters()}
              </Box>
            </Collapse>
          </Paper>
         </Grid>
      </Grid> 

      {/* Schedule Section */}
      <Box sx={{ mt: 4, bgcolor: "white", p: 3, borderRadius: 3, border: "1px solid #e5e7eb", mx: { xs: 2, lg: 3 } }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2, color: "#111827" }}>
              Dars jadvali
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
              {oneGroup?.teachers?.map((teacher, index) => {
                const getShortDays = (daysArray) => {
                  const dayMap = { MONDAY: "Du", TUESDAY: "Se", WEDNESDAY: "Ch", THURSDAY: "Pa", FRIDAY: "Ju", SATURDAY: "Sha", SUNDAY: "Ya" };
                  return daysArray?.map(d => dayMap[d.toUpperCase()] || dayMap[d] || d).join("/") || "—";
                };
                const getEndTime = (startTime, durationHours) => {
                  if (!startTime || !durationHours) return startTime || "—";
                  const [hours, minutes] = startTime.split(":").map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0, 0);
                  date.setHours(date.getHours() + durationHours);
                  return `${startTime} dan - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} gacha`;
                };
                const formatDate = (dateStr) => {
                   if (!dateStr) return "—";
                   const d = new Date(dateStr);
                   const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
                   return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
                };
                const formattedDays = getShortDays(oneGroup.week_day);
                const formattedTime = getEndTime(oneGroup.start_time, oneGroup.course_duration);
                const dateRange = `${formatDate(oneGroup.start_date)} - ${formatDate(oneGroup.end_date)}`;
                const roomName = typeof oneGroup.rooms === 'object' && oneGroup.rooms !== null ? oneGroup.rooms.name : (oneGroup.rooms || "Noma'lum xona");

                return (
                  <Box key={teacher.id || index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #f1f5f9" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", width: "20%" }}>
                      {teacher.full_name}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "center" }}>
                      {formattedDays}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "center" }}>
                      {formattedTime}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "center" }}>
                      {dateRange}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", width: "20%", textAlign: "right" }}>
                      {roomName} | {oneGroup.max_students || 0}
                    </Typography>
                  </Box>
                )
              })}
              {!oneGroup?.teachers?.length && (
                <Typography sx={{ fontSize: 13, color: "#6b7280", textAlign: "center", py: 2 }}>
                  O'qituvchi biriktirilmagan
                </Typography>
              )}
            </Box>

            {/* Pagination / Months */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <IconButton size="small" sx={{ border: "1px solid #e5e7eb", opacity: currentMonthIndex === 0 ? 0.5 : 1 }} onClick={handlePrevMonth} disabled={currentMonthIndex === 0}>
                <KeyboardArrowLeft fontSize="small" />
              </IconButton>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{currentMonthIndex + 1}-o'quv oyi</Typography>
              <IconButton size="small" sx={{ border: "1px solid #e5e7eb", opacity: currentMonthIndex >= durationMonth - 1 ? 0.5 : 1 }} onClick={handleNextMonth} disabled={currentMonthIndex >= durationMonth - 1}>
                <KeyboardArrowRight fontSize="small" />
              </IconButton>
            </Box>

            {/* Days Timeline */}
            {!showAllMonths ? (
              <>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
                  {currentMonthDays.length === 0 && (
                    <Typography sx={{ fontSize: 13, color: "#94a3b8" }}>Yuklanmoqda...</Typography>
                  )}
                  {currentMonthDays.map((d, i) => (
                    <Box
                      key={i}
                      onClick={() => router.push(`/dashboard/groups/${id}/lesson/${getFullDate(d)}`)}
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
                        "&:hover": getHoverStyle(d)
                      }}
                    >
                      <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{d.month?.slice(0, 3)}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{d.day}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllMonths(true)}
                    sx={{ borderColor: "#e5e7eb", color: "#4b5563", textTransform: "none", fontSize: 13, borderRadius: 2 }}
                  >
                    Barchasini ko'rish
                  </Button>
                </Box>
              </>
            ) : (
              <Box>
                {Object.entries(schedules).map(([key, monthData]) => (
                  <Box key={key} sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{key}-o'quv oyi</Typography>
                      {monthData.isActive && (
                        <Box sx={{ px: 1, py: 0.2, bgcolor: "#dcfce7", color: "#15803d", borderRadius: 1, fontSize: 11, fontWeight: 700, border: "1px solid #86efac" }}>
                          Joriy oy
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(monthData.days || []).map((d, i) => (
                        <Box
                          key={i}
                          onClick={() => router.push(`/dashboard/groups/${id}/lesson/${getFullDate(d)}`)}
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
                            "&:hover": getHoverStyle(d)
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{d.month?.slice(0, 3)}</Typography>
                          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{d.day}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAllMonths(false)}
                    sx={{ borderColor: "#e5e7eb", color: "#4b5563", textTransform: "none", fontSize: 13, borderRadius: 2 }}
                  >
                    Yopish
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
      {tabValue === 1 && <GroupCoursework />}
    </Box>
    </Box>
  );
}
