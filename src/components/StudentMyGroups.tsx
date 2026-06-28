"use client";

import { Box, Typography, Tabs, Tab, Avatar, CircularProgress, Dialog, DialogContent, Card } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axios";

export default function StudentMyGroups() {
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [tabValue, setTabValue] = useState(searchParams?.get("status") === "finished" ? 1 : 0);
  const router = useRouter();
  const [teachersModalOpen, setTeachersModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleOpenTeachers = (group) => {
    setSelectedGroup(group);
    setTeachersModalOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    router.replace(`?status=${newValue === 1 ? 'finished' : 'active'}`);
  };

  const { data: response, isLoading: loading } = useQuery({
    queryKey: ["student-groups", tabValue === 1 ? 'finished' : 'active'],
    queryFn: async () => {
      const res = await axiosClient.get(`/students/my/groups?status=${tabValue === 1 ? 'finished' : 'active'}`);
      return res.data;
    },
    staleTime: 60000,
  });

  const displayedGroups = response?.data || [];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getShortDays = (daysArray) => {
    const dayMap = {
      MONDAY: "Du",
      TUESDAY: "Se",
      WEDNESDAY: "Ch",
      THURSDAY: "Pa",
      FRIDAY: "Ju",
      SATURDAY: "Sha",
      SUNDAY: "Ya"
    };
    return daysArray?.map(d => dayMap[d] || d).join(", ");
  };

  const getEndTime = (startTime, durationHours) => {
    if (!startTime || !durationHours) return startTime || "-";
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setHours(date.getHours() + durationHours);
    return `${startTime} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: { xs: 2, lg: 3 },
        boxSizing: "border-box",
        bgcolor: "#f3f4f6",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 15,
            color: "#6b7280",
            minWidth: 100,
          },
          "& .Mui-selected": {
            color: "#d97706 !important",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#d97706",
          }
        }}>
          <Tab label="Faol" />
          <Tab label="Tugagan" />
        </Tabs>
      </Box>

      <Box
        sx={{
          bgcolor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 800 }}>
            {/* Header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 2fr 1fr 1fr",
                minHeight: 56,
                alignItems: "center",
                px: 2,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>#</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Guruh nomi</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Yo'nalishi</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>O'qituvchi</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Boshlash vaqti</Typography>
            </Box>

            {/* Body */}
            {loading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={30} sx={{ color: "#d97706" }} />
              </Box>
            ) : (
              <>
                {displayedGroups.map((group, index) => (
                  <Card
                    key={group.id}
                    onClick={() => router.push(`/dashboard/my-groups/${group.id}`)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "60px 2fr 2fr 1fr 1fr",
                      minHeight: 56,
                      alignItems: "center",
                      px: 2,
                      borderBottom: "1px solid #e5e7eb",
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": { bgcolor: "#fafafa" },
                      "&:last-child": {
                        borderBottom: "none"
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: "#111827" }}>{index + 1}</Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>{group.name}</Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>{group.course}</Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                      {group.teachers && group.teachers.length > 0
                        ? group.teachers.map((t: any) => t.full_name).join(", ")
                        : "-"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#111827" }}>{formatDate(group.start_date)}</Typography>
                  </Card>
                ))}

                {displayedGroups.length === 0 && (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
                      Hozircha guruhlar yo'q
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Teachers Modal */}
      <Dialog open={teachersModalOpen} onClose={() => setTeachersModalOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 4 }}>
          {selectedGroup && (
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: "#111827", mb: 1.5 }}>
                {selectedGroup.name}
              </Typography>
              <Typography sx={{ fontSize: 18, color: "#4b5563", mb: 3 }}>
                Faol
              </Typography>
              
              <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 1, overflow: "hidden" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr", minHeight: 48, alignItems: "center", px: 2, bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>O'qituvchi</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Roli</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Dars kunlari</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Dars vaqti</Typography>
                </Box>
                {selectedGroup.teachers?.map((teacher, idx) => (
                  <Box key={idx} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr", minHeight: 48, alignItems: "center", px: 2, borderBottom: "1px solid #e5e7eb", "&:last-child": { borderBottom: "none" } }}>
                    <Typography sx={{ fontSize: 13, color: "#111827" }}>{teacher.full_name}</Typography>
                    <Typography sx={{ fontSize: 13, color: "#111827" }}>Teacher</Typography>
                    <Typography sx={{ fontSize: 13, color: "#111827" }}>{getShortDays(selectedGroup.week_day)}</Typography>
                    <Typography sx={{ fontSize: 13, color: "#111827" }}>{getEndTime(selectedGroup.start_time, selectedGroup.course_duration)}</Typography>
                  </Box>
                ))}
                {!selectedGroup.teachers?.length && (
                  <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Ma'lumot yo'q</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
