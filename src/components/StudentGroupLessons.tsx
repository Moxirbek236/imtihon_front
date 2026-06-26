"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";

import axiosClient from "../api/axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const BASE_URL = "https://seven-oy-crm-backned-1.onrender.com/files/files/";

export default function StudentGroupLessons({ id: groupId }) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<any>(null); // only one open
  const [lessonVideos, setLessonVideos] = useState({});
  const [videosLoading, setVideosLoading] = useState({});
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [currentLessonName, setCurrentLessonName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/students/my/group/${groupId}/lessons`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const filtered = data.filter((l) => l && l.topic);
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setLessons(filtered);

        // Auto-open first lesson that has videos
        const firstWithVideo = filtered.find((l) => (l.videoCount ?? 0) > 0);
        if (firstWithVideo) {
          openLesson(firstWithVideo.id, firstWithVideo.topic, filtered);
        }
      } catch (err) {
        console.error("Darslar yuklanmadi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchVideos = async (lessonId) => {
    if (lessonVideos[lessonId]) return lessonVideos[lessonId];
    setVideosLoading((prev) => ({ ...prev, [lessonId]: true }));
    try {
      const res = await axiosClient.get(`/videos/group/${groupId}`);
      const vids = res.data?.data || [];
      setLessonVideos((prev) => ({ ...prev, [lessonId]: vids }));
      return vids;
    } catch (err) {
      console.error("Videolar yuklanmadi:", err);
      setLessonVideos((prev) => ({ ...prev, [lessonId]: [] }));
      return [];
    } finally {
      setVideosLoading((prev) => ({ ...prev, [lessonId]: false }));
    }
  };

  const openLesson = async (lessonId, lessonTopic, allLessons) => {
    const lList = allLessons || lessons;
    const lesson = lList.find((l) => l.id === lessonId);
    if (!lesson || (lesson.videoCount ?? 0) === 0) return;

    setExpandedId(lessonId);
    setCurrentLessonName(lessonTopic);
    const vids = await fetchVideos(lessonId);
    if (vids.length > 0) {
      setCurrentVideo({ url: vids[0].video_url, name: vids[0].originalname });
    }
  };

  const handleAccordionChange = (lessonId, lessonTopic) => (event, isExpanded) => {
    if (isExpanded) {
      openLesson(lessonId, lessonTopic, lessons);
    } else {
      setExpandedId(null);
    }
  };

  const handleVideoClick = (vid) => {
    setCurrentVideo({ url: vid.video_url, name: vid.originalname });
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "#EEF2F6",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── LEFT: Video Player ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 2, md: 3 },
          minWidth: 0,
          overflowY: "auto",
          bgcolor: "#EEF2F6",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#f59e0b", borderRadius: 10 },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#d97706" },
        }}
      >
        {currentVideo ? (
          <>
            {/* Video player */}
            <Box
              sx={{
                width: "100%",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#000",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                aspectRatio: "16/9",
              }}
            >
              <video
                ref={videoRef}
                key={currentVideo.url}
                controls
                style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
                src={`${BASE_URL}${currentVideo.url}`}
              />
            </Box>

            {/* White card: lesson name + video name */}
            <Box
              sx={{
                mt: 1.5,
                bgcolor: "#fff",
                borderRadius: 2,
                px: 2.5,
                py: 1.5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                  {currentLessonName}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#6b7280" }}>
                  &nbsp;({currentVideo.name})
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#EEF2F6",
              borderRadius: 3,
              border: "1.5px dashed #c8d4e0",
              minHeight: 320,
              gap: 2,
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 56, color: "#d1d5db" }} />
            <Typography sx={{ fontSize: 15, color: "#9ca3af", fontWeight: 500 }}>
              Darsni tanlang va videoni ko'ring
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── RIGHT: Lesson List ── */}
      <Box
        sx={{
          width: { xs: "100%", md: 340 },
          minWidth: { md: 300 },
          maxWidth: { md: 380 },
          bgcolor: "#EEF2F6",
          overflowY: "auto",
          height: "100%",
          flexShrink: 0,
          px: 1.5,
          py: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { bgcolor: "#dde3ea", borderRadius: 10 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#b0bec5", borderRadius: 10 },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#90a4ae" },
        }}
      >
        {loading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} sx={{ color: "#f59e0b" }} />
          </Box>
        ) : lessons.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Darslar topilmadi</Typography>
          </Box>
        ) : (
          lessons.map((lesson) => {
            const hasVideo = (lesson.videoCount ?? 0) > 0;
            const videos = lessonVideos[lesson.id] || [];
            const vLoading = videosLoading[lesson.id];
            const isExpanded = expandedId === lesson.id;

            if (!hasVideo) {
              // Simple non-clickable box
              return (
                <Box
                  key={lesson.id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: "#f5ede8",
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#2d1f17", lineHeight: 1.4 }}>
                    {lesson.topic}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#9c7b6e", mt: 0.3 }}>
                    Dars sanasi: {formatDate(lesson.created_at)}
                  </Typography>
                </Box>
              );
            }

            // Accordion for lessons with video
            return (
              <Accordion
                key={lesson.id}
                expanded={isExpanded}
                onChange={handleAccordionChange(lesson.id, lesson.topic)}
                disableGutters
                elevation={1}
                sx={{
                  borderRadius: "12px !important",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                  bgcolor: isExpanded ? "#dba07a" : "#f5ede8",
                  transition: "background 0.2s",
                  boxShadow: isExpanded
                    ? "0 2px 12px rgba(219,160,122,0.25)"
                    : "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{ color: isExpanded ? "#fff" : "#8b6a5a", fontSize: 22 }}
                    />
                  }
                  sx={{
                    px: 2,
                    py: 0.5,
                    minHeight: "auto",
                    bgcolor: "transparent",
                    "& .MuiAccordionSummary-content": { my: 1 },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isExpanded ? "#fff" : "#2d1f17",
                        lineHeight: 1.4,
                      }}
                    >
                      {lesson.topic}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: isExpanded ? "#ffe0cc" : "#9c7b6e" }}>
                      Dars sanasi: {formatDate(lesson.created_at)}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 0, pt: 0, pb: 1, bgcolor: "transparent" }}>
                  {vLoading ? (
                    <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    </Box>
                  ) : videos.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: "#fff", px: 2, py: 1 }}>
                      Video topilmadi
                    </Typography>
                  ) : (
                    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 1 }}>
                      {videos.map((vid, vIdx) => {
                        const isActive = currentVideo && currentVideo.url === vid.video_url;
                        return (
                          <ListItem
                            key={vid.id}
                            disablePadding
                            onClick={() => handleVideoClick(vid)}
                            sx={{
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              cursor: "pointer",
                              bgcolor: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                              transition: "all 0.15s",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            {isActive ? (
                              <PlayCircleFilledWhiteOutlinedIcon
                                sx={{ fontSize: 22, color: "#fff", flexShrink: 0 }}
                              />
                            ) : (
                              <PanoramaFishEyeIcon
                                sx={{ fontSize: 22, color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
                              />
                            )}
                            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", minWidth: 0 }}>
                              <Typography
                                component="span"
                                sx={{ fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}
                              >
                                {vIdx + 1}-video:
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: 13,
                                  color: "rgba(255,255,255,0.9)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                aria-label={vid.originalname}
                              >
                                {vid.originalname}
                              </Typography>
                            </Box>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>
    </Box>
  );
}
