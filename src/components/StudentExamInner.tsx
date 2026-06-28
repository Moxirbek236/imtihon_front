"use client";

import { Box, Typography, CircularProgress, TextField, IconButton, Button, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "../api/axios";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BASE_URL = "https://seven-oy-crm-backned-1.onrender.com/files/files/";

export default function StudentExamInner({ groupId, examId }: { groupId: string; examId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);

  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/exams/group/${groupId}`);
      const examsList = res.data?.data || [];
      const foundExam = examsList.find((e: any) => e.id === Number(examId));
      setExam(foundExam);
    } catch (err) {
      console.error("Error fetching exam data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, [groupId, examId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!exam) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("comment", comment);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    try {
      const res = await axiosClient.post(`/exams/${examId}/submit`, formData);
      if (res.data?.success) {
        setComment("");
        setSelectedFile(null);
        await fetchExamData();
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) + " " + formatDate(dateString);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">Imtihon topilmadi</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>Orqaga</Button>
      </Box>
    );
  }

  const { myAnswer } = exam;
  const isSubmitted = !!myAnswer;
  const isGraded = exam.is_published && myAnswer && myAnswer.examStatus === "ACCEPTED";
  const statusStr = myAnswer ? myAnswer.examStatus : "TOPShIRILMAGAN";

  return (
    <Box sx={{ p: 3, bgcolor: "#f3f4f6", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton onClick={() => router.push(`/dashboard/my-groups/${groupId}/lessons`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
          {exam.title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
        {/* Main section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Exam info details */}
          <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, borderBottom: "1px solid #e5e7eb", pb: 2, mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>Boshlanish vaqti</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{formatDateTime(exam.start_date)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>Tugash vaqti</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{formatDateTime(exam.end_date)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>Holati</Typography>
                <Box sx={{
                  bgcolor: statusStr === "ACCEPTED" ? "#d1fae5" : statusStr === "PENDING" ? "#fef3c7" : "#fee2e2",
                  color: statusStr === "ACCEPTED" ? "#059669" : statusStr === "PENDING" ? "#d97706" : "#ef4444",
                  px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: 12, fontWeight: 600, mt: 0.5
                }}>
                  {statusStr === "ACCEPTED" ? "Bajarildi" : statusStr === "PENDING" ? "Kutilyapti" : "Bajarilmagan"}
                </Box>
              </Box>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "#111827" }}>
              Imtihon shartlari
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#4b5563", whiteSpace: "pre-line", mb: 2 }}>
              {exam.description || "Tavsif kiritilmagan"}
            </Typography>

            {exam.file && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => window.open(`${BASE_URL}${exam.file}`, "_blank")}
                  sx={{ textTransform: "none", color: "#7c3aed", borderColor: "#7c3aed", "&:hover": { borderColor: "#6d28d9", bgcolor: "#f5f3ff" } }}
                >
                  Imtihon faylini yuklab olish
                </Button>
              </Box>
            )}
          </Paper>

          {/* Student submission */}
          {isSubmitted && (
            <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                Mening jo'natmam
              </Typography>
              <Box sx={{ bgcolor: "#faf7f5", p: 2, borderRadius: 2, mb: 2 }}>
                <Typography sx={{ fontSize: 14, color: "#374151", mb: 1 }}>{myAnswer.title}</Typography>
                {myAnswer.file && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.open(`${BASE_URL}${myAnswer.file}`, "_blank")}
                    sx={{ textTransform: "none", color: "#3b82f6", borderColor: "#3b82f6", mt: 1 }}
                  >
                    Jo'natilgan fayl
                  </Button>
                )}
              </Box>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", textAlign: "right" }}>
                Topshirilgan vaqt: {formatDateTime(myAnswer.created_at)}
              </Typography>
            </Paper>
          )}

          {/* Submission form if not submitted */}
          {!isSubmitted && (
            <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                Javobingizni yuklang
              </Typography>
              {selectedFile && (
                <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#dcfce7", border: "1px solid #22c55e", borderRadius: 1.5, px: 2, py: 1, mb: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "#16a34a", mr: 1, flex: 1 }} noWrap>{selectedFile.name}</Typography>
                  <IconButton size="small" onClick={handleRemoveFile} sx={{ color: "#ef4444" }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <TextField
                  fullWidth multiline maxRows={4} variant="standard"
                  placeholder="Izoh qoldiring"
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  InputProps={{ disableUnderline: true, sx: { fontSize: 14 } }}
                />
                <input type="file" id="exam-file-upload" style={{ display: "none" }} onChange={handleFileChange} />
                <label htmlFor="exam-file-upload">
                  <IconButton component="span" sx={{ color: "#9ca3af" }}><AttachFileIcon /></IconButton>
                </label>
                <IconButton onClick={handleSubmit} disabled={submitting || (!comment && !selectedFile)} sx={{ color: submitting ? "#9ca3af" : "#7c3aed" }}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Sidebar with grade result */}
        <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}>
          {exam.is_published && myAnswer ? (
            <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#faf5ff" }}>
              <Typography variant="subtitle2" sx={{ color: "#7c3aed", fontWeight: 700, mb: 2 }}>
                Imtihon Bahosi
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: "#7c3aed", textAlign: "center", mb: 2 }}>
                {myAnswer.score ?? 0}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                <strong>O'qituvchi izohi:</strong>
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#4b5563", mt: 0.5, fontStyle: "italic" }}>
                {myAnswer.feedback || "Izoh yo'q"}
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", boxShadow: "none", bgcolor: "#f9fafb" }}>
              <Typography sx={{ fontSize: 14, color: "#6b7280", textAlign: "center" }}>
                {myAnswer ? "Javobingiz tekshirilmoqda..." : "Imtihon hali topshirilmagan"}
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
