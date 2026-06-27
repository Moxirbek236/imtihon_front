"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { toast } from "sonner";
import axiosClient from "../api/axios";

export default function StudentSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await axiosClient.get("/students/my/profile");
      if (res.data?.success) {
        setProfile(res.data.data);
        setFullName(res.data.data.full_name);
        setAddress(res.data.data.address || "");
        setPhone(res.data.data.phone || "");
      }
    } catch (error) {
      console.error("Profil yuklanmadi", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosClient.put("/students/my/profile", {
        full_name: fullName,
        address: address,
      });
      if (res.data?.success) {
        toast.success("Profil muvaffaqiyatli saqlandi!");
        fetchProfile();
      }
    } catch (error) {
      toast.error("Profilni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3.5, display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>Sozlamalar</Typography>
      <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 4 }}>
        Shaxsiy ma'lumotlaringizni tahrirlang
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3, textAlign: "center", py: 4 }}>
            <Avatar 
              src={profile?.photo ? `http://localhost:3000/uploads/${profile.photo}` : ""} 
              sx={{ width: 120, height: 120, mx: "auto", mb: 2, fontSize: 40 }}
            />
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{profile?.full_name}</Typography>
            <Typography sx={{ color: "#6b7280", fontSize: 14 }}>Talaba</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>Umumiy ma'lumotlar</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1, color: "#374151" }}>F.I.SH</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1, color: "#374151" }}>Telefon raqam</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={phone}
                    disabled
                    helperText="Telefon raqamni o'zgartirish uchun adminga murojaat qiling"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1, color: "#374151" }}>Manzil</Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                <Button 
                  variant="contained" 
                  onClick={handleSave} 
                  disabled={saving}
                  sx={{ bgcolor: "#7c3aed", px: 4, "&:hover": { bgcolor: "#6d28d9" } }}
                >
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
