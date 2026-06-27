"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Button, Paper, Slider, TextField, Alert, CircularProgress } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axiosClient from "../../../../../../../../../api/axios";

export default function HomeworkReviewPage() {
  const { id, hwId, studentId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "0";

  const [data, setData] = useState<any>(null);
  const [grade, setGrade] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axiosClient.get(`/home-works/${hwId}/student/${studentId}`);
        if (res.data?.success) {
          setData(res.data.data);
          if (res.data.data.result) {
            setGrade(res.data.data.result.grade || 0);
            setComment(res.data.data.result.title || "");
          }
        }
      } catch (err) {
        console.error("Error fetching submission:", err);
      }
    }
    fetchData();
  }, [hwId, studentId]);

  if (!data) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;

  const handleGradeChange = (event: Event, newValue: number | number[]) => {
    setGrade(newValue as number);
  };

  const handleGradeSubmit = async () => {
    if (!data.answer?.id) {
      alert("Bu o'quvchi hali vazifa topshirmagan");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/home-works/${hwId}/grade/${data.answer.id}`, {
        grade,
        comment,
      });
      if (res.data?.success) {
        router.push(`/dashboard/groups/${id}/homework/${hwId}/results`);
      }
    } catch (err) {
      console.error("Error grading:", err);
      alert("Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
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

  const statusName = statusParam === "0" ? "Kutayotganlar" : statusParam === "1" ? "Qaytarilganlar" : statusParam === "2" ? "Qabul qilinganlar" : "Bajarilmagan";

  return (
    <Box sx={{ p: 3, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, cursor: "pointer" }} onClick={() => router.push(`/dashboard/groups/${id}/homework/${hwId}/results`)}>
        <ArrowBackIosNewIcon sx={{ fontSize: 14, color: "#6b7280", mr: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
          {statusName} <span style={{ color: "#9ca3af", margin: "0 8px" }}>&gt;</span> Uyga vazifa
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexDirection: "column", maxWidth: 800 }}>
        {/* Vazifa info */}
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "none" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827", mb: 2 }}>Uy vazifasi</Typography>
          <Box sx={{ bgcolor: "#f9fafb", p: 2, borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Izoh:</Typography>
            <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
              {data.homework.description || "Izoh yo'q"}
            </Typography>
          </Box>
        </Paper>

        {/* Student submission info */}
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "none" }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827", mb: 2 }}>
            {data.student.full_name}
          </Typography>
          <Box sx={{ display: "flex", gap: 6, mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Vaqti:</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                {data.answer ? formatDate(data.answer.created_at) : "Topshirmagan"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Fayllar soni:</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                {data.answer?.files?.length || 0}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Status:</Typography>
              <Box sx={{ 
                bgcolor: data.status === "pending" ? "#fef3c7" : data.status === "accepted" ? "#d1fae5" : data.status === "returned" ? "#fee2e2" : "#f3f4f6", 
                color: data.status === "pending" ? "#d97706" : data.status === "accepted" ? "#059669" : data.status === "returned" ? "#ef4444" : "#4b5563", 
                px: 1.5, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, display: "inline-block"
              }}>
                {data.status === "pending" ? "Kutayabti" : data.status === "accepted" ? "Qabul qilingan" : data.status === "returned" ? "Qaytarilgan" : "Bajarilmagan"}
              </Box>
            </Box>
          </Box>

          <Box sx={{ bgcolor: "#f9fafb", p: 2, borderRadius: 2, borderLeft: "4px solid #3b82f6", mb: 3 }}>
            <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>Uyga vazifa izohi:</Typography>
            <Typography sx={{ fontSize: 14, color: "#4b5563", wordBreak: "break-all" }}>
              {data.answer?.comment || "Izoh qoldirilmagan"}
            </Typography>
            {data.answer?.files?.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {data.answer.files.map((file: string, idx: number) => (
                  <Button 
                    key={idx}
                    variant="outlined" 
                    size="small" 
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/file/${file}`, "_blank")}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Fayl {idx + 1} ni ko'rish
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          
          {data.result && (
            <Box sx={{ bgcolor: "#f3f4f6", p: 2, borderRadius: 2 }}>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", mb: 0.5 }}>O'qituvchi izohi:</Typography>
              <Typography sx={{ fontSize: 14, color: "#111827" }}>{data.result.title}</Typography>
            </Box>
          )}
        </Paper>

        {/* Grading Section */}
        {data.answer && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "none" }}>
            <Alert severity="info" sx={{ mb: 4, borderRadius: 2, bgcolor: "#eff6ff", color: "#1e40af", "& .MuiAlert-icon": { color: "#3b82f6" } }}>
              60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
            </Alert>

            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 3 }}>Ball</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
              <Slider
                value={grade}
                onChange={handleGradeChange}
                min={0}
                max={100}
                sx={{
                  color: "#10b981",
                  "& .MuiSlider-thumb": {
                    bgcolor: "white",
                    border: "2px solid #10b981",
                  },
                }}
              />
              <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 1.5, px: 2, py: 1, minWidth: 48, textAlign: "center" }}>
                <Typography sx={{ fontWeight: 600 }}>{grade}</Typography>
              </Box>
            </Box>
            <Typography sx={{ textAlign: "center", fontSize: 12, color: "#9ca3af", mb: 4 }}>O'tish bali</Typography>

            {/* Note: Backend GradeDto doesn't take files, so we omit teacher file upload */}
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 2 }}>Izohingiz</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="O'quvchiga izoh yozishingiz mumkin..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 4, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f9fafb" } }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => router.push(`/dashboard/groups/${id}/homework/${hwId}/results`)}
                sx={{ borderRadius: 2, textTransform: "none", color: "#6b7280", borderColor: "#e5e7eb", px: 3 }}
              >
                Bekor qilish
              </Button>
              <Button 
                variant="contained" 
                onClick={handleGradeSubmit}
                disabled={submitting}
                sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" }, px: 3 }}
              >
                {submitting ? "Yuborilmoqda..." : "Yuborish"}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
