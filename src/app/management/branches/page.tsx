"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { toast } from "sonner";
import axiosClient from "@/api/axios";

export default function SuperadminBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    setLoading(true);
    try {
      const res = await axiosClient.get("/branches/my-center");
      if (res.data?.success) {
        setBranches(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Filiallarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Filial nomini kiriting");
      return;
    }

    try {
      if (editingId) {
        // Edit Branch
        const res = await axiosClient.put(`/branches/${editingId}`, { name, address });
        if (res.data?.success) {
          toast.success("Filial muvaffaqiyatli tahrirlandi!");
          handleClose();
          fetchBranches();
        }
      } else {
        // Create Branch
        const res = await axiosClient.post("/branches", { name, address });
        if (res.data?.success) {
          toast.success("Yangi filial muvaffaqiyatli qo'shildi!");
          handleClose();
          fetchBranches();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Filialni saqlashda xatolik yuz berdi");
    }
  };

  const handleEditClick = (branch: any) => {
    setEditingId(branch.id);
    setName(branch.name);
    setAddress(branch.address || "");
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu filialni o'chirmoqchimisiz?")) return;

    try {
      const res = await axiosClient.delete(`/branches/${id}`);
      if (res.data?.success) {
        toast.success("Filial muvaffaqiyatli o'chirildi!");
        fetchBranches();
      }
    } catch (err) {
      console.error(err);
      toast.error("Filialni o'chirishda xatolik yuz berdi");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
    setAddress("");
  };

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>Filiallar boshqaruvi</Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
            O'zingizga tegishli filiallarni boshqaring (markaz filiallari)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: "#7c3aed", borderRadius: 2, "&:hover": { bgcolor: "#6d28d9" }, textTransform: "none" }}
        >
          Yangi filial qo'shish
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filial Nomi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Manzili</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Markazi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 200 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{b.name}</TableCell>
                  <TableCell>{b.address || "-"}</TableCell>
                  <TableCell>{b.center?.name || "-"}</TableCell>
                  <TableCell>
                    {b.status === "active" ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-green-900 dark:text-green-300">Faol</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-red-900 dark:text-red-300">Nofaol</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEditClick(b)}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Tahrirlash
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(b.id)}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        O'chirish
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#6b7280" }}>
                    Filiallar topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Branch Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Filialni tahrirlash" : "Yangi filial qo'shish"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Filial nomi"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Manzili"
              fullWidth
              size="small"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">Bekor qilish</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
