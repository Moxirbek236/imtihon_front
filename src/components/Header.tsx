"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Select,
  MenuItem,
  Avatar,
  Box,
  Button,
  Tooltip,
  Menu,
  Typography,
  Divider,
  Badge,
} from "@mui/material";
import { useTranslation } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  Search,
  CalendarToday,
  Add,
  Notifications,
  DarkMode,
  LightMode,
  ExpandMore,
  LogoutOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axiosClient from "../api/axios";
import { clearAuthSession } from "@/lib/routes";

export default function Header({ darkMode, onToggleTheme }) {
  const { lang, changeLang, t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<any>(null);
  const [role, setRole] = useState<string>("A");
  const [avatarLetter, setAvatarLetter] = useState<string>("A");
  const router = useRouter();

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  useEffect(() => {
    const r = localStorage.getItem("role") || "A";
    setRole(r);
    setAvatarLetter(r.charAt(0).toUpperCase());
  }, []);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (e) {
      console.log("Logout failed on server", e);
    }
    clearAuthSession();
    handleClose();
    router.push("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#f3f4f6",
        color: "#111827",
        borderBottom: "0 solid transparent",
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: "56px !important", px: 2 }}>
        {/* Calendar + Add */}
        {role !== "STUDENT" && (
          <>
            <Tooltip title="Kalendar">
              <IconButton size="small" sx={{ color: "#6b7280" }}>
                <CalendarToday fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              endIcon={<ExpandMore />}
              sx={{
                bgcolor: "#7c3aed",
                "&:hover": { bgcolor: "#5b21b6" },
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 1.5,
              }}
            >
              Qo'shish
            </Button>
          </>
        )}

        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            gap: 1,
          }}
        >
          <Search sx={{ color: "#9ca3af", fontSize: 18 }} />
          <InputBase
            placeholder="Qidirish..."
            sx={{ color: "#111827", fontSize: 14, width: 180, "& input::placeholder": { color: "#9ca3af" } }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Lang */}
        <Select
          value={lang}
          onChange={(e) => changeLang(e.target.value as any)}
          size="small"
          IconComponent={ExpandMore}
          sx={{
            color: "#111827",
            fontSize: 13,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
            "& .MuiSvgIcon-root": { color: "#6b7280" },
            borderRadius: 2,
          }}
        >
          <MenuItem value="uz">UZ</MenuItem>
          <MenuItem value="ru">RU</MenuItem>
          <MenuItem value="en">EN</MenuItem>
        </Select>

        <IconButton size="small" onClick={handleNotifClick} sx={{ color: "#6b7280" }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Notifications fontSize="small" />
          </Badge>
        </IconButton>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.12))",
                mt: 1,
                borderRadius: 2.5,
                border: "1px solid #f3f4f6",
                minWidth: 320,
                maxWidth: 360,
                maxHeight: 400,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t("notifications")}</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead} sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: "#7c3aed" }}>
                Barchasini o'qish
              </Button>
            )}
          </Box>
          <Divider />
          <Box sx={{ overflowY: "auto", maxHeight: 320 }}>
            {notifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  handleNotifClose();
                }}
                sx={{
                  py: 1.2,
                  px: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                  bgcolor: n.read ? "transparent" : "#f5f3ff",
                  borderBottom: "1px solid #f3f4f6",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  "&:hover": { bgcolor: n.read ? "#f9fafb" : "#ede9fe" },
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                  {n.title}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#4b5563" }}>
                  {n.message}
                </Typography>
                <Typography sx={{ fontSize: 10, color: "#9ca3af", mt: 0.5 }}>
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </MenuItem>
            ))}
            {notifications.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ color: "#9ca3af", fontSize: 13.5 }}>{t("no_notifications")}</Typography>
              </Box>
            )}
          </Box>
        </Menu>

        <IconButton size="small" onClick={onToggleTheme} sx={{ color: "#6b7280" }}>
          {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>

        {/* Avatar with dropdown */}
        <Tooltip title="Profil">
          <Avatar
            onClick={handleAvatarClick}
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#d97706",
              fontSize: 14,
              cursor: "pointer",
              transition: "opacity 0.2s",
              "&:hover": { opacity: 0.85 },
            }}
          >
            {avatarLetter}
          </Avatar>
        </Tooltip>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.12))",
                mt: 1,
                borderRadius: 2.5,
                border: "1px solid #f3f4f6",
                minWidth: 180,
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                  borderLeft: "1px solid #f3f4f6",
                  borderTop: "1px solid #f3f4f6",
                },
              },
            },
          }}
        >
          {/* User info */}
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#fef3c7", color: "#d97706", fontSize: 15, fontWeight: 700 }}>
              {avatarLetter}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                {role === "STUDENT" ? "O'quvchi" : role === "TEACHER" ? "O'qituvchi" : "Admin"}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Logout */}
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.3,
              px: 2,
              gap: 1.5,
              color: "#ef4444",
              fontWeight: 600,
              fontSize: 14,
              "&:hover": { bgcolor: "#fff1f2" },
              borderRadius: 1.5,
              mx: 0.5,
              my: 0.5,
            }}
          >
            <LogoutOutlined sx={{ fontSize: 18 }} />
            Chiqish
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
