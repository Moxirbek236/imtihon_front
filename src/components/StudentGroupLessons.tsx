"use client";

import {
  Box,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogContent,
  IconButton,
  List,
  ListItem,
  Snackbar,
  Alert
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import axiosClient from "../api/axios";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const BASE_URL = "https://seven-oy-crm-backned-1.onrender.com/file/";

export default function StudentGroupLessons({ id: groupId }) {
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Barchasi");

  const [toastMessage, setToastMessage] = useState("");

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideos, setCurrentVideos] = useState<any[]>([]);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [videosLoading, setVideosLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/students/my/group/${groupId}/lessons`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data?.lessons || [];
        setLessons(data);
        setFilteredLessons(data);
      } catch (err) {
        console.error("Darslar yuklanmadi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [groupId]);

  useEffect(() => {
    if (statusFilter === "Barchasi") {
      setFilteredLessons(lessons);
    } else {
      setFilteredLessons(lessons.filter((l) => l.homeWorkStatus === statusFilter));
    }
  }, [statusFilter, lessons]);

  const handleRowClick = async (lesson: any) => {
    if (lesson.isExam) {
      router.push(`/dashboard/my-groups/${groupId}/exams/${lesson.id}`);
      return;
    }
    
    if (lesson.videoCount === 0 && (!lesson.homeWorkId)) {
      setToastMessage("Uyga vazifa va video mavjud emas");
      return;
    }

    router.push(`/dashboard/my-groups/${groupId}/lessons/${lesson.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Berilmagan": return "#6b7280";
      case "Kutayotgan": return "#6366f1";
      case "Qabul qilingan": return "#22c55e";
      case "Qaytarilgan": return "#f59e0b";
      case "Bajarilmagan": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3, bgcolor: "#f3f4f6", minHeight: "100vh" }}>
      <Typography sx={{ fontSize: 13, color: "#9ca3af", mb: 1 }}>Uy vazifa statusi</Typography>
      <FormControl sx={{ mb: 3, minWidth: 200, bgcolor: "white", borderRadius: 1 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ fontSize: 14 }}
        >
          <MenuItem value="Barchasi">Barchasi</MenuItem>
          <MenuItem value="Qabul qilingan" sx={{ color: "#22c55e", fontWeight: 600 }}>Qabul qilingan</MenuItem>
          <MenuItem value="Berilmagan" sx={{ color: "#6b7280", fontWeight: 600 }}>Berilmagan</MenuItem>
          <MenuItem value="Qaytarilgan" sx={{ color: "#f59e0b", fontWeight: 600 }}>Qaytarilgan</MenuItem>
          <MenuItem value="Bajarilmagan" sx={{ color: "#ef4444", fontWeight: 600 }}>Bajarilmagan</MenuItem>
          <MenuItem value="Kutayotgan" sx={{ color: "#6366f1", fontWeight: 600 }}>Kutayotganlar</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ bgcolor: "white", borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "16px", color: "#111827", fontSize: "13px", fontWeight: 700 }}>Mavzular</th>
                <th style={{ padding: "16px", color: "#111827", fontSize: "13px", fontWeight: 700 }}>Video</th>
                <th style={{ padding: "16px", color: "#111827", fontSize: "13px", fontWeight: 700 }}>Uyga vazifa Holati</th>
                <th style={{ padding: "16px", color: "#111827", fontSize: "13px", fontWeight: 700 }}>
                  Uyga vazifa tugash vaqti <ArrowDownwardIcon sx={{ fontSize: 14, verticalAlign: "middle" }} />
                </th>
                <th style={{ padding: "16px", color: "#111827", fontSize: "13px", fontWeight: 700 }}>
                  Dars sanasi <ArrowUpwardIcon sx={{ fontSize: 14, verticalAlign: "middle", color: "#22c55e" }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px" }}>
                    <CircularProgress size={30} sx={{ color: "#d97706" }} />
                  </td>
                </tr>
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson) => (
                  <tr 
                    key={lesson.id} 
                    style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                    onClick={() => handleRowClick(lesson)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>{lesson.topic}</td>
                    <td style={{ padding: "16px" }}>
                      {lesson.isExam ? (
                        <Box sx={{ display: "inline-block", bgcolor: "#cd9869", color: "white", px: 1.5, py: 0.5, borderRadius: 5, fontSize: 12, fontWeight: 600 }}>
                          Imtihon
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#3b82f6" }}>
                          <PlayCircleOutlineIcon sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontSize: 13 }}>({lesson.videoCount || 0})</Typography>
                        </Box>
                      )}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <Box sx={{ display: "inline-block", bgcolor: getStatusColor(lesson.homeWorkStatus), color: "white", px: 2, py: 0.5, borderRadius: 1.5, fontSize: 13, fontWeight: 500 }}>
                        {lesson.homeWorkStatus === "Kutayotgan" ? "Kutayotganlar" : lesson.homeWorkStatus}
                      </Box>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>
                      {lesson.homeWorkDeadline || "-"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>
                      {lesson.dueDate || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onClose={() => setVideoModalOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderBottom: "1px solid #e5e7eb" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Videolar</Typography>
          <IconButton onClick={() => setVideoModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {videosLoading ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
          ) : currentVideos.length === 0 ? (
            <Typography sx={{ textAlign: "center", py: 4 }}>Ushbu dars uchun video topilmadi.</Typography>
          ) : (
            <>
              {currentVideo && (
                <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden", bgcolor: "#000", aspectRatio: "16/9" }}>
                  <video
                    ref={videoRef}
                    key={currentVideo.video_url}
                    controls
                    autoPlay
                    style={{ width: "100%", height: "100%" }}
                    src={`${BASE_URL}${currentVideo.video_url}`}
                  />
                </Box>
              )}
              <List sx={{ mt: 2 }}>
                {currentVideos.map((vid, idx) => (
                  <ListItem 
                    key={idx} 
                    sx={{ 
                      bgcolor: currentVideo?.id === vid.id ? "#f3f4f6" : "transparent",
                      borderRadius: 1,
                      cursor: "pointer",
                      mb: 1,
                      "&:hover": { bgcolor: "#f9fafb" }
                    }}
                    onClick={() => {
                      setCurrentVideo(vid);
                      if (videoRef.current) {
                        videoRef.current.load();
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                  >
                    <PlayCircleOutlineIcon sx={{ mr: 2, color: currentVideo?.id === vid.id ? "#3b82f6" : "#9ca3af" }} />
                    <Typography>{vid.title || vid.originalname || `Video ${idx + 1}`}</Typography>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!toastMessage}
        autoHideDuration={3000}
        onClose={() => setToastMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setToastMessage("")} severity="info" sx={{ width: "100%", bgcolor: "#ebf5ff", color: "#1e3a8a" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
