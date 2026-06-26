"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Card,
  Drawer,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Close,
  PaymentsOutlined,
  Search,
} from "@mui/icons-material";
import ManagementTabs from "./ManagementTabs";
import axiosClient from "../api/axios";

const bgColors = ["#eff6ff", "#faf5ff", "#fffbeb", "#ecfdf5", "#fdf2f8"];

export default function CoursesClient({ initialCourses, initialPagination, searchParams }) {
  const router = useRouter();
  
  const [courses, setCourses] = useState(initialCourses || []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    price: 0,
    duration_hours: 0,
    duration_month: 0,
  }); 
  const [editId, setEditId] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [page, setPage] = useState(initialPagination?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [search, setSearch] = useState(searchParams?.search || "");

  useEffect(() => {
    setCourses(initialCourses);
    setTotalPages(initialPagination?.totalPages || 1);
  }, [initialCourses, initialPagination]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams?.search || "") || page !== (Number(searchParams?.page) || 1)) {
        router.push(`?page=${page}&search=${search}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search, router, searchParams]);

  const handleAddOpen = () => {
    setCourseData({ name: "", description: "", price: 0, duration_hours: 0, duration_month: 0 });
    setEditId(null);
    setIsDrawerOpen(true);
  };

  const handleEditOpen = (course) => {
    setCourseData({
      name: course.name,
      description: course.description,
      price: course.price,
      duration_hours: course.duration_hours,
      duration_month: course.duration_month,
    });
    setEditId(course.id);
    setIsDrawerOpen(true);
  };

  async function handleSaveCourse() {
    try {
      if (editId) {
        const res = await axiosClient.patch(`/courses/${editId}`, {
          ...courseData,
          price: Number(courseData.price),
          duration_hours: Number(courseData.duration_hours),
          duration_month: Number(courseData.duration_month)
        });
        if (res.data?.success) {
          setIsDrawerOpen(false);
          router.refresh();
        }
      } else {
        const res = await axiosClient.post("/courses", {
          ...courseData,
          price: Number(courseData.price),
          duration_hours: Number(courseData.duration_hours),
          duration_month: Number(courseData.duration_month)
        }); 
        if (res.status === 201 || res.data?.success) {
          setIsDrawerOpen(false);
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Kurslar saqlanmadi:", error);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await axiosClient.delete(`/courses/${deleteId}`);
      if (res.data?.success) {
        setIsDeleteDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Kurs o'chirilmadi:", error);
    }
  };

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      {/* Title */}
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 1, color: "#111827" }}>
        Boshqarish
      </Typography>

      {/* Management Tabs */}
      <ManagementTabs />

      <Box sx={{ bgcolor: "white", borderRadius: 3, p: 3, border: "1px solid #e5e7eb" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Kurslar</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              size="small"
              placeholder="Qidiruv..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ color: "#9ca3af", fontSize: 20 }} /></InputAdornment>,
              }}
              sx={{ width: 250, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f9fafb", "& fieldset": { borderColor: "#e5e7eb" } } }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddOpen}
              sx={{
                bgcolor: "#7c3aed",
                "&:hover": { bgcolor: "#5b21b6" },
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "none",
                px: 2,
              }}
            >
              Kurslar qo'shish
            </Button>
          </Box>
        </Box>

        {/* Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
          {courses.map((course, index) => (
            <Card
              key={course.id}
              elevation={0}
              sx={{
                bgcolor: bgColors[index % bgColors.length],
                border: "1px solid transparent",
                borderRadius: 3,
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {course.name}
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, flex: 1 }}>
                  {course.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 0, mt: -0.5, mr: -1 }}>
                  <IconButton onClick={() => { setDeleteId(course.id); setIsDeleteDialogOpen(true); }} size="small" sx={{ color: "#ef4444", p: 0.5 }}>
                    <Delete sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton onClick={() => handleEditOpen(course)} size="small" sx={{ color: "#7c3aed", p: 0.5 }}>
                    <Edit sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {[
                  `${course.duration_hours * 60} min`,
                  `${course.duration_month} oy`,
                  course.price
                ].map((badge, i) => (
                  <Chip
                    key={i}
                    label={badge}
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: "#4b5563",
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid #e5e7eb",
                      borderRadius: 1.5,
                      height: 22,
                    }}
                  />
                ))}
              </Box>
            </Card>
          ))}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} shape="rounded" color="primary" sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: "#7c3aed", color: "white" } }} />
          </Box>
        )}
      </Box>

      {/* Add Course Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ width: 400, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e5e7eb" }}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Kurs qo'shish</Typography>
              <Typography sx={{ fontSize: 13, color: "#6b7280", mt: 0.5 }}>
                Bu yerda siz yangi kurs qo'shishingiz mumkin.
              </Typography>
            </Box>
            <IconButton onClick={() => setIsDrawerOpen(false)} size="small" sx={{ color: "#9ca3af", mt: -0.5, mr: -0.5 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 2.5, overflowY: "auto" }}>
            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>Nomi</Typography>
              <TextField value={courseData.name} onChange={(e) => setCourseData({...courseData, name: e.target.value})} fullWidth size="small" placeholder="HR Manager..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>Dars davomiyligi</Typography>
              <TextField value={courseData.duration_hours} onChange={(e) => setCourseData({...courseData, duration_hours: Number(e.target.value)})} select fullWidth size="small" SelectProps={{ displayEmpty: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, color: "#6b7280" }}>
                <MenuItem value={0} disabled sx={{ color: "#9ca3af" }}>Tanlang</MenuItem>
                <MenuItem value={1}>60 min</MenuItem>
                <MenuItem value={1.5}>90 min</MenuItem>
                <MenuItem value={2}>120 min</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>Kurs davomiyligi (oylarda)</Typography>
              <TextField value={courseData.duration_month} onChange={(e) => setCourseData({...courseData, duration_month: Number(e.target.value)})} select fullWidth size="small" SelectProps={{ displayEmpty: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, color: "#6b7280" }}>
                <MenuItem value={0} disabled sx={{ color: "#9ca3af" }}>Tanlang</MenuItem>
                <MenuItem value={1}>1 oy</MenuItem>
                <MenuItem value={3}>3 oy</MenuItem>
                <MenuItem value={6}>6 oy</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>Narx</Typography>
              <TextField
                value={courseData.price}
                onChange={(e) => setCourseData({...courseData, price: Number(e.target.value)})}
                fullWidth
                size="small"
                placeholder="Narxini kiriting"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentsOutlined fontSize="small" sx={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, mb: 0.5, fontWeight: 600, color: "#374151" }}>Description</Typography>
              <TextField
                value={courseData.description}
                onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                fullWidth
                multiline
                rows={3}
                placeholder="A little about the company and the team that you'll be working with."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.8 }}>This is a hint text to help user.</Typography>
            </Box>

          </Box>

          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setIsDrawerOpen(false)} sx={{ color: "#374151", borderColor: "#e5e7eb", textTransform: "none", fontWeight: 600, borderRadius: 2, "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" } }}>
              Bekor qilish
            </Button>
            <Button onClick={handleSaveCourse} variant="contained" sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#5b21b6" }, textTransform: "none", fontWeight: 600, borderRadius: 2, boxShadow: "none" }}>
              Saqlash
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Kursni o'chirish</DialogTitle>
        <DialogContent>
          <Typography>Rostdan ham ushbu kursni o'chirishni xohlaysizmi?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)} sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}>Bekor qilish</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none", borderRadius: 2 }}>Ha</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
