import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet, useLocation, NavLink } from 'react-router-dom';

import BookIcon from '@mui/icons-material/Book';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TollIcon from '@mui/icons-material/Toll';
import SendIcon from '@mui/icons-material/Send';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import Sidebar from './Sidebar';
import Header from './Header';
import '../../i18n';

const managementMenuItems = [
  { textKey: 'ManagementCourses', icon: <BookIcon sx={{ fontSize: 20 }} />, path: '/management' },
  { textKey: 'ManagementRooms', icon: <MeetingRoomIcon sx={{ fontSize: 20 }} />, path: '/management/rooms' },
  { textKey: 'ManagementBranches', icon: <BusinessIcon sx={{ fontSize: 20 }} />, path: '/management/branches' },
  { textKey: 'ManagementStaff', icon: <BadgeIcon sx={{ fontSize: 20 }} />, path: '/management/staff' },
  { textKey: 'ManagementReasons', icon: <CategoryIcon sx={{ fontSize: 20 }} />, path: '/management/reasons' },
  { textKey: 'ManagementRoles', icon: <ManageAccountsIcon sx={{ fontSize: 20 }} />, path: '/management/roles' },
  { textKey: 'ManagementCoin', icon: <TollIcon sx={{ fontSize: 20 }} />, path: '/management/coin' },
  { textKey: 'ManagementMessages', icon: <SendIcon sx={{ fontSize: 20 }} />, path: '/management/messages' },
  { textKey: 'ManagementCheck', icon: <VerifiedUserIcon sx={{ fontSize: 20 }} />, path: '/management/check' },
];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const [openSettings, setOpenSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isManagementMenuOpen, setIsManagementMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isManagementActive = location.pathname.startsWith('/management');

  const sidebarProps = {
    openSettings, setOpenSettings,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isManagementMenuOpen, setIsManagementMenuOpen,
    onMobileClose: () => setMobileOpen(false),
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
        <Sidebar {...sidebarProps} />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Sidebar {...sidebarProps} />
      </Drawer>

      {/* Management Sub-Sidebar */}
      {isManagementMenuOpen && !isMobile && (
        <Box sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'absolute',
          left: isSidebarCollapsed ? 64 : 240,
          zIndex: 1200,
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>{t('ManagementSubtitle')}</Typography>
          </Box>
          <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1, overflowY: 'auto' }}>
            {managementMenuItems.map((item) => {
              const isActive = item.path === '/management'
                ? (location.pathname === '/management' || location.pathname === '/management/courses')
                : location.pathname === item.path;
              return (
                <ListItem key={item.textKey} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={() => setIsManagementMenuOpen(false)}
                    sx={{
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#6A50E8' : 'transparent',
                      color: isActive ? '#fff' : '#6b7280',
                      '&:hover': { backgroundColor: isActive ? '#6A50E8' : '#f3f4f6', color: isActive ? '#fff' : '#111827' },
                      px: 1.5, py: 0.8,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: 'inherit' }}>
                        {t(item.textKey)}
                      </Typography>
                    } />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}

      {/* Main content */}
      <Box
        onClick={() => isManagementMenuOpen && setIsManagementMenuOpen(false)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'background.default' }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Header
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            isManagementActive={isManagementActive}
            onMenuToggle={() => setMobileOpen(true)}
          />
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}