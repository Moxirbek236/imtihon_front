"use client";

import { z } from "zod";

const loginSchema = z.object({
  phone: z.string().regex(/^\+998\d{9}$/, "Telefon raqam noto'g'ri (Masalan: +998901234567)"),
  password: z.string().min(1, "Parol kiritilishi shart")
});

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Image from "next/image";
import loginImg from '../assets/study.svg';
import logoImg from '../assets/image.png';
import axiosClient from "../api/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { getHomeRouteForRole, parseLoginResponse, persistAuthSession } from "@/lib/routes";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Eski cookie'lardan qolgan redirect loop'ni tozalash
  useEffect(() => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
  }, []);

  const showAlert = (message: string, severity: "success" | "error" | "warning" | "info" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    const rawPhone = login.replace(/[\s-]/g, "");
    const parsed = loginSchema.safeParse({ phone: rawPhone, password });
    
    if (!parsed.success) {
      const msg = parsed.error.issues[0].message;
      setError(msg);
      showAlert(msg, "error");
      return;
    }

    try {
      const res = await axiosClient.post("/auth/login", {
        phone: rawPhone,
        password,
      });

      const { token, role, user, success } = parseLoginResponse(res.data);

      if (success && token) {
        persistAuthSession(token, role, user);

        setError("");
        showAlert("Muvaffaqiyatli kirdingiz! Yo'naltirilmoqda...", "success");

        const nextPath = searchParams.get("next");
        const destination =
          nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login")
            ? nextPath
            : getHomeRouteForRole(role);

        window.location.href = destination;
      } else {
        setError("Login muvaffaqiyatsiz. Token qaytmadi.");
        showAlert("Login muvaffaqiyatsiz. Token qaytmadi.", "error");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Kirishda xatolik yuz berdi. Qayta urinib ko'ring.";
      setError(message);
      showAlert(message, "error");
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden" }}>

      {/* ===== SUCCESS / ERROR SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 280, boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ===== LEFT PANEL ===== */}
      <Box
        sx={{
          flex: 1,
          background: "#1a2744",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80,
            left: -80,
            width: "50%",
            height: "50%",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -80,
            right: -60,
            width: "45%",
            height: "45%",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          },
        }}
      >
        <img src={loginImg.src} alt="logo" />
      </Box>

      {/* ===== RIGHT PANEL ===== */}
      <Box
        sx={{
          flex: 1,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 3, sm: 6, lg: 10 },
          py: 5,
          overflowY: "auto",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", width: "100%" }}>
          <Box
            sx={{
              width: "100%",
              maxWidth: 380,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img src={logoImg.src} alt="NajotEdu CRM" style={{ width: "260px", marginBottom: "40px", objectFit: "contain" }} />

            <TextField
              fullWidth
              label="Login"
              placeholder="Loginni kiriting"
              variant="outlined"
              size="small"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!error}
              sx={{ mb: 2.5 }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Parol"
              placeholder="Parolni kiriting"
              variant="outlined"
              size="small"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!error}
              helperText={error}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Typography
                onClick={() => router.push("/forgot-password")}
                sx={{
                  color: "#1a2744",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Parolni unutdingizmi?
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: "#10b981",
                color: "#fff",
                py: 1.3,
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: 0.5,
                borderRadius: 1,
                textTransform: "none",
                "&:hover": { background: "#059669" },
                "&:active": { background: "#047857" },
              }}
            >
              Kirish
            </Button>
          </Box>
        </Box>

        <Typography sx={{ color: "#bbb", fontSize: 11, textAlign: "center", mt: 2 }}>
          Copyright &copy; 2026 NajotEdu CRM
        </Typography>
      </Box>
    </Box>
  );
}
