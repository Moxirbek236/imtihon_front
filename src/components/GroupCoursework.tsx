"use client";

import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axios";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import VideoUploadModal from "./VideoUploadModal";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PlayCircleOutlined from "@mui/icons-material/PlayCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";

export default function GroupCoursework() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [subTabValue, setSubTabValue] = useState(0);

  // Queries
  const { data: lessonsRes, isLoading: loadingLessons } = useQuery({
    queryKey: ["lessons", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/lessson?groupId=${id}`);
      return res.data;
    },
    enabled: subTabValue === 0,
  });

  const { data: homeworkRes, isLoading: loadingHomework } = useQuery({
    queryKey: ["homeworks", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/home-works/group/${id}`);
      return res.data;
    },
    enabled: subTabValue === 1,
  });

  const { data: attendanceRes, isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendances", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/attendances?groupId=${id}`);
      return res.data;
    },
    enabled: subTabValue === 2,
  });

  const { data: examsRes, isLoading: loadingExams } = useQuery({
    queryKey: ["exams", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/exams/group/${id}`);
      return res.data;
    },
    enabled: subTabValue === 3,
  });

  const lessonsData = lessonsRes?.data || [];
  const homeworkData = homeworkRes?.data || [];
  const attendanceData = attendanceRes?.data || [];
  const examsData = examsRes?.data || [];

  // Video watch modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Video yuklash modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Harakatlar (Actions) menyusi holati
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleMenuOpen = (event, video) => {
    setAnchorEl(event.currentTarget);
    setSelectedVideo(video);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVideo(null);
  };

  const handleEdit = () => {
    alert(`Tahrirlash: ${selectedVideo?.originalname || selectedVideo?.video_url}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedVideo) {
      if (confirm(`Haqiqatan ham ushbu videoni o'chirmoqchimisiz?\n${selectedVideo.originalname || selectedVideo.video_url}`)) {
        setFilesData((prev) => prev.filter((f) => f.id !== selectedVideo.id));
      }
    }
    handleMenuClose();
  const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);
  const { data: lessonVideosRes, isLoading: loadingVideos } = useQuery({
    queryKey: ["lessonVideos", expandedLessonId],
    queryFn: async () => {
      const res = await axiosClient.get(`/videos?lessonId=${expandedLessonId}`);
      return res.data;
    },
    enabled: !!expandedLessonId,
  });
  const lessonVideosData = lessonVideosRes?.data || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatted.replace(/ (\d{4})$/, ", $1");
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeadline = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 20);
    return date.toISOString();
  };

  const formatSize = (sizeMb) => {
    if (sizeMb == null) return "—";
    if (sizeMb >= 1024) return `${(sizeMb / 1024).toFixed(2)} GB`;
    return `${sizeMb.toFixed(2)} MB`;
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setVideoModalOpen(true);
  };

  const handleCloseModal = () => {
    setVideoModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <Box sx={{ px: { xs: 0.5, lg: 1 }, mt: 2 }}>
      {/* Sub Tabs and Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
            Guruh darsliklari
          </Typography>

          <Box sx={{ display: "flex", bgcolor: "#f3f4f6", p: 0.5, borderRadius: 2, gap: 0.5 }}>
            {["Darslar", "Uy ishlari", "Davomat", "Imtihonlar"].map((label, idx) => (
              <Button
                key={idx}
                onClick={() => setSubTabValue(idx)}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  px: 2,
                  py: 0.8,
                  borderRadius: 1.5,
                  bgcolor: subTabValue === idx ? "white" : "transparent",
                  color: subTabValue === idx ? "#111827" : "#6b7280",
                  boxShadow: subTabValue === idx ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  "&:hover": {
                    bgcolor: subTabValue === idx ? "white" : "#e5e7eb",
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            if (subTabValue === 1) {
              setUploadModalOpen(true);
            } else {
              router.push(`/dashboard/groups/${id}/homework/create`);
            }
          }}
          sx={{
            bgcolor: "#10b981",
            textTransform: "none",
            fontSize: 13,
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
            "&:hover": { bgcolor: "#059669" },
          }}
        >
          Qo'shish
        </Button>

        {/* Video Upload Modal */}
        <VideoUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          groupId={id}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["lessons", id] });
            queryClient.invalidateQueries({ queryKey: ["lessonVideos"] });
          }}
        />
      </Box>

      {/* ===== DARSLAR ===== */}
      {subTabValue === 0 && (
        <Paper sx={{ borderRadius: 3, border: "none", boxShadow: "none", overflow: "hidden", bgcolor: "transparent" }}>
          {loadingLessons ? (
            <Typography sx={{ p: 4, textAlign: "center", color: "#6b7280" }}>Yuklanmoqda...</Typography>
          ) : lessonsData.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: "center", color: "#6b7280", bgcolor: "white", borderRadius: 3 }}>
              Darslar mavjud emas
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {lessonsData.map((lesson: any, idx: number) => (
                <Paper key={lesson.id || idx} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", boxShadow: "none" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                        {idx + 1}. {lesson.topic || "Mavzusiz"}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
                        Sana: {formatDate(lesson.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {lesson.hasVideo && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          {expandedLessonId === lesson.id ? "Videolarni yopish" : "Videolarni ko'rish"}
                        </Button>
                      )}
                    </Box>
                  </Box>
                  
                  {expandedLessonId === lesson.id && lesson.hasVideo && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "#f9fafb", borderRadius: 2, border: "1px solid #f3f4f6" }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>Videolar:</Typography>
                      {loadingVideos ? (
                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Yuklanmoqda...</Typography>
                      ) : lessonVideosData.length === 0 ? (
                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Video topilmadi</Typography>
                      ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {lessonVideosData.map((video: any, vIdx: number) => (
                            <Box
                              key={video.id || vIdx}
                              onClick={() => handleFileClick(video)}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1,
                                bgcolor: "white",
                                borderRadius: 1,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "#f3f4f6" }
                              }}
                            >
                              <PlayCircleOutlined sx={{ fontSize: 18, color: "#3b82f6" }} />
                              <Typography sx={{ fontSize: 13, color: "#3b82f6", fontWeight: 500 }}>
                                {video.originalname || video.video_url}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}
      {/* ===== UYGA VAZIFA ===== */}
      {subTabValue === 1 && (
        <Paper sx={{ borderRadius: 3, border: "none", boxShadow: "none", overflow: "hidden", bgcolor: "white" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>#</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Mavzu</th>
                  <th style={{ padding: "16px", color: "#94a3b8", textAlign: "center" }}><PersonOutlined sx={{ fontSize: 20 }} /></th>
                  <th style={{ padding: "16px", color: "#f59e0b", textAlign: "center" }}><TimerOutlined sx={{ fontSize: 20 }} /></th>
                  <th style={{ padding: "16px", color: "#10b981", textAlign: "center" }}><CheckCircleOutlined sx={{ fontSize: 20 }} /></th>
                  <th style={{ padding: "16px", color: "#6b7280", fontSize: "12px", fontWeight: 600 }}>Berilgan vaqt</th>
                  <th style={{ padding: "16px", color: "#6b7280", fontSize: "12px", fontWeight: 600 }}>Tugash vaqti</th>
                  <th style={{ padding: "16px", color: "#6b7280", fontSize: "12px", fontWeight: 600 }}>Dars sanasi</th>
                  <th style={{ padding: "16px", width: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {homeworkData.map((row, idx) => {
                  const isPending = row.stats?.pending > 0;
                  const rowBg = isPending ? "#FF7A59" : "transparent";
                  const textColor = isPending ? "white" : "#4b5563";
                  const boldTextColor = isPending ? "white" : "#111827";
                  
                  return (
                  <tr
                    key={idx}
                    onClick={() => router.push(`/dashboard/groups/${id}/homework/${row.id}/results`)}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      backgroundColor: rowBg,
                    }}
                    onMouseOver={(e) => {
                      if (!isPending) e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                    onMouseOut={(e) => {
                      if (!isPending) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "16px", fontSize: "13px", color: textColor }}>{idx + 1}</td>
                    <td style={{ padding: "16px", fontSize: "13px", width: "450px" }}>
                      <Typography sx={{ fontSize: 13, color: boldTextColor, fontWeight: 500, px: 2 }}>
                        {row.lessons?.topic || row.title}
                      </Typography>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: textColor, textAlign: "center" }}>{row.stats?.totalStudents || 0}</td>
                    <td style={{ padding: "16px", fontSize: "13px", color: textColor, textAlign: "center" }}>{row.stats?.pending || 0}</td>
                    <td style={{ padding: "16px", fontSize: "13px", color: textColor, textAlign: "center" }}>{row.stats?.accepted || 0}</td>
                    <td style={{ padding: "16px", fontSize: "12px", color: textColor, lineHeight: 1.4 }}>
                      {row.created_at
                        ? `${formatDate(row.created_at)} ${formatTime(row.created_at)}`
                        : "—"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "12px", color: textColor, lineHeight: 1.4 }}>
                      {row.created_at
                        ? `${formatDate(getDeadline(row.created_at))} ${formatTime(getDeadline(row.created_at))}`
                        : "—"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: textColor }}>
                      {formatDate(row.lessons?.date)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" sx={{ color: isPending ? "white" : "#94a3b8" }}>
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* ===== VIDEOLAR ===== */}
      {subTabValue === 1 && (
        <Paper sx={{ borderRadius: 3, border: "none", boxShadow: "none", overflow: "hidden", bgcolor: "white" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, width: 48 }}>#</th>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Video nomi</th>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Dars nomi</th>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Status</th>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Dars sanasi</th>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Hajmi</th>
                  <th style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Qo'shilgan vaqti</th>
                  <th style={{ padding: "14px 16px", width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filesData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                      Videolar yo'q
                    </td>
                  </tr>
                ) : (
                  filesData.map((file, idx) => (
                    <tr
                      key={file.id || idx}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background-color 0.15s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563" }}>{idx + 1}</td>

                      {/* Video nomi - bosilganda modal ochiladi */}
                      <td style={{ padding: "16px" }}>
                        <Box
                          onClick={() => handleFileClick(file)}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            color: "#3b82f6",
                            fontWeight: 600,
                            fontSize: 13,
                            "&:hover": { textDecoration: "underline", color: "#2563eb" },
                          }}
                        >
                          <PlayCircleOutlined sx={{ fontSize: 18 }} />
                          {file.originalname || file.video_url}
                        </Box>
                      </td>

                      <td style={{ padding: "16px", fontSize: "13px", color: "#111827" }}>
                        {file.lesson?.topic || "—"}
                      </td>

                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <Box
                          component="span"
                          sx={{
                            px: 1.5,
                            py: 0.4,
                            bgcolor: "#dcfce7",
                            color: "#16a34a",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Tayyor
                        </Box>
                      </td>

                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563", textAlign: "center" }}>
                        {file.lesson?.created_at ? formatDate(file.lesson.created_at) : "—"}
                      </td>

                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                        {formatSize(file.size_mb)}
                      </td>

                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563", textAlign: "center" }}>
                        {file.created_at ? formatDate(file.created_at) : "—"}
                      </td>

                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, file)}>
                          <MoreVert sx={{ fontSize: 18, color: "#94a3b8" }} />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* ===== DAVOMAT ===== */}
      {subTabValue === 2 && (
        <Paper sx={{ borderRadius: 3, border: "none", boxShadow: "none", overflow: "hidden", bgcolor: "white" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>#</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Dars Sana</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>O'quvchi</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Holati</th>
                </tr>
              </thead>
              <tbody>
                {loadingAttendance ? (
                  <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Yuklanmoqda...</td></tr>
                ) : attendanceData.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Davomat yo'q</td></tr>
                ) : (
                  attendanceData.map((row: any, idx: number) => (
                    <tr key={row.id || idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px", fontSize: "13px" }}>{idx + 1}</td>
                      <td style={{ padding: "16px", fontSize: "13px" }}>{formatDate(row.date)}</td>
                      <td style={{ padding: "16px", fontSize: "13px" }}>{row.student?.full_name}</td>
                      <td style={{ padding: "16px", fontSize: "13px", textAlign: "center" }}>
                        <span style={{
                          padding: "4px 8px", borderRadius: "12px", fontSize: "12px",
                          backgroundColor: row.status === 'present' ? '#dcfce7' : '#fee2e2',
                          color: row.status === 'present' ? '#16a34a' : '#ef4444'
                        }}>
                          {row.status === 'present' ? 'Kelgan' : 'Kelmagan'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* ===== IMTIHONLAR ===== */}
      {subTabValue === 3 && (
        <Paper sx={{ borderRadius: 3, border: "none", boxShadow: "none", overflow: "hidden", bgcolor: "white" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>#</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Sarlavha</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Boshlanish vaqti</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>Tugash vaqti</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Holati</th>
                  <th style={{ padding: "16px", color: "#94a3b8", fontSize: "12px", fontWeight: 600, textAlign: "center" }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loadingExams ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Yuklanmoqda...</td></tr>
                ) : examsData.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Imtihonlar mavjud emas</td></tr>
                ) : (
                  examsData.map((exam: any, idx: number) => (
                    <tr key={exam.id || idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563" }}>{idx + 1}</td>
                      <td style={{ padding: "16px", fontSize: "13px", fontWeight: 500, color: "#111827" }}>{exam.title}</td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563" }}>
                        {formatDate(exam.start_date)} {formatTime(exam.start_date)}
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#4b5563" }}>
                        {formatDate(exam.end_date)} {formatTime(exam.end_date)}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          padding: "4px 8px", borderRadius: "12px", fontSize: "12px",
                          backgroundColor: exam.is_published ? '#dcfce7' : '#fef9c3',
                          color: exam.is_published ? '#16a34a' : '#ca8a04'
                        }}>
                          {exam.is_published ? 'Elon qilingan' : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {!exam.is_published && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ textTransform: "none" }}
                            onClick={async () => {
                              try {
                                await axiosClient.post(`/exams/${exam.id}/publish`);
                                queryClient.invalidateQueries({ queryKey: ["exams", id] });
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            E'lon qilish
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* ===== VIDEO MODAL ===== */}
      <Dialog
        open={videoModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#111827",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#111827",
            color: "white",
            py: 1.5,
            px: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PlayCircleOutlined sx={{ fontSize: 20, color: "#60a5fa" }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "white" }}>
              {selectedFile?.originalname || selectedFile?.lesson?.topic || "Video"}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} size="small" sx={{ color: "#9ca3af", "&:hover": { color: "white" } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: "#000", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedFile?.video_url && (
            <video
              controls
              autoPlay
              style={{ width: "100%", height: "100%", maxHeight: "520px", display: "block" }}
              src={`https://seven-oy-crm-backned-1.onrender.com/files/files/${selectedFile.video_url}`}
            >
              Brauzeringiz video formatini qo'llab-quvvatlamaydi.
            </video>
          )}
        </DialogContent>

        {/* Video info footer */}
        <Box
          sx={{
            bgcolor: "#1f2937",
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            Fayl:{" "}
            <Box component="span" sx={{ color: "#d1d5db", fontWeight: 600 }}>
              {selectedFile?.originalname || selectedFile?.video_url}
            </Box>
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            Hajmi:{" "}
            <Box component="span" sx={{ color: "#d1d5db", fontWeight: 600 }}>
              {formatSize(selectedFile?.size_mb)}
            </Box>
          </Typography>
          {selectedFile?.lesson?.topic && (
            <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
              Dars:{" "}
              <Box component="span" sx={{ color: "#d1d5db", fontWeight: 600 }}>
                {selectedFile.lesson.topic}
              </Box>
            </Typography>
          )}
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            Sana:{" "}
            <Box component="span" sx={{ color: "#d1d5db", fontWeight: 600 }}>
              {formatDate(selectedFile?.created_at)}
            </Box>
          </Typography>
        </Box>
      </Dialog>

      {/* Actions Menu (Tahrirlash / O'chirish) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        elevation={0}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            border: "1px solid #f1f5f9",
            p: 1.5,
            mt: 0.5,
            overflow: "visible",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
              borderLeft: "1px solid #f1f5f9",
              borderTop: "1px solid #f1f5f9",
            }
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#4b5563",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            gap: 1.2,
            py: 0.8,
            px: 2.5,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            minWidth: "130px",
            transition: "0.2s",
            "&:hover": {
              bgcolor: "#f9fafb",
              borderColor: "#d1d5db",
            },
          }}
        >
          <EditOutlined sx={{ fontSize: 16, color: "#6b7280" }} />
          Tahrirlash
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#ef4444",
            borderRadius: "8px",
            border: "1px solid #fca5a5",
            gap: 1.2,
            py: 0.8,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            minWidth: "130px",
            transition: "0.2s",
            "&:hover": {
              bgcolor: "#fef2f2",
              borderColor: "#f87171",
            },
          }}
        >
          <DeleteOutlined sx={{ fontSize: 16, color: "#ef4444" }} />
          O'chirish
        </MenuItem>
      </Menu>
    </Box>
  );
}
