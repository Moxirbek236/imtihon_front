"use client";

import { Box, Typography, CircularProgress, TextField, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "../api/axios";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const BASE_URL = "https://seven-oy-crm-backned-1.onrender.com/files/files/";

export default function StudentLessonInner({ groupId, lessonId }: { groupId: string; lessonId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [currentVideo, setCurrentVideo] = useState<any>(null);

  const [sidebarLessons, setSidebarLessons] = useState<any[]>([]);

  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/students/my/group/${groupId}/lesson/${lessonId}`);
        setData(res.data?.data);

        const vidRes = await axiosClient.get(`/videos/group/${groupId}`);
        const vids = vidRes.data?.data?.filter((v: any) => v.lesson_id === Number(lessonId)) || [];
        setVideos(vids);
        if (vids.length > 0) setCurrentVideo(vids[0]);

        const slRes = await axiosClient.get(`/students/my/group/${groupId}/lessons-lite`);
        const slData = Array.isArray(slRes.data) ? slRes.data : slRes.data?.data || [];
        setSidebarLessons(slData);
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, lessonId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!data?.homeworkInfo?.id) return;
    if (!comment && selectedFiles.length === 0) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("comment", comment);
    selectedFiles.forEach((file) => formData.append("files", file));
    try {
      const res = await axiosClient.post(`/home-works/${data.homeworkInfo.id}/submit`, formData);
      if (res.data?.success) {
        setComment("");
        setSelectedFiles([]);
        const refreshRes = await axiosClient.get(`/students/my/group/${groupId}/lesson/${lessonId}`);
        setData(refreshRes.data?.data);
      }
    } catch (err) {
      console.error("Vazifa topshirishda xatolik:", err);
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

  const { homeworkChats, homeworkInfo, lesson } = data || {};
  const studentSubmissions = homeworkChats?.filter((c: any) => c.sender?.userType === 2) || [];
  const teacherReplies = homeworkChats?.filter((c: any) => c.sender?.userType === 1) || [];

  const isSubmitted = studentSubmissions.length > 0;
  const isGraded = teacherReplies.length > 0;
  const teacherScore = isGraded ? (teacherReplies[0].score ?? 0) : 0;

  let overallStatus = "Bajarilmagan";
  if (isSubmitted && !isGraded) overallStatus = "Kutilyapti";
  if (isGraded) overallStatus = teacherScore >= 60 ? "Bajarildi" : "Qaytarildi";

  const canSubmit = !isSubmitted || (isGraded && teacherScore < 60);

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", flexDirection: { xs: "column", md: "row" }, bgcolor: "#f3f4f6", overflow: "hidden" }}>

      {/* ── MAIN CONTENT (left) ── */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>

        {/* Video */}
        <Box sx={{ bgcolor: "white", borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          {currentVideo ? (
            <Box sx={{ width: "100%", aspectRatio: "16/9", bgcolor: "#2d1f17" }}>
              <video src={`${BASE_URL}${currentVideo.video_url}`} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
          ) : (
            <Box sx={{ width: "100%", minHeight: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#9ca3af" }}>Video mavjud emas</Typography>
            </Box>
          )}
          <Box sx={{ p: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#374151" }}>
              {lesson?.name} {currentVideo && `(${currentVideo.originalname || "video"})`}
            </Typography>
          </Box>
        </Box>

        {/* Homework chats */}
        {homeworkInfo && (
          <Box sx={{ bgcolor: "white", borderRadius: 2, border: "1px solid #e5e7eb" }}>
            <Box sx={{ px: 3, py: 1.5, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#d97706" }}>Vazifalar</Typography>
              <Typography sx={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                Status: {overallStatus} | Ball: {teacherScore}
              </Typography>
            </Box>

            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
              {/* 1. Teacher's task */}
              <Box sx={{ bgcolor: "#faf7f5", borderRadius: 2, p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "flex-start" }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Uyga vazifa</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Box sx={{ bgcolor: "#ef4444", color: "white", px: 2, py: 0.5, borderRadius: 1, fontSize: 13, display: "flex", alignItems: "center", gap: 1 }}>
                      <ErrorOutlineIcon sx={{ fontSize: 16 }} /> Uyga vazifa muddati: {formatDateTime(homeworkInfo.deadline)}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "#4b5563", mt: 1 }}>Fayllar soni: {homeworkInfo.attachments?.length || 0}</Typography>
                  </Box>
                </Box>
                <div style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: homeworkInfo.desc }} />
              </Box>

              {/* Input if not yet submitted */}
              {canSubmit && !isSubmitted && (
                <SubmissionInput comment={comment} setComment={setComment} selectedFiles={selectedFiles} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} handleSubmit={handleSubmit} submitting={submitting} />
              )}

              {/* 2. Student submissions */}
              {studentSubmissions.map((sub: any, idx: number) => (
                <Box key={idx} sx={{ bgcolor: "#faf7f5", borderRadius: 2, p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Mening jo'natmalarim</Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>Fayllar soni: {sub.attachments?.length || 0}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, color: "#4b5563", mb: 2, whiteSpace: "pre-line" }}>{sub.message}</Typography>
                  <Typography sx={{ fontSize: 13, color: "#4b5563", textAlign: "right" }}>{formatDateTime(sub.createdAt)}</Typography>
                </Box>
              ))}

              {/* 3. Teacher feedback */}
              {teacherReplies.map((reply: any, idx: number) => (
                <Box key={idx} sx={{ bgcolor: reply.score >= 60 ? "#f0fdf4" : "#fef2f2", borderRadius: 2, p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>O'qituvchi izohi</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: reply.score >= 60 ? "#16a34a" : "#dc2626" }}>
                      {reply.score >= 60 ? "Vazifa qabul qilindi" : "Vazifa qaytarildi"}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, color: "#111827", mb: 2 }}>{reply.comment || reply.message}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>Tekshiruvchi: {reply.sender?.firstName} {reply.sender?.lastName}</Typography>
                    <Typography sx={{ fontSize: 13, color: "#4b5563" }}>{formatDateTime(reply.createdAt)}</Typography>
                  </Box>
                </Box>
              ))}

              {/* Resubmit after return */}
              {canSubmit && isSubmitted && (
                <SubmissionInput comment={comment} setComment={setComment} selectedFiles={selectedFiles} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} handleSubmit={handleSubmit} submitting={submitting} />
              )}

              {/* Accepted final message */}
              {isGraded && teacherScore >= 60 && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, color: "#16a34a", mt: 2 }}>
                  <CheckCircleOutlineIcon />
                  <Typography>Vazifa muvaffaqiyatli qabul qilingan</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── SIDEBAR (Right) ── */}
      <Box sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0, p: 2, overflowY: "auto", borderLeft: "1px solid #e5e7eb", bgcolor: "white" }}>
        {sidebarLessons.map((l: any) => (
          <Box
            key={l.id}
            onClick={() => router.push(`/dashboard/my-groups/${groupId}/lessons/${l.id}`)}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              bgcolor: l.id === Number(lessonId) ? "#fef3c7" : "#fafaf9",
              border: l.id === Number(lessonId) ? "1px solid #f59e0b" : "1px solid #e7e5e4",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#fef3c7" }
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#292524", mb: 0.5 }}>{l.topic}</Typography>
            <Typography sx={{ fontSize: 12, color: "#78716c" }}>Dars sanasi: {l.dueDate || "-"}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function SubmissionInput({ comment, setComment, selectedFiles, handleFileChange, handleRemoveFile, handleSubmit, submitting }: any) {
  return (
    <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2, bgcolor: "#fff" }}>
      {selectedFiles.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {selectedFiles.map((f: any, i: number) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", bgcolor: "#dcfce7", border: "1px solid #22c55e", borderRadius: 1, px: 1.5, py: 0.5 }}>
              <Typography sx={{ fontSize: 13, color: "#16a34a", mr: 1 }} noWrap>{f.name}</Typography>
              <IconButton size="small" onClick={() => handleRemoveFile(i)} sx={{ color: "#ef4444" }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "flex-end" }}>
        <TextField
          fullWidth multiline maxRows={4} variant="standard"
          placeholder="Fayl biriktiring va izoh qoldiring"
          value={comment} onChange={(e) => setComment(e.target.value)}
          InputProps={{ disableUnderline: true, sx: { fontSize: 14 } }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <input type="file" id="hw-file-upload" multiple style={{ display: "none" }} onChange={handleFileChange} />
          <label htmlFor="hw-file-upload">
            <IconButton component="span" sx={{ color: "#9ca3af" }}><AttachFileIcon /></IconButton>
          </label>
          <IconButton onClick={handleSubmit} disabled={submitting || (!comment && selectedFiles.length === 0)} sx={{ color: submitting ? "#9ca3af" : "#d97706" }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
