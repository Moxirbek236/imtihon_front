"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { toast } from "sonner";
import axiosClient from "@/api/axios";

export default function CreatorPanel() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Entities state
  const [centers, setCenters] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [superadmins, setSuperadmins] = useState<any[]>([]);

  // Dialog State
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields (Common)
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");

  // Center Form Extra
  const [selectedCenterId, setSelectedCenterId] = useState<number | string>("");

  // Superadmin Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (tab === 0) {
        // Fetch Centers
        const res = await axiosClient.get("/branches/centers");
        if (res.data?.success) setCenters(res.data.data);
      } else if (tab === 1) {
        // Fetch Branches & Centers for dropdown
        const [resB, resC] = await Promise.all([
          axiosClient.get("/branches"),
          axiosClient.get("/branches/centers"),
        ]);
        if (resB.data?.success) setBranches(resB.data.data);
        if (resC.data?.success) setCenters(resC.data.data);
      } else if (tab === 2) {
        // Fetch Superadmins & Branches for assignment
        const [resU, resB] = await Promise.all([
          axiosClient.get("/users/all?limit=1000"),
          axiosClient.get("/branches"),
        ]);
        if (resU.data?.success) {
          const allUsers = resU.data.data || [];
          setSuperadmins(allUsers.filter((u: any) => u.role === "SUPERADMIN"));
        }
        if (resB.data?.success) setBranches(resB.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
    setAddress("");
    setStatus("active");
    setSelectedCenterId("");
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setSelectedBranchIds([]);
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    if (tab === 0) {
      setName(item.name);
      setAddress(item.address || "");
      setStatus(item.status);
    } else if (tab === 1) {
      setName(item.name);
      setAddress(item.address || "");
      setStatus(item.status);
      setSelectedCenterId(item.center_id);
    } else if (tab === 2) {
      setFullName(item.full_name);
      setEmail(item.email);
      setPhone(item.phone);
      setAddress(item.address || "");
      setStatus(item.status);
      setSelectedBranchIds(item.branches?.map((b: any) => b.id) || []);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (tab === 0) {
        // MARKAZLAR
        if (!name.trim()) return toast.error("Markaz nomini kiriting");
        if (editingId) {
          const res = await axiosClient.put(`/branches/centers/${editingId}`, { name, address, status });
          if (res.data?.success) toast.success("Markaz muvaffaqiyatli tahrirlandi");
        } else {
          const res = await axiosClient.post("/branches/centers", { name, address });
          if (res.data?.success) toast.success("Markaz muvaffaqiyatli qo'shildi");
        }
      } else if (tab === 1) {
        // FILIALLAR
        if (!name.trim() || !selectedCenterId) return toast.error("Filial nomi va markazni tanlang");
        if (editingId) {
          const res = await axiosClient.put(`/branches/${editingId}`, { name, address, status, center_id: Number(selectedCenterId) });
          if (res.data?.success) toast.success("Filial muvaffaqiyatli tahrirlandi");
        } else {
          const res = await axiosClient.post("/branches", { name, address, center_id: Number(selectedCenterId) });
          if (res.data?.success) toast.success("Filial muvaffaqiyatli qo'shildi");
        }
      } else if (tab === 2) {
        // SUPERADMINLAR
        if (editingId) {
          const payload: any = { full_name: fullName, email, phone, address, status, branchIds: selectedBranchIds };
          if (password) payload.password = password;
          const res = await axiosClient.put(`/users/${editingId}`, payload);
          if (res.data?.success) toast.success("Superadmin muvaffaqiyatli tahrirlandi");
        } else {
          if (!fullName || !email || !phone || !password) {
            return toast.error("Iltimos, barcha maydonlarni to'ldiring");
          }
          const res = await axiosClient.post("/users/admin", {
            full_name: fullName,
            email,
            phone,
            password,
            address,
            role: "SUPERADMIN",
            branchIds: selectedBranchIds,
          });
          if (res.data?.success) toast.success("Superadmin muvaffaqiyatli qo'shildi");
        }
      }
      handleClose();
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Amalni bajarishda xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

    try {
      if (tab === 0) {
        await axiosClient.delete(`/branches/centers/${id}`);
      } else if (tab === 1) {
        await axiosClient.delete(`/branches/${id}`);
      } else if (tab === 2) {
        await axiosClient.delete(`/users/${id}`);
      }
      toast.success("Muvaffaqiyatli o'chirildi");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>Creator Boshqaruv Paneli</Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
            Markazlar, filiallar va superadminlarni yaratish va boshqarish
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ bgcolor: "#7c3aed", borderRadius: 2, "&:hover": { bgcolor: "#6d28d9" }, textTransform: "none" }}
        >
          {tab === 0 ? "Markaz qo'shish" : tab === 1 ? "Filial qo'shish" : "Superadmin qo'shish"}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Markazlar (Centers)" />
        <Tab label="Filiallar (Branches)" />
        <Tab label="Superadminlar" />
      </Tabs>

      {loading ? (
        <LinearProgress />
      ) : tab === 0 ? (
        // CENTERS TABLE
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Markaz Nomi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Manzili</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filiallar Soni</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 200 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {centers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell>{c.address || "-"}</TableCell>
                  <TableCell>{c.branches?.length || 0} ta</TableCell>
                  <TableCell>
                    {c.status === "active" ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-green-900 dark:text-green-300">Faol</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-red-900 dark:text-red-300 font-medium">Nofaol</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => handleEditClick(c)} sx={{ textTransform: "none", borderRadius: 2 }}>
                        Tahrirlash
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(c.id)} sx={{ textTransform: "none", borderRadius: 2 }}>
                        O'chirish
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {centers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#6b7280" }}>Markazlar topilmadi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : tab === 1 ? (
        // BRANCHES TABLE
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Filial Nomi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Manzil</TableCell>
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
                      <Button variant="outlined" size="small" onClick={() => handleEditClick(b)} sx={{ textTransform: "none", borderRadius: 2 }}>
                        Tahrirlash
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(b.id)} sx={{ textTransform: "none", borderRadius: 2 }}>
                        O'chirish
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#6b7280" }}>Filiallar topilmadi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        // SUPERADMINS TABLE
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>F.I.SH</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Biriktirilgan filiallar</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 200 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {superadmins.map((u) => (
                <TableRow key={u.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    {u.branches?.map((b: any) => b.name).join(", ") || "-"}
                  </TableCell>
                  <TableCell>
                    {u.status === "active" ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-green-900 dark:text-green-300">Faol</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:bg-red-900 dark:text-red-300">Nofaol</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => handleEditClick(u)} sx={{ textTransform: "none", borderRadius: 2 }}>
                        Tahrirlash
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(u.id)} sx={{ textTransform: "none", borderRadius: 2 }}>
                        O'chirish
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {superadmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#6b7280" }}>Superadminlar topilmadi</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* dialog for add / edit */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? "Tahrirlash" : "Yangi qo'shish"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            
            {/* Tab 0: Center Form */}
            {tab === 0 && (
              <>
                <TextField label="Markaz nomi" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Markaz manzili" fullWidth size="small" value={address} onChange={(e) => setAddress(e.target.value)} />
              </>
            )}

            {/* Tab 1: Branch Form */}
            {tab === 1 && (
              <>
                <TextField label="Filial nomi" fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Manzil" fullWidth size="small" value={address} onChange={(e) => setAddress(e.target.value)} />
                <FormControl size="small" fullWidth>
                  <InputLabel>Markaz</InputLabel>
                  <Select value={selectedCenterId} label="Markaz" onChange={(e) => setSelectedCenterId(e.target.value)}>
                    {centers.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Tab 2: Superadmin Form */}
            {tab === 2 && (
              <>
                <TextField label="F.I.SH" fullWidth size="small" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <TextField label="Email" fullWidth size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Telefon raqam" placeholder="+998901234567" fullWidth size="small" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <TextField label={editingId ? "Parol (o'zgartirish uchun kiriting)" : "Parol"} type="password" fullWidth size="small" value={password} onChange={(e) => setPassword(e.target.value)} />
                <TextField label="Manzil" fullWidth size="small" value={address} onChange={(e) => setAddress(e.target.value)} />
                
                <FormControl size="small" fullWidth>
                  <InputLabel>Biriktirilgan filiallar</InputLabel>
                  <Select
                    multiple
                    value={selectedBranchIds}
                    onChange={(e) => setSelectedBranchIds(e.target.value as number[])}
                    input={<OutlinedInput label="Biriktirilgan filiallar" />}
                    renderValue={(selected) => 
                      branches.filter(b => selected.includes(b.id)).map(b => b.name).join(", ")
                    }
                  >
                    {branches.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        <Checkbox checked={selectedBranchIds.includes(b.id)} />
                        <ListItemText primary={`${b.name} (${b.center?.name || ''})`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {editingId && (
              <FormControl size="small" fullWidth>
                <InputLabel>Holati</InputLabel>
                <Select value={status} label="Holati" onChange={(e) => setStatus(e.target.value)}>
                  <MenuItem value="active">Faol</MenuItem>
                  <MenuItem value="inactive">Nofaol</MenuItem>
                </Select>
              </FormControl>
            )}
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
