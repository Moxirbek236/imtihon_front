import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Button, Typography, IconButton, InputAdornment, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '../i18n';

export default function Login() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('+998907012161');
  const [password, setPassword] = useState('Rahmonbergan04@');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login || !password) { setError(t('LoginErrorMsg')); return; }
    setLoading(true); setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/user/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: login, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        let msg = data.message || t('LoginError');
        if (msg.includes('Unauthorized') || msg.toLowerCase().includes('invalid')) msg = t('LoginInvalid');
        else if (msg.includes('User not found')) msg = t('LoginUserNotFound');
        throw new Error(msg);
      }
      setSuccess(true);
      localStorage.setItem('token', data.token);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontSize: '0.875rem',
      '& fieldset': { borderColor: 'var(--border)' },
      '&:hover fieldset': { borderColor: 'var(--gray-400)' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary)', borderWidth: '1px' },
    },
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: 'var(--bg)' }}>
      {/* Left panel */}
      <Box sx={{
        flex: '0 0 46%',
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ textAlign: 'center', color: 'white', px: 4 }}>
          <Box component="img" src="/study.svg" sx={{ width: '100%', maxWidth: 360, opacity: 0.95 }} />
          <Typography sx={{ mt: 3, fontSize: '1.1rem', fontWeight: 600, opacity: 0.9 }}>
            {t('NajotEduSystem')}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: '0.85rem', opacity: 0.7 }}>
            {t('NajotEduDesc')}
          </Typography>
        </Box>
      </Box>

      {/* Right panel */}
      <Box sx={{
        flex: { xs: '1 1 100%', md: '0 0 54%' },
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--surface)',
        px: { xs: 3, sm: 6, md: 8 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 340 }}>
          <Box component="img" src="/najot-logo.svg" sx={{ height: 48, mb: 2, objectFit: 'contain' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', mb: 0.5 }}>
            {t('LoginTitle')}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'var(--text-secondary)', mb: 3 }}>
            {t('LoginSubtitle')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>
              {t('Phone')}
            </Typography>
            <TextField fullWidth size="small" placeholder="+998901234567"
              value={login} onChange={e => setLogin(e.target.value)} sx={fieldSx} />

            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', mb: 0.5 }}>
              {t('Password')}
            </Typography>
            <TextField fullWidth size="small" type={showPassword ? 'text' : 'password'} placeholder={t('PasswordPlaceholder')}
              value={password} onChange={e => setPassword(e.target.value)}
              sx={{ ...fieldSx, mb: 2.5 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small" tabIndex={-1} sx={{ color: 'var(--gray-400)' }}>
                        {showPassword ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button type="submit" fullWidth variant="contained" disableElevation disabled={loading}
              sx={{
                py: 1.1, backgroundColor: 'var(--primary)', borderRadius: '8px',
                textTransform: 'none', fontWeight: 600, fontSize: '0.9rem',
                '&:hover': { backgroundColor: 'var(--primary-hover)' },
                '&.Mui-disabled': { backgroundColor: 'var(--border)', color: 'var(--gray-400)' },
              }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : t('LoginButton')}
            </Button>
          </Box>
        </Box>

        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ borderRadius: '8px', fontWeight: 500 }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={() => setSuccess(false)} severity="success" variant="filled" sx={{ borderRadius: '8px', fontWeight: 500 }}>
            {t('LoginSuccess')}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}