import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  FiberManualRecord as DotIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  WarningAmber as WarningAmberIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useGraphUserProfile } from '../../core/hooks/useGraph';
import useTokenSession from '../../core/hooks/useTokenSession';
import { useAuth } from '../../core/context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the first letter of each word in a name (max 2 chars, uppercase). */
const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

// ─── Detail card ─────────────────────────────────────────────────────────────

interface DetailCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, iconBg, label, value }) => {
  const theme = useTheme();

  return (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 2.5,
      transition: 'box-shadow 0.2s, border-color 0.2s',
      '&:hover': {
        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.dark, 0.1)}`,
        borderColor: 'divider',
      },
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, p: '18px !important' }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing="0.6px"
          color="text.disabled"
          display="block"
          mb={0.4}
        >
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
  );
};

// ─── Profile page ─────────────────────────────────────────────────────────────

const Profile: React.FC = () => {
  // Session state for the warning banner and token expiry footer.
  const { expiresOn, sessionWarning, tokenError } = useTokenSession();

  // Logout via AuthContext instead of calling useMsal directly.
  const { logout } = useAuth();

  // Graph /me data — react-query handles caching, deduplication, and retries.
  const { data: userProfile, isLoading, error } = useGraphUserProfile();

  // Normalise the query error to a plain string for the error card.
  const profileError = error !== null ? (error.message.length > 0 ? error.message : 'Unknown error') : null;

  // ── Token-level error (MSAL could not acquire a token at all) ──
  if (tokenError !== null) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default">
        <Card sx={{ maxWidth: 380, width: '100%', borderRadius: 3, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography fontSize={42} mb={1}>⚠️</Typography>
            <Typography variant="h6" fontWeight={700} color="error" mb={1}>
              Session Error
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {tokenError}
            </Typography>
            <Button variant="contained" color="primary" onClick={logout} sx={{ borderRadius: 2 }}>
              Sign in again
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ── Graph API error ──
  if (profileError !== null) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default">
        <Card sx={{ maxWidth: 380, width: '100%', borderRadius: 3, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography fontSize={42} mb={1}>😕</Typography>
            <Typography variant="h6" fontWeight={700} color="error" mb={1}>
              Could not load profile
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {profileError}
            </Typography>
            <Button variant="contained" color="primary" onClick={logout} sx={{ borderRadius: 2 }}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default">
        <CircularProgress />
      </Box>
    );
  }

  const initials = userProfile !== undefined ? getInitials(userProfile.displayName) : '?';
  const email = userProfile !== undefined ? (userProfile.mail ?? userProfile.userPrincipalName) : '';

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Typography variant="h1">Profile</Typography>
    </Box>
  );
};

export default Profile;
