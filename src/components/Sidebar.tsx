import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton } from "@mui/material";
import { Groups, PersonOutlined, Settings, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useAuthContext } from "@/lib/auth-provider";
import { normalizeRole } from "@/lib/routes";
import logoImg from '../assets/image.png';

const SIDEBAR_WIDTH = 224;
const COLLAPSED_WIDTH = 64;

export default function Sidebar({ collapsed, onToggle, activeItem, onItemClick }: any) {
  const { role, isReady } = useAuthContext();
  const normalizedRole = normalizeRole(role);

  if (!isReady) return <Box sx={{ width: SIDEBAR_WIDTH, bgcolor: "white", borderRight: "1px solid #e5e7eb" }} />;

  const navItems = [
    ...(normalizedRole === "SUPERADMIN" ? [
      { label: "Boshqarish", icon: <Settings fontSize="small" />, id: "management" }
    ] : []),
    { label: "Guruhlar", icon: <Groups fontSize="small" />, id: "groups" },
  ];

  const profileItem = { label: "Profil", icon: <PersonOutlined fontSize="small" />, id: "profile" };

  const renderItem = (item: any) => {
    // Treat 'my-groups' and 'groups' as the same active state
    const isActive = activeItem === item.id || (activeItem === "my-groups" && item.id === "groups");
    return (
      <ListItemButton
        key={item.id}
        onClick={() => onItemClick(item.id)}
        sx={{
          minHeight: 40,
          px: collapsed ? 2 : '12px',
          py: '10px',
          mb: 0.5,
          borderLeft: isActive ? "2px solid #10b981" : "2px solid transparent",
          bgcolor: isActive ? "#ecfdf5" : "transparent",
          color: isActive ? "#047857" : "#4b5563",
          "&:hover": {
            bgcolor: "#ecfdf5",
            color: "#047857",
            "& .MuiListItemIcon-root": { color: "#047857" },
          },
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 32,
            color: isActive ? "#047857" : "#6b7280",
            justifyContent: "center",
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>
                {item.label}
              </Typography>
            }
          />
        )}
      </ListItemButton>
    );
  };

  return (
    <Box
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "white",
        borderRight: "1px solid #e5e7eb",
        boxSizing: "border-box",
        zIndex: 1200,
        position: "relative",
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, minHeight: 56 }}>
        <Box sx={{ width: 32, height: 32, flexShrink: 0 }}>
           <img src={logoImg.src} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </Box>
        {!collapsed && (
          <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#111827', whiteSpace: 'nowrap' }}>
            Najot Ta'lim
          </Typography>
        )}
      </Box>

      <IconButton
        onClick={onToggle}
        size="small"
        sx={{
          position: "absolute",
          right: -12,
          top: 20,
          bgcolor: "white",
          border: "1px solid #e5e7eb",
          "&:hover": { bgcolor: "#f3f4f6" },
        }}
      >
        {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
      </IconButton>

      <List sx={{ flex: 1, px: 1, pt: 2, overflowY: "auto" }}>
        {navItems.map(renderItem)}
      </List>

      <List sx={{ px: 1, pb: 2 }}>
        {renderItem(profileItem)}
      </List>
    </Box>
  );
}
