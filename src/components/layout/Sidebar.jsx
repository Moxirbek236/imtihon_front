import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import '../../i18n';

const menuItems = [
  { textKey: 'Home', icon: <DashboardIcon sx={{ fontSize: 20 }} />, path: '/dashboard' },
  { textKey: 'TeachersNav', icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: '/teachers' },
  { textKey: 'GroupsNav', icon: <GroupsIcon sx={{ fontSize: 20 }} />, path: '/groups' },
  { textKey: 'StudentsNav', icon: <SchoolIcon sx={{ fontSize: 20 }} />, path: '/students' },
  { textKey: 'ManagementNav', icon: <SettingsIcon sx={{ fontSize: 20 }} />, path: '/management' },
];

export default function Sidebar({ openSettings, setOpenSettings, isSidebarCollapsed, setIsSidebarCollapsed, isManagementMenuOpen, setIsManagementMenuOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const collapsed = isMobile ? false : isSidebarCollapsed;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const closeMobileIfNeeded = () => {
    if (onMobileClose) onMobileClose();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexShrink: 0, position: 'relative', zIndex: 1300 }}>
      <Box sx={{ position: 'relative', height: '100%' }}>
        {/* Collapse toggle */}
        <IconButton
          size="small"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          sx={{
            display: { xs: 'none', md: 'flex' },
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: '6px',
            width: 22,
            height: 22,
            '&:hover': { backgroundColor: 'primary.dark' },
            position: 'absolute',
            right: -11,
            top: 30,
            zIndex: 1500,
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 10, transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </IconButton>

        <Box
          sx={{
            width: { xs: 240, md: collapsed ? 64 : 240 },
            flexShrink: 0,
            height: '100%',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
          }}
        >
          {/* Logo */}
          <Box sx={{ p: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box component="img" src="/dl3Zf.jpg" sx={{ height: 28, borderRadius: '4px' }} onError={(e) => { e.target.src = 'https://edu-coin.uz/assets/logo-BveCYX-f.png'; }} />
            {!collapsed && (
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>NajotEdu</Typography>
            )}
          </Box>

          {/* Menu */}
          <List sx={{ px: collapsed ? 0.5 : 1.5, pt: 1.5, flex: 1, overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/management' && location.pathname.startsWith('/management'));

              const handleClick = (e) => {
                if (item.textKey === 'ManagementNav') {
                  e.preventDefault();
                  setIsManagementMenuOpen(!isManagementMenuOpen);
                }
                closeMobileIfNeeded();
              };

              return (
                <ListItem key={item.textKey} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={handleClick}
                    sx={{
                      borderRadius: '8px',
                      px: collapsed ? 0 : 1.5,
                      minHeight: 44,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      backgroundColor: isActive ? '#6A50E8' : 'transparent',
                      color: isActive ? '#fff' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: isActive ? '#6A50E8' : theme.palette.mode === 'light' ? '#f3f4f6' : '#111827',
                        color: isActive ? '#fff' : '#f8fafc',
                      },
                      '& .MuiListItemIcon-root': { color: isActive ? '#fff' : 'text.secondary' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}>
                        {t(item.textKey)}
                      </Typography>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* Logout */}
          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '8px',
                px: collapsed ? 0 : 1.5,
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: 'text.secondary',
                '&:hover': { backgroundColor: theme.palette.mode === 'light' ? '#fef2f2' : '#3b4255', color: '#dc2626', '& .MuiListItemIcon-root': { color: '#dc2626' } },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, justifyContent: 'center', color: '#6b7280' }}>
                <LogoutIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {!collapsed && (
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('Logout')}</Typography>
              )}
            </ListItemButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}