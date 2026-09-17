import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Stack,
  useTheme,
  alpha,
  Avatar,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  People as UsersIcon,
  AccountTree as DirectoratesIcon,
  Description as FormsIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  NotificationsNone as NotificationsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../../../core/context/AdminAuthContext';
import { BRAND_NAVY, BRAND_NAVY_LIGHT, BRAND_ACCENT } from '../../../../core/constants/theme';
import LanguageSwitcher from '../../../shared/LanguageSwitcher';

// ─── Sidebar constants ────────────────────────────────────────────────────────

const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 80;

interface NavItem {
  /** i18n key used for the sidebar label, tooltip, and default page title. */
  labelKey: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'admin.nav.dashboard', path: '/admin', icon: <DashboardIcon /> },
  { labelKey: 'admin.nav.users', path: '/admin/users', icon: <UsersIcon /> },
  { labelKey: 'admin.nav.directorates', path: '/admin/directorates', icon: <DirectoratesIcon /> },
  { labelKey: 'admin.nav.forms', path: '/admin/forms', icon: <FormsIcon /> },
];

// ─── AdminLayout ──────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: React.ReactNode;
  /** Optional page title shown in the top header. */
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { adminLogout } = useAdminAuth();
  const muiTheme = useTheme();
  const palette = muiTheme.palette;

  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const sidebarWidth = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleLogout = (): void => {
    handleMenuClose();
    adminLogout();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (path: string): boolean => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f8fafc' }}>

      {/* ── Sidebar ── */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: `linear-gradient(180deg, ${BRAND_NAVY} 0%, ${BRAND_NAVY_LIGHT} 100%)`,
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
          },
        }}
      >
        {/* Brand header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: expanded ? 3 : 2.5,
            py: 3,
            minHeight: 80,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: alpha('#fff', 0.15),
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          >
            <AdminIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>

          {expanded && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="#fff"
                noWrap
                sx={{ letterSpacing: -0.5, lineHeight: 1.1 }}
              >
                {t('admin.brand.title')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha('#fff', 0.5), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, fontSize: 9 }}
              >
                {t('admin.brand.subtitle')}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mx: 2, borderColor: alpha('#fff', 0.08) }} />

        {/* Nav items */}
        <List sx={{ px: 2, py: 3, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const label = t(item.labelKey);
            return (
              <Tooltip
                key={item.path}
                title={expanded ? '' : label}
                placement="right"
                arrow
              >
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={active}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    minHeight: 48,
                    px: expanded ? 2 : 1.5,
                    justifyContent: expanded ? 'flex-start' : 'center',
                    color: active ? '#fff' : alpha('#fff', 0.6),
                    bgcolor: active ? alpha(BRAND_ACCENT, 0.2) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: active
                        ? alpha(BRAND_ACCENT, 0.25)
                        : alpha('#fff', 0.05),
                      color: '#fff',
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(BRAND_ACCENT, 0.2),
                      '&:hover': { bgcolor: alpha(BRAND_ACCENT, 0.25) },
                      '&::before': expanded ? {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        width: 4,
                        height: 24,
                        borderRadius: '0 4px 4px 0',
                        bgcolor: BRAND_ACCENT,
                      } : {},
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 0,
                      mr: expanded ? 2 : 0,
                      '& svg': { fontSize: 22 }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {expanded && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 700 : 600,
                        noWrap: true,
                        letterSpacing: 0.2,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        {/* Sidebar Footer - Version Only */}
        {expanded && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.3), fontWeight: 600, letterSpacing: 1 }}>
              {t('admin.version')}
            </Typography>
          </Box>
        )}
      </Drawer>

      {/* ── Main content area ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>

        {/* Top header bar */}
        <Box
          component="header"
          sx={{
            height: 80,
            display: 'flex',
            alignItems: 'center',
            px: 4,
            bgcolor: alpha('#fff', 0.8),
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderBottom: '1px solid',
            borderColor: alpha(palette.divider, 0.05),
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" gap={2} sx={{ flex: 1 }}>
            <IconButton
              onClick={() => setExpanded((prev) => !prev)}
              size="small"
              sx={{
                bgcolor: alpha(palette.divider, 0.05),
                '&:hover': { bgcolor: alpha(palette.divider, 0.1) }
              }}
            >
              {expanded ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>

            {/* Active nav indicator */}
            {NAV_ITEMS.filter((n) => isActive(n.path)).map((n) => (
              <Box key={n.path} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
                  {title ?? t(n.labelKey)}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" alignItems="center" gap={2}>
            {/* EN / AR toggle — persists via i18n localStorage and flips RTL layout. */}
            <LanguageSwitcher />
            <Tooltip title={t('admin.notifications')}>
              <IconButton size="small" sx={{ color: 'text.secondary' }} aria-label={t('admin.notifications')}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 1 }} />
            
            {/* User Profile Area */}
            <Stack 
              direction="row" 
              alignItems="center" 
              gap={1.5} 
              onClick={handleMenuOpen}
              sx={{ 
                cursor: 'pointer',
                p: 0.5,
                pr: 1.5,
                borderRadius: '24px',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: alpha(palette.divider, 0.05) }
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: BRAND_ACCENT,
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                AD
              </Avatar>
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  {t('admin.user.name')}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {t('admin.user.role')}
                </Typography>
              </Box>
            </Stack>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  borderRadius: '12px',
                  minWidth: 180,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>{t('admin.user.name')}</Typography>
                <Typography variant="caption" color="text.secondary">admin@aseza.com</Typography>
              </Box>
              <Divider />
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  color: palette.error.main,
                  fontWeight: 600,
                  py: 1,
                  '&:hover': { bgcolor: alpha(palette.error.main, 0.05) }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '32px !important' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {t('admin.logout')}
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* Page content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            p: 4,
            overflow: 'auto',
            animation: 'fadeIn 0.4s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
