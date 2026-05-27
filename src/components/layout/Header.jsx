import { useContext } from 'react';
import { Box, InputBase, IconButton, Avatar, Typography, Select, MenuItem, Badge, Button, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from '../../theme';
import { useTranslation } from 'react-i18next';
import '../../i18n';

export default function Header({ isSidebarCollapsed, setIsSidebarCollapsed, isManagementActive, onMenuToggle }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { t, i18n } = useTranslation();

  return (
    <Box
      sx={{
        height: { xs: 56, sm: 64 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        backgroundColor: 'background.paper',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Left */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          onClick={onMenuToggle}
          sx={{ display: { xs: 'flex', md: 'none' }, color: '#6b7280', p: 0.75 }}
        >
          <MenuIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          disableElevation
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: { xs: 1.5, sm: 2.5 },
            py: 0.8,
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: '#5a42d4' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('Add')}</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{t('New')}</Box>
        </Button>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'light' ? '#f9fafb' : '#111827',
            borderRadius: '8px',
            px: 1.5,
            py: 0.8,
            width: 220,
            border: '1px solid',
            borderColor: 'divider',
            '&:focus-within': {
              borderColor: '#6A50E8',
              backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1f2937',
            },
          }}
        >
          <SearchIcon sx={{ color: '#9ca3af', fontSize: 18, mr: 1 }} />
          <InputBase
            placeholder={t('Search')}
            sx={{ flex: 1, fontSize: '0.875rem', '& input::placeholder': { color: 'text.secondary', opacity: 1 } }}
          />
        </Box>
      </Box>

      {/* Right */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
        <Select
          value={i18n.language || 'uz'}
          onChange={(e) => { i18n.changeLanguage(e.target.value); window.localStorage.setItem('i18nextLng', e.target.value); }}
          size="small"
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            boxShadow: 'none',
            '.MuiOutlinedInput-notchedOutline': { border: 0 },
            backgroundColor: theme.palette.mode === 'light' ? '#f9fafb' : '#111827',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: theme.palette.text.primary,
            '&:hover': { backgroundColor: theme.palette.mode === 'light' ? '#f3f4f6' : '#334155' },
          }}
        >
          <MenuItem value="uz">{t('Uzbek')}</MenuItem>
          <MenuItem value="ru">{t('Russian')}</MenuItem>
          <MenuItem value="en">{t('English')}</MenuItem>
        </Select>

        <IconButton
          onClick={colorMode.toggleColorMode}
          sx={{
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px',
            p: 0.75,
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'light' ? '#f3f4f6' : '#334155',
            },
          }}
        >
          {theme.palette.mode === 'dark' ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
        </IconButton>

        <IconButton sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: 0.75 }}>
          <Badge badgeContent={1} color="error">
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>

        <Avatar sx={{ width: 32, height: 32, bgcolor: '#6A50E8', fontSize: '0.8rem', fontWeight: 600 }} src="/avatar.jpg">
          A
        </Avatar>
      </Box>
    </Box>
  );
}
