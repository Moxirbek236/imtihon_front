import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosClient from "../api/axios";

export default function ExamModal({ open, onClose, groupId, onSuccess }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" | "info" }>({ open: false, message: "", severity: "success" });

  const handleClose = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    onClose();
  };

  const handleUpload = async () => {
    if (!title || !startDate || !endDate) {
      setSnackbar({ open: true, message: "Barcha majburiy maydonlarni to'ldiring!", severity: "warning" });
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post(`/exams`, {
        group_id: groupId,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
      });

      setSnackbar({ open: true, message: `Imtihon muvaffaqiyatli qo'shildi!`, severity: "success" });
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1000);
    } catch (e) {
      console.error("Exam upload error:", e);
      setSnackbar({ open: true, message: "Imtihon yaratishda xatolik yuz berdi!", severity: "error" });
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            Imtihon qo'shish
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#9ca3af" }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5, color: "#374151" }}>Imtihon nomi *</Typography>
            <TextField
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: 1-oy imtihoni"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5, color: "#374151" }}>Boshlanish vaqti *</Typography>
            <TextField
              fullWidth
              type="datetime-local"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5, color: "#374151" }}>Tugash vaqti *</Typography>
            <TextField
              fullWidth
              type="datetime-local"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5, color: "#374151" }}>Ta'rif (ixtiyoriy)</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Imtihon haqida qisqacha ma'lumot..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              textTransform: "none",
              color: "#6b7280",
              fontWeight: 600,
              fontSize: 13,
              px: 2.5,
              borderRadius: 2,
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={15} color="inherit" /> : null}
            sx={{
              textTransform: "none",
              bgcolor: "#7c3aed",
              fontWeight: 600,
              fontSize: 13,
              px: 3,
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" },
            }}
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ fontWeight: 600, fontSize: 13 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
