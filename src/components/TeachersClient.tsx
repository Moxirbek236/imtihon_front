"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Checkbox,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Drawer,
  Select,
  MenuItem,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Search,
  FilterList,
  FileUpload,
  Visibility,
  Close,
  CalendarToday,
  SearchOutlined,
  Add as AddIcon,
  Remove,
  HistoryOutlined,
  Email,
} from "@mui/icons-material";
import axiosClient from "../api/axios";

export default function TeachersClient({ initialTeachers, initialPagination, searchParams }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [teachers, setTeachers] = useState(initialTeachers || []);

  const [selected, setSelected] = useState<any[]>([]);
  const [phone, setPhone] = useState("+998");
  const [mail, setMail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const [selectedBranches, setSelectedBranches] = useState<any[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [page, setPage] = useState(initialPagination?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || "");
  const [photo, setPhoto] = useState<any>(null);

  const [editId, setEditId] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const allSelected = selected.length === teachers.length;
  const toggleAll = () => {
    setSelected(allSelected ? [] : teachers.map((t) => t.id));
  };

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await axiosClient.get(`/teachers?page=${page}&limit=10&search=${searchQuery}`);
        if (res.data?.success) {
          setTeachers(res.data.data || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error("O'qituvchilar yuklanmadi:", err);
      }
    }
    async function fetchBranches() {
      try {
        const res = await axiosClient.get(`/branches`);
        if (res.data?.success) setAllBranches(res.data.data);
      } catch (err) {
        console.error("Filiallar yuklanmadi:", err);
      }
    }
    fetchTeachers();
    fetchBranches();
  }, [page, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams?.search || "") || page !== (Number(searchParams?.page) || 1)) {
        router.push(`?page=${page}&search=${searchQuery}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchQuery, router, searchParams]);

  useEffect(() => {
    if (!isGroupModalOpen) return;
    if (groupSearch.trim().length < 3) {
      setAllGroups([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axiosClient.get(`/groups?search=${groupSearch.trim()}`);
        if(res?.data?.success) setAllGroups(res.data.data);
      } catch (error) {
        console.error("Guruhlar yuklanmadi:", error);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [groupSearch, isGroupModalOpen]);

  const handleAddOpen = () => {
    setFullName(""); setPhone("+998"); setMail(""); setAddress(""); setPassword(""); setGroups([]); setSelectedBranches([]); setPhoto("");
    setEditId(null);
    setIsDrawerOpen(true);
  };

  const handleEditOpen = (teacher) => {
    setFullName(teacher.full_name);
    setPhone(teacher.phone);
    setMail(teacher.email);
    setAddress(teacher.address);
    setGroups(teacher.groups || []);
    setSelectedBranches(teacher.branches || []);
    setPhoto("");
    setEditId(teacher.id);
    setIsDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await axiosClient.delete(`/teachers/${deleteId}`);
        if (res.data?.success) {
          setIsDeleteDialogOpen(false);
          router.refresh();
        }
    } catch (error) {
      console.error(error);
    }
  };

  async function createTeacher() {
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("phone", phone);
    formData.append("email", mail);
    formData.append("address", address);
    if (password) formData.append("password", password);
    formData.append("groups", JSON.stringify(groups.map(g => g.id)));
    if (photo) formData.append("photo", photo); 
    if (selectedBranches.length > 0) {
      formData.append("branchIds", JSON.stringify(selectedBranches.map(b => b.id)));
    }

    try { 
      if (editId) {
        const res = await axiosClient.put(`/teachers/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.success) {
          setIsDrawerOpen(false);
          router.refresh();
        }
      } else {
        const res = await axiosClient.post("/teachers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }); 
        if (res.data?.success) {
          setIsDrawerOpen(false);
          router.refresh();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box", position: "relative" }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#111827", mb: 0.5 }}>
            O'qituvchilar
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddOpen}
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#5b21b6" },
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
            }}
          >
            O'qituvchi qo'shish
          </Button>
        </Box>
      </Box>

      {/* White Card */}
      <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid #e5e7eb", mt: 2 }}>
        {/* Filters Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          {/* Left: Filters + Arxiv yonma-yon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 2,
                borderColor: "#e5e7eb",
                color: "#374151",
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 2,
                borderColor: "#e5e7eb",
                color: "#374151",
                "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
              }}
            >
              Arxiv
            </Button>
          </Box>

          {/* Right: Search */}
          <TextField
            size="small"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                bgcolor: "#f9fafb",
                "& fieldset": { borderColor: "#e5e7eb" },
              },
              width: 200,
            }}
          />
        </Box>

        {/* Table Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "40px 2fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 130px",
            px: 2,
            py: 1,
            borderBottom: "1px solid #f3f4f6",
            bgcolor: "#fafafa",
          }}
        >
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={selected.length > 0 && !allSelected}
            onChange={toggleAll}
            sx={{ p: 0, "&.Mui-checked": { color: "#7c3aed" }, "&.MuiCheckbox-indeterminate": { color: "#7c3aed" } }}
          />
          {["Nomi ↓", "Guruh", "Telefon raqamlari", "Email", "Manzil", "Yaratilgan sana"].map((col, i) => (
            <Typography
              key={i}
              sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center" }}
            >
              {col}
            </Typography>
          ))}
          <Typography
            sx={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "flex-end" }}
          >
            Amallar
          </Typography>
        </Box>

        {/* Table Rows */}
        {teachers.map((teacher, idx) => (
          <Box
            key={teacher.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "40px 2fr 1.5fr 1.5fr 1.5fr 1.2fr 1.2fr 130px",
              px: 2,
              py: 1.2,
              borderBottom: "1px solid #f9fafb",
              alignItems: "center",
              "&:hover": { bgcolor: "#fafafa" },
              transition: "background 0.15s",
            }}
          >
            {/* Checkbox */}
            <Checkbox
              size="small"
              checked={selected.includes(teacher.id)}
              onChange={() => toggleSelect(teacher.id)}
              sx={{ p: 0, "&.Mui-checked": { color: "#7c3aed" } }}
            />

            {/* Name + Avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={teacher.photo ? `https://seven-oy-crm-backned-1.onrender.com/files/${teacher.photo}` : undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#ede9fe",
                  color: "#7c3aed",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {teacher.full_name?.charAt(0)}
              </Avatar>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                {teacher.full_name} 
              </Typography>
            </Box>

            {/* Groups */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4, alignItems: "center" }}>
              {teacher.groups?.map((g, gi) => (
                <Chip
                  key={gi}
                  label={g.name || g} // Handle both object and string just in case
                  size="small"
                  sx={{
                    fontSize: 11,
                    height: 20,
                    bgcolor: "#f3f4f6",
                    color: "#374151",
                    "& .MuiChip-label": { px: 0.8 },
                  }}
                />
              ))}

            </Box>

            {/* Phone */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>{teacher.phone}</Typography>

            {/* Email */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>{teacher.email}</Typography>

            {/* Address */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>{teacher.address}</Typography>

            {/* Created Date */}
            <Typography sx={{ fontSize: 13, color: "#374151" }}>
              {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString("ru-RU") : "-"}
            </Typography>

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, justifyContent: "flex-end" }}>
  
              <IconButton size="small" sx={{ color: "#6b7280", p: 0.4 }}>
                <Visibility sx={{ fontSize: 16 }} />
              </IconButton>
  
              <IconButton onClick={() => { setDeleteId(teacher.id); setIsDeleteDialogOpen(true); }} size="small" sx={{ color: "#6b7280", p: 0.4 }}>
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton onClick={() => handleEditOpen(teacher)} size="small" sx={{ color: "#7c3aed", p: 0.4 }}>
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} shape="rounded" color="primary" sx={{ "& .MuiPaginationItem-root.Mui-selected": { bgcolor: "#7c3aed", color: "white" } }} />
          </Box>
        )}
      </Box>

      {/* ===================== DRAWER MODAL ===================== */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 420 },
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
            animation: isDrawerOpen ? "slideInRight 0.3s cubic-bezier(0.4,0,0.2,1)" : undefined,
            "@keyframes slideInRight": {
              from: { transform: "translateX(100%)", opacity: 0 },
              to: { transform: "translateX(0)", opacity: 1 },
            },
          },
        }}
        SlideProps={{
          timeout: 300,
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            bgcolor: "white",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              {editId ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.3 }}>
              Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsDrawerOpen(false)}
            size="small"
            sx={{ color: "#6b7280", mt: 0.5 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Telefon raqam */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Telefon raqam
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* Mail */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Mail
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="Elektron pochtani kiriting"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ fontSize: 16, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* O'qituvchi FIO */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              O'qituvchi FIO
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ma'lumotni kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* Guruh */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Guruh
            </Typography>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                minHeight: 40,
                "&:hover": { borderColor: "#7c3aed" },
              }}
            >
              {groups.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {groups.map((g, gi) => (
                    <Chip
                      key={gi}
                      label={g.name}
                      size="small"
                      onDelete={() => setGroups(groups.filter((_, i) => i !== gi))}
                      sx={{
                        fontSize: 12,
                        height: 24,
                        bgcolor: "#ede9fe",
                        color: "#7c3aed",
                        "& .MuiChip-deleteIcon": { color: "#7c3aed", fontSize: 14 },
                      }}
                    />
                  ))}
                </Box>
              )}
              <Button
                variant="text"
                startIcon={<Add />}
                onClick={() =>setIsGroupModalOpen(true)}
                sx={{
                  textTransform: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#7c3aed",
                  minWidth: "auto",
                  p: "4px 8px",
                  "&:hover": { bgcolor: "transparent", opacity: 0.8 },
                }}
              >
                Qo'shish
              </Button>
            </Box>
          </Box>

          {/* Surati */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Surati
            </Typography>
            <Box
              component="label"
              sx={{
                border: "2px dashed #e5e7eb",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                display: "block",
                transition: "border-color 0.2s, bgcolor 0.2s",
                "&:hover": {
                  borderColor: "#7c3aed",
                  bgcolor: "#faf5ff",
                },
              }}
            >
              <input
                type="file"
                hidden
                accept="image/jpeg, image/png"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <Box sx={{ fontSize: 28, mb: 1 }}>☁️</Box> 
              <Typography sx={{ fontSize: 12, color: "#374151" }}>
                <span style={{ color: "#7c3aed", fontWeight: 600, cursor: "pointer" }}>
                  Click to upload
                </span>{" "}
                or drag and drop
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9ca3af", mt: 0.3 }}>
                {photo ? photo.name : "JPG or PNG (max. 800×800px)"}
              </Typography>
            </Box>
          </Box>

          {/* Manzil */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>
              Manzil
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Manzilni kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 13,
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#7c3aed" },
                  "&.Mui-focused fieldset": { borderColor: "#7c3aed" },
                },
              }}
            />
          </Box>

          {/* Parol */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Parol</Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Box>

          {/* Branch */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>Filial</Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setIsBranchModalOpen(true)}
              startIcon={<Add sx={{ fontSize: 18 }} />}
              sx={{
                textTransform: "none",
                fontSize: 13, 
                fontWeight: 600,
                color: "#7c3aed",
                borderColor: "#e5e7eb",
                borderRadius: 2,
                py: 1.2,
                px: 2,
                justifyContent: "flex-start",
                borderWidth: "1px",
                "&:hover": { bgcolor: "#f5f3ff", borderColor: "#7c3aed", borderWidth: "1px" },
              }}
            >
              Filial qo'shish
            </Button>
            {selectedBranches.length > 0 && (
              <Box sx={{ mt: 1.5, p: 1, border: "1px solid #e5e7eb", borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 0.5, bgcolor: "#f9fafb" }}>
                {selectedBranches.map((b) => (
                  <Chip
                    key={b.id}
                    label={b.name}
                    size="small"
                    onDelete={() => setSelectedBranches((prev) => prev.filter((sb) => sb.id !== b.id))}
                    sx={{ height: 24, fontSize: 11, borderRadius: 1.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Drawer Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            bgcolor: "white",
          }}
        >
          <Button
            variant="text"
            onClick={() => setIsDrawerOpen(false)}
            sx={{
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#6b7280",
              borderRadius: 2,
              px: 2.5,
              border: "1px solid #e5e7eb",
              "&:hover": { bgcolor: "#f9fafb" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={createTeacher}
            variant="contained"
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#5b21b6" },
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
            }}
          >
            Saqlash
          </Button>
        </Box>
      </Drawer>
      
      {/* Branch Selection Modal */}
      <Dialog open={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Filialga biriktirish</Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Bir yoki bir nechta filialni tanlang</Typography>
          </Box>
          <IconButton onClick={() => setIsBranchModalOpen(false)} size="small" sx={{ color: "#6b7280" }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <List disablePadding>
              {allBranches.map((b, idx, arr) => {
                  const isChecked = selectedBranches.some(selectedBranch => selectedBranch.id === b.id);
                  return (
                    <ListItem key={b.id} disablePadding sx={{ borderBottom: idx < arr.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                      <Button fullWidth onClick={() => { isChecked ? setSelectedBranches(selectedBranches.filter(sb => sb.id !== b.id)) : setSelectedBranches([...selectedBranches, b]) }} sx={{ justifyContent: "flex-start", px: 2, py: 1.5, textTransform: "none", color: "#111827", "&:hover": { bgcolor: "#f9fafb" } }}>
                        <Checkbox checked={isChecked} size="small" sx={{ p: 0, mr: 1.5, "&.Mui-checked": { color: "#7c3aed" } }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{b.name}</Typography>
                      </Button>
                    </ListItem>
                  );
              })}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsBranchModalOpen(false)} variant="outlined" sx={{ textTransform: "none", fontSize: 13, fontWeight: 600, color: "#374151", borderColor: "#e5e7eb", borderRadius: 2, px: 2, "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" } }}>Bekor qilish</Button>
          <Button onClick={() => setIsBranchModalOpen(false)} variant="contained" sx={{ bgcolor: "#c4b5fd", color: "white", textTransform: "none", fontSize: 13, fontWeight: 600, borderRadius: 2, px: 3, boxShadow: "none", "&:hover": { bgcolor: "#a78bfa" } }}>Qo'shish</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>O'qituvchini o'chirish</DialogTitle>
        <DialogContent>
          <Typography>Rostdan ham ushbu o'qituvchini o'chirishni xohlaysizmi?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="text" onClick={() => setIsDeleteDialogOpen(false)} sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}>Bekor qilish</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none", borderRadius: 2 }}>Ha</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              Guruhga biriktirish
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              Bir yoki bir nechta guruhni tanlang
            </Typography>
          </Box>
          <IconButton onClick={() => setIsGroupModalOpen(false)} size="small" sx={{ color: "#6b7280" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Guruh qidirish..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
          <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <List disablePadding>
              {allGroups.map((g, idx, arr) => {
                  const isChecked = groups.some(selectedGroup => selectedGroup.id === g.id);
                  return (
                    <ListItem
                      key={g.id}
                      disablePadding
                      sx={{
                        borderBottom: idx < arr.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <Button
                        fullWidth
                        onClick={() => {
                          if (isChecked) {
                            setGroups(groups.filter(sg => sg.id !== g.id));
                          } else {
                            setGroups([...groups, g]);
                          }
                        }}
                        sx={{
                          justifyContent: "flex-start",
                          px: 2,
                          py: 1.5,
                          textTransform: "none",
                          color: "#111827",
                          "&:hover": { bgcolor: "#f9fafb" },
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          size="small"
                          sx={{ p: 0, mr: 1.5, "&.Mui-checked": { color: "#7c3aed" } }}
                        />
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {g.name}
                        </Typography>
                      </Button>
                    </ListItem>
                  );
              })}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setIsGroupModalOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              borderColor: "#e5e7eb",
              borderRadius: 2,
              px: 2,
              "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" },
            }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={() => setIsGroupModalOpen(false)}
            variant="contained"
            sx={{
              bgcolor: "#c4b5fd",
              color: "white",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#a78bfa" },
            }}
          >
            Qo'shish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
