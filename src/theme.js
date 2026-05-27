import { createContext } from 'react';

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#6A50E8',
      light: '#f0eeff',
      dark: '#5a42d4',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#f0fdf4',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#fef2f2',
    },
    warning: {
      main: '#f59e0b',
    },
    background: {
      default: mode === 'light' ? '#f5f6fa' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1f2937',
    },
    text: {
      primary: mode === 'light' ? '#111827' : '#f8fafc',
      secondary: mode === 'light' ? '#6b7280' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e5e7eb' : '#334155',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'light' ? '#f5f6fa' : '#0f172a',
          color: mode === 'light' ? '#111827' : '#f8fafc',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#9ca3af' : '#6b7280',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6A50E8',
            borderWidth: '1px',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: mode === 'light' ? '#f9fafb' : '#111827',
          color: mode === 'light' ? '#6b7280' : '#94a3b8',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
