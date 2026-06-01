import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMsal } from '@azure/msal-react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { loginRequest } from '../../../core/config/authConfig';
import logoAr from '../../../assets/aseza-logo-ar.png';
import logoEn from '../../../assets/aseza-logo-en.png';
import {
  BRAND_NAVY,
  BRAND_NAVY_LIGHT,
  BRAND_ACCENT,
} from '../../../core/constants/theme';
import LanguageSwitcher from '../../shared/LanguageSwitcher';
import { useDeviceType } from '../../../core/hooks/useDeviceType';

// ─── Microsoft four-square logo ──────────────────────────────────────────────

const MicrosoftLogo: React.FC = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2.5px',
      width: 20,
      height: 20,
      flexShrink: 0,
    }}
  >
    <Box sx={{ bgcolor: '#f35325', borderRadius: '1px' }} />
    <Box sx={{ bgcolor: '#81bc06', borderRadius: '1px' }} />
    <Box sx={{ bgcolor: '#05a6f0', borderRadius: '1px' }} />
    <Box sx={{ bgcolor: '#ffba08', borderRadius: '1px' }} />
  </Box>
);

// ─── Brand logo mark ─────────────────────────────────────────────────────────

interface LogoProps {
  /** 'dark' = amber icon + white text (for navy backgrounds) */
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md';
}

const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';
  const logoSrc = currentLang === 'ar' ? logoAr : logoEn;

  
  // Scaling based on size
  const height = size === 'sm' ? 40 : 75;

  return (
    <Box
      component="img"
      src={logoSrc}
      alt="ASEZA Logo"
      sx={{
        height,
        display: 'block',
        // 'dark' variant = white logo (for navy background), 'light' = original (for light card)
        filter: variant === 'dark' ? 'brightness(0) invert(1)' : 'none',
        objectFit: 'contain',
        transition: 'all 0.3s ease',
      }}
    />
  );
};

// ─── Login page ───────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { instance } = useMsal();
  // Use MUI theme so colours respond to light / dark mode
  const muiTheme = useTheme();
  const palette = muiTheme.palette;

  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  const handleLogin = (): void => {
    instance.loginRedirect(loginRequest).catch((e: unknown) => {
      console.error('Login failed:', e);
    });
  };

  const trustBadges = [
    t('login.trustSecureSso'),
    t('login.trustIso'),
    t('login.trustAccess'),
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* ── Top-right controls: language switcher + theme toggle ── */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{
          position: 'fixed',
          top: 12,
          right: 16,
          zIndex: 10,
        }}
      >
        <LanguageSwitcher />
      </Stack>

      {/* ── Left brand panel (desktop only) ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 46%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          // Always navy regardless of theme — intentional brand expression
          background: `linear-gradient(155deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 60%, ${BRAND_NAVY} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        {/* Decorative grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative circle — top right */}
        <Box
          sx={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            top: -170,
            right: -150,
          }}
        />

        {/* Decorative circle — bottom left, tinted with brand accent */}
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            // Use BRAND_ACCENT at low opacity for the amber glow
            bgcolor: `${BRAND_ACCENT}1a`,
            bottom: -80,
            left: -60,
          }}
        />

        {/* Logo */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Logo variant="dark" size="md" />
        </Box>

        {/* Tagline */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} lineHeight={1.25} mb={1.5}>
            {t('login.tagline')}
          </Typography>
          <Typography sx={{ opacity: 0.72, fontSize: 15, lineHeight: 1.65, maxWidth: 320 }}>
            {t('login.taglineSubtitle')}
          </Typography>
        </Box>

        {/* Trust badges */}
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ position: 'relative', zIndex: 1 }}>
          {trustBadges.map((label) => (
            <Box
              key={label}
              sx={{
                px: 1.75,
                py: 0.6,
                border: '1px solid rgba(255,255,255,0.20)',
                borderRadius: '999px',
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(6px)',
                bgcolor: 'rgba(255,255,255,0.08)',
              }}
            >
              {label}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── Right login card ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
          // Derives from MUI palette so it adapts to light / dark mode
          bgcolor: isMobile ? 'background.paper' : 'background.default',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            height: isMobile ? '100%' : 'auto',
            maxWidth: 550,
            borderRadius: 4,
            p: { xs: 4, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: isMobile ? 15 : 4,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
            border: isMobile ? 'none' : '1px solid',
            borderColor: 'divider',
            // Subtle entry animation
            animation: 'fadeInUp 0.6s ease-out forwards',
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >

          {/* Mobile-only logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 1 }}>
            <Logo variant="light" size="md" />
          </Box>

          {/* Heading */}
          <Box textAlign="center">
            <Typography
              variant="h4"
              fontWeight={800}
              color="text.primary"
              sx={{
                mb: 1.5,
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              {t('login.welcomeBack')}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                maxWidth: '280px',
                mx: 'auto',
                opacity: 0.8,
              }}
            >
              {t('login.signInSubtitle')}
            </Typography>
          </Box>

          {/* SSO Section */}
          <Stack spacing={3}>
            <Divider>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ px: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                {t('login.useYourAccount')}
              </Typography>
            </Divider>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleLogin}
              startIcon={<MicrosoftLogo />}
              sx={{
                py: isMobile ? 4 : 1.8,
                borderRadius: 2.5,
                borderWidth: '1.5px',
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderWidth: '1.5px',
                  borderColor: palette.primary.main,
                  bgcolor: alpha(palette.primary.main, 0.02),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(palette.primary.main, 0.08)}`,
                },
              }}
            >
              {t('login.signInButton')}
            </Button>
          </Stack>

          {/* Footer Section */}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
              <Box
                sx={{
                  display: 'flex',
                  p: 0.5,
                  borderRadius: '50%',
                  bgcolor: alpha(palette.success.main, 0.1),
                }}
              >
                <SecurityIcon sx={{ fontSize: 14, color: 'success.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {t('login.securityFootnote')}
              </Typography>
            </Stack>

            <Divider variant="middle" sx={{ opacity: 0.5 }} />

            <Typography
              variant="caption"
              color="text.disabled"
              textAlign="center"
              sx={{ fontSize: '0.7rem', opacity: 0.7 }}
            >
              {t('login.copyright', { year: new Date().getFullYear() })}
            </Typography>
          </Stack>
          
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
