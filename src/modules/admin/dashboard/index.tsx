import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  alpha,
  useTheme,
  Stack,
  Avatar,
} from '@mui/material';
import {
  People as UsersIcon,
  AccountTree as DirectoratesIcon,
  Description as FormsIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import AdminLayout from '../shared/AdminLayout';
import { BRAND_ACCENT, BRAND_NAVY } from '../../../core/constants/theme';

// ─── Navigation cards ─────────────────────────────────────────────────────────

interface DashboardCard {
  label: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  count?: string;
}

const CARDS: DashboardCard[] = [
  {
    label: 'Users',
    description: 'Manage user accounts, assign roles, and configure directorate access.',
    path: '/admin/users',
    icon: <UsersIcon sx={{ fontSize: 32 }} />,
    color: BRAND_NAVY,
    count: 'Active Users',
  },
  {
    label: 'Directorates',
    description: 'Configure directorate structures and assign form access permissions.',
    path: '/admin/directorates',
    icon: <DirectoratesIcon sx={{ fontSize: 32 }} />,
    color: '#7b1fa2',
    count: 'Internal Units',
  },
  {
    label: 'Forms',
    description: 'Create and manage forms, fields, options, dependencies, and calculations.',
    path: '/admin/forms',
    icon: <FormsIcon sx={{ fontSize: 32 }} />,
    color: BRAND_ACCENT,
    count: 'Dynamic Forms',
  },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <AdminLayout title="Dashboard">
      <Box sx={{ maxWidth: 1000 }}>
        {/* Welcome header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            fontWeight={900}
            color="text.primary"
            sx={{ mb: 1.5, letterSpacing: -1 }}
          >
            Welcome Back, Admin
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: 18, fontWeight: 500, opacity: 0.8 }}>
            What would you like to manage today?
          </Typography>
        </Box>

        {/* Navigation cards */}
        <Grid container spacing={4}>
          {CARDS.map((card, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.path}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.08),
                  height: '100%',
                  bgcolor: '#fff',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
                  '@keyframes slideUp': {
                    '0%': { opacity: 0, transform: 'translateY(30px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  },
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 40px ${alpha(card.color, 0.12)}`,
                    borderColor: alpha(card.color, 0.3),
                    '& .card-icon-bg': {
                      transform: 'scale(1.1) rotate(-5deg)',
                      bgcolor: alpha(card.color, 0.15),
                    },
                    '& .arrow-icon': {
                      transform: 'translateX(4px)',
                      color: card.color,
                    }
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(card.path)}
                  sx={{ height: '100%', p: 1 }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                      <Avatar
                        className="card-icon-bg"
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '18px',
                          bgcolor: alpha(card.color, 0.1),
                          color: card.color,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {card.icon}
                      </Avatar>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '20px',
                          bgcolor: alpha(card.color, 0.05),
                          color: card.color,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {card.count}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="text.primary"
                      gutterBottom
                      sx={{ mb: 2, letterSpacing: -0.5 }}
                    >
                      {card.label}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.7,
                        fontSize: 15,
                        fontWeight: 500,
                        mb: 4,
                        minHeight: 50
                      }}
                    >
                      {card.description}
                    </Typography>

                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography
                        variant="button"
                        sx={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: 'text.primary',
                        }}
                      >
                        Explore Now
                      </Typography>
                      <ArrowIcon className="arrow-icon" sx={{ fontSize: 18, transition: 'all 0.3s ease' }} />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats / Info Footer */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            borderRadius: '24px',
            bgcolor: alpha(BRAND_NAVY, 0.03),
            border: '1px dashed',
            borderColor: alpha(BRAND_NAVY, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Need help? Check the <Typography component="span" sx={{ color: BRAND_ACCENT, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>documentation</Typography> or contact the development team.
          </Typography>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
