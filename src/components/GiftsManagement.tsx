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
  Tabs,
  Tab,
} from "@mui/material";
import { Add, Upload } from "@mui/icons-material";
import { toast } from "sonner";
import axiosClient from "../api/axios";

export default function GiftsManagement() {
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await axiosClient.get("/products");
        if (res.data?.success) setProducts(res.data.data);
      } else {
        const res = await axiosClient.get("/products/purchases");
        if (res.data?.success) setPurchases(res.data.data);
      }
    } catch (error) {
      console.error("Ma'lumotlar yuklanmadi", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!name || !price || !stock) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      if (image) formData.append("image", image);

      const res = await axiosClient.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success("Sovg'a muvaffaqiyatli qo'shildi!");
        setOpen(false);
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setImage(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Sovg'a qo'shishda xatolik yuz berdi");
    }
  };

  const handleConfirmPurchase = async (purchaseId: number) => {
    try {
      const res = await axiosClient.post(`/products/purchases/${purchaseId}/confirm`);
      if (res.data?.success) {
        toast.success("Xarid muvaffaqiyatli tasdiqlandi!");
        fetchData();
      }
    } catch (error) {
      toast.error("Xaridni tasdiqlashda xatolik yuz berdi");
    }
  };

  const handleCancelPurchase = async (purchaseId: number) => {
    try {
      const res = await axiosClient.post(`/products/purchases/${purchaseId}/cancel`);
      if (res.data?.success) {
        toast.success("Xarid bekor qilindi va kumushlar qaytarildi!");
        fetchData();
      }
    } catch (error) {
      toast.error("Xaridni bekor qilishda xatolik yuz berdi");
    }
  };

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 700 }}>Sovg'alar va Xaridlar</Typography>
        {tab === 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ bgcolor: "#7c3aed", borderRadius: 2, "&:hover": { bgcolor: "#6d28d9" } }}
          >
            Yangi sovg'a qo'shish
          </Button>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Sovg'alar (Maxsulotlar)" />
        <Tab label="Xaridlar tarixi" />
      </Tabs>

      {loading ? (
        <LinearProgress />
      ) : tab === 0 ? (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>Rasm</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nomi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Narxi (Kumush)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Qoldiq (Soni)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Holati</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image ? (
                      <Box component="img" src={`https://seven-oy-crm-backned-1.onrender.com/files/files/${p.image}`} sx={{ width: 40, height: 40, objectFit: "cover", borderRadius: 1 }} />
                    ) : (
                      <Box sx={{ width: 40, height: 40, bgcolor: "#e5e7eb", borderRadius: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#d97706" }}>{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>{p.status === "active" ? "Faol" : "Nofaol"}</TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>Ma'lumot topilmadi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Talaba</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sovg'a</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Narxi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sana</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 220 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.student?.full_name}
                    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{p.student?.phone}</Typography>
                  </TableCell>
                  <TableCell>{p.product?.name}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#d97706" }}>{p.price}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleString("ru-RU")}</TableCell>
                  <TableCell>
                    {p.status === "PENDING" && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-yellow-900 dark:text-yellow-300">Kutilmoqda</span>
                    )}
                    {p.status === "COMPLETED" && (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-green-900 dark:text-green-300">Tasdiqlandi</span>
                    )}
                    {p.status === "CANCELLED" && (
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-red-900 dark:text-red-300 font-medium">Rad etildi</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.status === "PENDING" ? (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleConfirmPurchase(p.id)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Tasdiqlash
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleCancelPurchase(p.id)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Rad etish
                        </Button>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>Hozircha xaridlar yo'q</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Yangi sovg'a qo'shish</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Sovg'a nomi"
              size="small"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              sx={{ textTransform: "none", color: "#6b7280", borderColor: "#d1d5db" }}
            >
              Rasm yuklash
              <input type="file" hidden accept="image/*" onChange={(e) => e.target.files && setImage(e.target.files[0])} />
            </Button>
            {image && <Typography sx={{ fontSize: 13, color: "#10b981", mt: -1 }}>Rasm tanlandi: {image.name}</Typography>}
            <TextField
              label="Ta'rifi (ixtiyoriy)"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Narxi (Kumush)"
                size="small"
                type="number"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <TextField
                label="Soni (Zaxira)"
                size="small"
                type="number"
                fullWidth
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Bekor qilish</Button>
          <Button onClick={handleCreate} variant="contained" sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
