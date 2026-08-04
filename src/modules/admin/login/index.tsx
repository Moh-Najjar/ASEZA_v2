import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar,
  Fade,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  VerifiedUser as VerifiedIcon,
  Security as SecurityIcon,
  Tune as SettingsIcon,
  IntegrationInstructions as IntegrationIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../../../core/context/AdminAuthContext';
import {
  BRAND_NAVY,
  BRAND_NAVY_LIGHT,
  BRAND_ACCENT,
} from '../../../core/constants/theme';

// ─── Admin Login page ─────────────────────────────────────────────────────────

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdminLoginPending, adminLoginError } = useAdminAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('admin@aseza.com');
  const [password, setPassword] = useState('123456789');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (email.trim().length === 0) {
      errors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email';
    }

    if (password.length === 0) {
      errors.password = 'Required';
    } else if (password.length < 6) {
      errors.password = 'Min 6 chars';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await adminLogin(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch {
      // Error handled by context
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff', overflow: 'hidden', position: 'relative' }}>
      {/* Global Back Button */}
      <Button
        component={RouterLink}
        to="/login"
        startIcon={<ArrowBackIcon />}
        sx={{
          position: 'absolute',
          top: { xs: 16, md: 32 },
          left: { xs: 16, md: 32 },
          zIndex: 100,
          color: { xs: 'text.secondary', md: alpha('#fff', 0.6) },
          fontWeight: 800,
          textTransform: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: { xs: 'text.primary', md: '#fff' },
            bgcolor: { xs: alpha(theme.palette.divider, 0.1), md: alpha('#fff', 0.1) },
            transform: 'translateX(-4px)'
          },
          borderRadius: '12px',
          px: 2
        }}
      >
        Back to User Login
      </Button>

      {/* ── Left Side (Branding/Info) ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 50%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%)`,
          position: 'relative',
          px: 8,
          color: '#fff',
        }}
      >
        {/* Animated Background Elements */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          '& > div': { position: 'absolute', borderRadius: '50%', bgcolor: alpha('#fff', 0.03) }
        }}>
          <Box sx={{ width: 600, height: 600, top: -200, left: -200 }} />
          <Box sx={{ width: 400, height: 400, bottom: -100, right: -100 }} />
        </Box>

        <Fade in timeout={1000}>
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: alpha('#fff', 0.15),
                backdropFilter: 'blur(10px)',
                mx: 'auto',
                mb: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '1px solid',
                borderColor: alpha('#fff', 0.1)
              }}
            >
              <AdminIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1.5, mb: 2 }}>
              ASEZA Admin
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 500, mb: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Central Management Engine
            </Typography>

            <Stack spacing={2} sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
              {[
                { icon: <VerifiedIcon />, text: 'Encrypted Access Control', color: BRAND_ACCENT },
                { icon: <SecurityIcon />, text: 'Multi-Role Permissions', color: '#64b5f6' },
                { icon: <SettingsIcon />, text: 'Dynamic Form Architecture', color: '#81c784' },
                { icon: <IntegrationIcon />, text: 'Core System Integration', color: '#ffb74d' },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: alpha('#fff', 0.05),
                    border: '1px solid',
                    borderColor: alpha('#fff', 0.05),
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.02)', bgcolor: alpha('#fff', 0.08) }
                  }}
                >
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Fade>
      </Box>

      {/* ── Right Side (Login Form) ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 4, sm: 8 },
          bgcolor: '#f8fafc',
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {/* Mobile Logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
              <Avatar sx={{ bgcolor: BRAND_NAVY, width: 56, height: 56 }}>
                <AdminIcon />
              </Avatar>
            </Box>

            <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: -1, mb: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mb: 5, opacity: 0.7 }}>
              Authorized Administrative Access
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                {adminLoginError && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.error.main, 0.2),
                    }}
                  >
                    <Typography variant="caption" color="error.main" fontWeight={800}>
                      {adminLoginError.toUpperCase()}
                    </Typography>
                  </Paper>
                )}

                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>
                    EMAIL ADDRESS
                  </Typography>
                  <TextField
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={Boolean(fieldErrors.email)}
                    helperText={fieldErrors.email}
                    placeholder="admin@asiza.com"
                    InputProps={{
                      sx: {
                        borderRadius: '16px',
                        bgcolor: '#fff',
                        fontWeight: 700,
                        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.1) },
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>
                    SECURE PASSWORD
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={Boolean(fieldErrors.password)}
                    helperText={fieldErrors.password}
                    placeholder="••••••••"
                    InputProps={{
                      sx: {
                        borderRadius: '16px',
                        bgcolor: '#fff',
                        fontWeight: 700,
                        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.1) },
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disableElevation
                  disabled={isAdminLoginPending}
                  sx={{
                    py: 2,
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: 16,
                    textTransform: 'none',
                    bgcolor: BRAND_NAVY,
                    transition: 'all 0.3s ease',
                    mt: 2,
                    '&:hover': { bgcolor: BRAND_NAVY_LIGHT, transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
                  }}
                >
                  {isAdminLoginPending ? <CircularProgress size={24} color="inherit" /> : 'Enter Portal'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>

        <Box sx={{ mt: 'auto', pt: 8, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" fontWeight={700}>
            © {new Date().getFullYear()} ASEZA. ALL RIGHTS RESERVED.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLogin;
