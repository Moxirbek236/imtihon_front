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
} from "@mui/material";
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
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [role, setRole] = useState<string>("A");
  const [avatarLetter, setAvatarLetter] = useState<string>("A");
  const router = useRouter();

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
                bgcolor: "#d97706",
                "&:hover": { bgcolor: "#b45309" },
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
          value="O'zbekcha"
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
          <MenuItem value="O'zbekcha">O'zbekcha</MenuItem>
          <MenuItem value="English">English</MenuItem>
        </Select>

        <IconButton size="small" sx={{ color: "#6b7280" }}>
          <Notifications fontSize="small" />
        </IconButton>

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
