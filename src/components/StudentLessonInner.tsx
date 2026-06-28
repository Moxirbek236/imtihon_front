"use client";

import { Box, Typography, CircularProgress, TextField, IconButton, Collapse, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "../api/axios";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

const BASE_URL = "https://seven-oy-crm-backned-1.onrender.com/files/files/";

const getFileList = (attachments: any) => {
  if (!attachments) return [];
  if (Array.isArray(attachments)) {
    const list: string[] = [];
    attachments.forEach((att: any) => {
      if (typeof att === "string" && att.trim().startsWith("[")) {
        try {
          list.push(...JSON.parse(att));
        } catch {
          list.push(att);
        }
      } else {
        list.push(att);
      }
    });
    return list;
  }
  if (typeof attachments === "string") {
    if (attachments.trim().startsWith("[")) {
      try {
        return JSON.parse(attachments);
      } catch {
        return [attachments];
      }
    }
    return [attachments];
  }
  return [];
};

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

  const [groupVideos, setGroupVideos] = useState<any[]>([]);

  useEffect(() => {
    // Faqat 1 marta (yoki groupId o'zgarganda) group ma'lumotlarini olamiz
    const fetchGroupData = async () => {
      try {
        const vidRes = await axiosClient.get(`/videos/group/${groupId}`);
        setGroupVideos(vidRes.data?.data || []);

        const slRes = await axiosClient.get(`/students/my/group/${groupId}/lessons-lite`);
        const slData = Array.isArray(slRes.data) ? slRes.data : slRes.data?.data || [];
        setSidebarLessons(slData);
      } catch (err) {
        console.error("Group ma'lumotlarini olishda xatolik:", err);
      }
    };
    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    // Har gal lessonId o'zgarganda dars ma'lumotini yuklaymiz
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/students/my/group/${groupId}/lesson/${lessonId}`);
        setData(res.data?.data);
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [groupId, lessonId]);

  useEffect(() => {
    // Joriy dars o'zgarganda, avtomat birinchi videoni qo'yamiz
    if (groupVideos.length > 0) {
      const vids = groupVideos.filter((v: any) => v.lesson_id === Number(lessonId));
      setCurrentVideo(vids.length > 0 ? vids[0] : null);
    } else {
      setCurrentVideo(null);
    }
  }, [groupVideos, lessonId]);

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
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#374151", mb: 1 }}>
              {lesson?.name} {currentVideo && `(${currentVideo.originalname || "video"})`}
            </Typography>
            {lesson?.description && (
              <Typography sx={{ fontSize: 14, color: "#4b5563", whiteSpace: "pre-line", mt: 1 }}>
                {lesson.description}
              </Typography>
            )}
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
                {getFileList(homeworkInfo.attachments).length > 0 && (
                  <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {getFileList(homeworkInfo.attachments).map((file: string, idx: number) => (
                      <Button
                        key={idx}
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(`${BASE_URL}${file}`, "_blank")}
                        sx={{ textTransform: "none", borderRadius: 1.5, borderColor: "#d97706", color: "#d97706", "&:hover": { borderColor: "#b45309", bgcolor: "#fffbeb" } }}
                      >
                        Faylni yuklab olish ({idx + 1})
                      </Button>
                    ))}
                  </Box>
                )}
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
                  {getFileList(sub.attachments).length > 0 && (
                    <Box sx={{ mt: 2, mb: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                      {getFileList(sub.attachments).map((file: string, idx: number) => (
                        <Button
                          key={idx}
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(`${BASE_URL}${file}`, "_blank")}
                          sx={{ textTransform: "none", borderRadius: 1.5, borderColor: "#3b82f6", color: "#3b82f6", "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" } }}
                        >
                          Faylni ko'rish ({idx + 1})
                        </Button>
                      ))}
                    </Box>
                  )}
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

              {/* Resubmit after return block removed as per user request (only 1 submission allowed) */}

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
          <SidebarLessonItem
            key={`${l.type}-${l.id}`}
            lesson={l}
            groupId={groupId}
            isActive={l.type === "lesson" && l.id === Number(lessonId)}
            currentVideo={currentVideo}
            setCurrentVideo={setCurrentVideo}
            router={router}
            groupVideos={groupVideos}
          />
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

function SidebarLessonItem({ lesson, isActive, groupId, currentVideo, setCurrentVideo, router, groupVideos }: any) {
  const [expanded, setExpanded] = useState(isActive);
  const videos = lesson.type === "lesson"
    ? (groupVideos?.filter((v: any) => v.lesson_id === lesson.id) || [])
    : [];

  useEffect(() => {
    if (isActive) {
      setExpanded(true);
    }
  }, [isActive]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    if (!isActive) {
      if (lesson.type === "exam") {
        router.push(`/dashboard/my-groups/${groupId}/exams/${lesson.id}`);
      } else {
        router.push(`/dashboard/my-groups/${groupId}/lessons/${lesson.id}`);
      }
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        onClick={toggleExpand}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: isActive ? "#fde68a" : "#fafaf9", // Active style from screenshot (orange-ish)
          border: isActive ? "1px solid #f59e0b" : "1px solid #e7e5e4",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s",
          "&:hover": { bgcolor: isActive ? "#fde68a" : "#fef3c7" },
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#292524", mb: 0.5 }}>{lesson.topic || lesson.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "#78716c" }}>Dars sanasi: {lesson.dueDate || "-"}</Typography>
        </Box>
        {lesson.hasVideo && (
          <ExpandMoreIcon sx={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s", color: "#6b7280" }} />
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {videos.map((vid: any, idx: number) => {
            const isSelected = currentVideo?.id === vid.id;
            return (
              <Box
                key={vid.id}
                onClick={() => setCurrentVideo(vid)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isSelected ? "#fcd34d" : "#fef3c7",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  transition: "0.2s",
                  "&:hover": { bgcolor: "#fcd34d" }
                }}
              >
                {isSelected ? (
                  <RadioButtonCheckedIcon sx={{ fontSize: 18, color: "#d97706" }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#d97706" }} />
                )}
                <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                  {idx + 1}-video: {vid.originalname || vid.video_url}
                </Typography>
              </Box>
            );
          })}
          {videos.length === 0 && lesson.hasVideo && (
            <Typography sx={{ fontSize: 12, color: "#9ca3af", ml: 2, mt: 1 }}>Videolar topilmadi</Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
