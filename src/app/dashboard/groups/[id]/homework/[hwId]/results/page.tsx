"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, Button, Paper, Tabs, Tab } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import axiosClient from "../../../../../../../api/axios";

export default function HomeworkResultsPage() {
  const { id, hwId } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axiosClient.get(`/home-works/${hwId}/submissions`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    }
    fetchData();
  }, [hwId]);

  if (!data) return <Box sx={{ p: 3 }}>Yuklanmoqda...</Box>;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + " " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  };
  
  const getDeadline = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    d.setHours(d.getHours() + 20); // Backend deadline logic example
    return d.toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  };

  // Map tabs to arrays
  const tabsData = [
    { label: `Kutayotganlar`, count: data.stats.pending, list: data.kutilayotganlar, type: 'pending' },
    { label: `Qaytarilganlar`, count: data.stats.returned, list: data.qaytarilganlar, type: 'returned' },
    { label: `Qabul qilinganlar`, count: data.stats.accepted, list: data.qabulQilinganlar, type: 'accepted' },
    { label: `Bajarilmagan`, count: data.stats.notDone, list: data.bajarmaganlar, type: 'not_done' },
  ];

  const currentTab = tabsData[tabValue];

  return (
    <Box sx={{ p: 2, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, cursor: "pointer" }} onClick={() => router.push(`/dashboard/groups/${id}`)}>
        <ArrowBackIosNewIcon sx={{ fontSize: 14, color: "#6b7280", mr: 1 }} />
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
          {data.homework.title}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, boxShadow: "none", p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", pb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Mavzu</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{data.homework.title}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Tugash vaqti</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#4b5563" }}>
              {getDeadline(data.homework.created_at)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} TabIndicatorProps={{ style: { backgroundColor: "#10b981" } }}>
            {tabsData.map((tab, idx) => (
              <Tab
                key={idx}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.label}
                    <Box sx={{ bgcolor: "#f59e0b", color: "white", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>
                      {tab.count}
                    </Box>
                  </Box>
                }
                sx={{ textTransform: "none", fontWeight: 600, color: tabValue === idx ? "#111827" : "#6b7280", "&.Mui-selected": { color: "#111827" } }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mt: 2, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>O'quvchi ismi</th>
                {currentTab.type === 'pending' && <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>Uyga vazifa jo'natilgan vaqt</th>}
                {currentTab.type === 'accepted' || currentTab.type === 'returned' ? (
                  <>
                    <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>Topshirilgan vaqti</th>
                    <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>Tekshirilgan vaqti</th>
                    <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>Ball</th>
                    <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>XP</th>
                    <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>Kumush</th>
                    <th style={{ padding: "16px", color: "#6b7280", fontSize: "13px", fontWeight: 500 }}>Harakatlar</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {currentTab.list.map((row: any, idx: number) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid #f3f4f6", cursor: currentTab.type !== 'not_done' ? "pointer" : "default" }}
                  onClick={() => {
                    if (currentTab.type !== 'not_done') {
                      router.push(`/dashboard/groups/${id}/homework/${hwId}/student/${row.student.id}/review?status=${tabValue}`);
                    }
                  }}
                >
                  <td style={{ padding: "16px", fontSize: "14px", color: "#111827", fontWeight: 500 }}>{row.student.full_name}</td>
                  {currentTab.type === 'pending' && (
                    <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>{formatDate(row.submitted_at)}</td>
                  )}
                  {(currentTab.type === 'accepted' || currentTab.type === 'returned') && (
                    <>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>{formatDate(row.submitted_at)}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>{formatDate(row.result?.created_at)}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#f59e0b", fontWeight: "bold" }}>⚡ {row.result?.grade || 0}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#8b5cf6" }}>🔮 0</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#9ca3af" }}>🪙 0</td>
                      <td style={{ padding: "16px" }}>
                        <EditOutlinedIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {currentTab.list.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: "16px", textAlign: "center", color: "#9ca3af" }}>Ma'lumot yo'q</td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}
