"use client";

import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack, LockResetOutlined, PhoneIphoneOutlined, VpnKeyOutlined } from "@mui/icons-material";
import Image from "next/image";
import axiosClient from "../api/axios";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("+998");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const router = useRouter();

  const showAlert = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 9) {
      setError("Telefon raqamni to'g'ri kiriting!");
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post("/auth/send-otp", { phone });
      setError("");
      showAlert("Tasdiqlash kodi yuborildi!", "success");
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || "Xatolik yuz berdi.";
      setError(message);
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!code.trim()) {
      setError("Kodni kiriting!");
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post("/auth/verify-otp", { phone, code });
      setError("");
      showAlert("Kod tasdiqlandi!", "success");
      setStep(3);
    } catch (err) {
      const message = err.response?.data?.message || "Kod noto'g'ri.";
      setError(message);
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword !== confirmPassword) {
      setError("Parollar mos tushmadi!");
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post("/auth/reset-password", { phone, newPassword });
      setError("");
      showAlert("Parolingiz muvaffaqiyatli yangilandi!", "success");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Xatolik yuz berdi.";
      setError(message);
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: '12px',
      bgcolor: '#f8fafc',
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "2px" },
      transition: "all 0.2s ease-in-out",
    },
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden", bgcolor: "#f1f5f9" }}>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => handleCloseSnackbar()} severity={snackbar.severity as "success" | "error"} variant="filled" sx={{ borderRadius: 2, fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Decorative Left Side */}
      <Box sx={{
        flex: 1.2,
        position: "relative",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        color: "white",
        overflow: "hidden",
      }}>
        {/* Background Patterns */}
        <Box sx={{ position: "absolute", top: "-10%", right: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(60px)" }} />
        <Box sx={{ position: "absolute", bottom: "-10%", left: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(80px)" }} />
        
        <Box sx={{ zIndex: 1, textAlign: "center", p: 4, maxWidth: "500px" }}>
          <LockResetOutlined sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: "-0.5px" }}>Xavfsiz va Ishonchli</Typography>
          <Typography sx={{ fontSize: 18, opacity: 0.85, lineHeight: 1.6 }}>
            Parolingizni unutdingizmi? Hechqisi yo'q. Bir necha qadamda uni tiklashingiz mumkin. Sizning xavfsizligingiz biz uchun muhim.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Form */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#ffffff",
        position: "relative",
      }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.push("/login")} 
          sx={{ position: "absolute", top: 32, left: 32, color: "#64748b", textTransform: "none", fontWeight: 600, "&:hover": { color: "#0f172a" } }}
        >
          Orqaga
        </Button>

        <Box sx={{ width: "100%", maxWidth: 420, px: 3 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>Parolni tiklash</Typography>
            <Typography sx={{ color: "#64748b", fontSize: 15 }}>Tizimga qayta kirish uchun parolni yangilang</Typography>
          </Box>

          <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 6, "& .MuiStepIcon-root": { color: "#e2e8f0" }, "& .MuiStepIcon-root.Mui-active": { color: "#6366f1" }, "& .MuiStepIcon-root.Mui-completed": { color: "#10b981" } }}>
            <Step><StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 600 } }}>Telefon</StepLabel></Step>
            <Step><StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 600 } }}>Kod</StepLabel></Step>
            <Step><StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 600 } }}>Yangi parol</StepLabel></Step>
          </Stepper>

          {step === 1 && (
            <Box sx={{ animation: "fadeIn 0.4s ease-out" }}>
              <TextField
                fullWidth
                label="Telefon raqam"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIphoneOutlined sx={{ color: "#94a3b8" }}/></InputAdornment>,
                }}
                sx={inputSx}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendOtp}
                disabled={loading}
                sx={{
                  bgcolor: "#6366f1", py: 1.6, fontSize: 16, fontWeight: 700, borderRadius: '12px', textTransform: "none",
                  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
                  "&:hover": { bgcolor: "#4f46e5", boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.4)" },
                  transition: "all 0.2s"
                }}
              >
                Kodni yuborish
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ animation: "fadeIn 0.4s ease-out" }}>
              <Typography sx={{ textAlign: "center", mb: 3, color: "#475569", fontSize: 14 }}>
                <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{phone}</Box> raqamiga yuborilgan 6 xonali kodni kiriting
              </Typography>
              <TextField
                fullWidth
                label="Tasdiqlash kodi"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={!!error}
                helperText={error}
                sx={inputSx}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={loading}
                sx={{
                  bgcolor: "#6366f1", py: 1.6, fontSize: 16, fontWeight: 700, borderRadius: '12px', textTransform: "none",
                  boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
                  "&:hover": { bgcolor: "#4f46e5" },
                }}
              >
                Tasdiqlash
              </Button>
            </Box>
          )}

          {step === 3 && (
            <Box sx={{ animation: "fadeIn 0.4s ease-out" }}>
              <TextField
                fullWidth
                label="Yangi parol"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={!!error}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><VpnKeyOutlined sx={{ color: "#94a3b8" }}/></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#94a3b8" }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
              <TextField
                fullWidth
                label="Parolni tasdiqlang"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><VpnKeyOutlined sx={{ color: "#94a3b8" }}/></InputAdornment>,
                }}
                sx={inputSx}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleResetPassword}
                disabled={loading}
                sx={{
                  bgcolor: "#10b981", py: 1.6, fontSize: 16, fontWeight: 700, borderRadius: '12px', textTransform: "none",
                  boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Saqlash va Kirish
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}
