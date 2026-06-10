import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Add,
  // FavoriteBorder,
  Language,
  Menu as MenuIcon,
  Remove,
  Search,
  ShoppingCartOutlined,
} from '@mui/icons-material';
import TourIcon from '@mui/icons-material/EmojiObjects';
import {
  Badge,
  Box,
  Button,
  Collapse,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Stack,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDirection } from '../../../core/context/DirectionContext';
import { useDeviceType } from '../../../core/hooks/useDeviceType';
import type { AppLanguage } from '../../../i18n/languages';

import logoUrlEn from '../../../assets/logo-en.png';
import logoUrlAr from '../../../assets/logo-ar.png';
import { MobileNavDrawer } from './MobileNavDrawer';
import { createNavLinks, type NavbarNavItem } from './navLinks';
import { useAuth } from '../../../core/context/AuthContext';
import { UserProfile } from './UserProfile';
import { useNavItems } from './useNavItems';
import type { UserRole } from '../../../core/types/roles';
import ThemeToggle from '../ThemeToggle';
import { useTour } from '../../../core/context/TourContext';

export interface NavbarProps {
  logoSrc?: string;
  logoAlt?: string;
  phoneNumber?: string;
  onSearchSubmit?: (query: string) => void;
  cartCount?: number;
  sx?: SxProps<Theme>;
}

interface UseIsWindowScrolledPastArgs {
  thresholdPx: number;
  enabled: boolean;
}

/**
 * Track whether the window has been scrolled past a pixel threshold.
 * Used to shrink the sticky header only after it becomes "stuck".
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useIsWindowScrolledPast = ({ thresholdPx, enabled }: UseIsWindowScrolledPastArgs): boolean => {
  const [isPastThreshold, setIsPastThreshold] = useState<boolean>(false);

  useEffect(() => {
    let ticking = false;

    const computeNext = (): void => {
      const next = window.scrollY > thresholdPx;
      // Avoid pointless re-renders on every scroll tick.
      setIsPastThreshold((prev) => (prev === next ? prev : next));
    };

    const onScroll = (): void => {
      // Throttle using requestAnimationFrame for good scroll performance.
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        computeNext();
        ticking = false;
      });
    };

    // Initialize immediately in case the page loads already scrolled.
    computeNext();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, thresholdPx]);

  return isPastThreshold;
};

const Navbar: React.FC<NavbarProps> = ({
  logoAlt = 'Site logo',
  phoneNumber = '79 800',
  onSearchSubmit,
  cartCount = 0,
  sx,
}) => {
  const { t, i18n } = useTranslation();
  const dir = useDirection();
  const location = useLocation();
  // Pull isAuthenticated for conditional UI and userRoles for RBAC filtering.
  const { isAuthenticated, userRoles } = useAuth();
  const { startTour } = useTour();


  const navigate = useNavigate();

  // Centralized responsive detection (keeps breakpoints consistent across the app).
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  // Shrink the sticky desktop header only after the user starts scrolling.
  const isDesktopHeaderStuck = false;// useIsWindowScrolledPast({ thresholdPx: 8, enabled: !isMobile });

  const [query, setQuery] = useState<string>('');

  // Mobile drawer state (shown only on mobile; nav pills are hidden there).
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const [navMenuState, setNavMenuState] = useState<{
    id: string;
    anchorEl: HTMLElement;
  } | null>(null);

  /**
   * Determine whether a link is external (should not use `react-router` navigation).
   * We keep this very strict to avoid misclassifying in-app routes as external.
   */
  const isExternalUrl = useCallback((to: string): boolean => {
    const trimmed = to.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }, []);

  /**
   * Navigate to an internal route or open an external URL.
   * This is used by dropdown clicks and the mobile drawer.
   */
  const navigateTo = useCallback(
    (to: string): void => {
      // External URL: open in a new tab (and fall back safely if popups are blocked).
      if (isExternalUrl(to)) {
        if (typeof window !== 'undefined') {
          const opened = window.open(to, '_blank', 'noopener,noreferrer');
          if (opened === null) {
            window.location.assign(to);
          }
        }
        return;
      }

      // Internal URL: use SPA navigation.
      navigate(to);
    },
    [isExternalUrl, navigate]
  );

  const allNavLinks: ReadonlyArray<NavbarNavItem> = useMemo(
    () => createNavLinks(t),
    [t]
  );

  const navLinks = useNavItems(allNavLinks, userRoles as ReadonlyArray<UserRole>);

  const openMobileDrawer = (): void => {
    setMobileDrawerOpen(true);
  };

  const closeMobileDrawer = (): void => {
    setMobileDrawerOpen(false);
  };

  const isActive = (item: NavbarNavItem): boolean => {
    if (location.pathname === item.to) {
      return true;
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      return item.children.some((child) => {
        if (location.pathname === child.to) {
          return true;
        }
        if (Array.isArray(child.children) && child.children.length > 0) {
          return child.children.some((grandChild: NavbarNavItem) => location.pathname === grandChild.to);
        }
        return false;
      });
    }
    return false;
  };

  const handleSubmitSearch = (evt: React.FormEvent<HTMLFormElement>): void => {
    evt.preventDefault();

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return;
    }

    if (typeof onSearchSubmit === 'function') {
      onSearchSubmit(trimmed);
      return;
    }

    const encoded = encodeURIComponent(trimmed);
    navigate(`/search?q=${encoded}`);
  };

  const openNavMenu = (id: string, evt: React.MouseEvent<HTMLElement>): void => {
    setNavMenuState({ id, anchorEl: evt.currentTarget });
  };

  const closeNavMenu = (): void => {
    setNavMenuState(null);
  };

  const navMenuOpen = navMenuState !== null;

  const toggleLanguage = async (): Promise<void> => {
    // We only support "en" and "ar" in this app. If a detector produces
    // another value, safely coerce it to "en" as a fallback.
    const current: AppLanguage = i18n.language === 'ar' ? 'ar' : 'en';
    const next: AppLanguage = current === 'ar' ? 'en' : 'ar';

    try {
      await i18n.changeLanguage(next);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to change language to "${next}": ${message}`);
    }
  };

  const openMenuItem: NavbarNavItem | null = useMemo(() => {
    if (navMenuState === null) {
      return null;
    }
    const match = navLinks.find((i) => i.id === navMenuState.id);
    return typeof match === 'undefined' ? null : match;
  }, [navLinks, navMenuState]);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const closeNavMenuAndReset = (): void => {
    closeNavMenu();
    setExpandedSections({});
  };

  const popoverHorizontal: 'left' | 'right' = dir === 'rtl' ? 'right' : 'left';

  const rowSx: SxProps<Theme> = useMemo(
    () => ({
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    }),
    []
  );

  const theme = useTheme();

  if (!isAuthenticated) return null;

  if (isMobile) {
    return (
      <>
      <Box
        component="header"
        // Useful for debugging responsive behavior without changing UI logic.
        data-device-type={deviceType}
        className="full-bleed"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 'none',
          borderColor: 'divider',
          p: 4,
          ...sx,
        }}>
        <div className="container">
          {/* Mobile Layout: Combined single row matching the design */}
          <Stack direction="column" spacing={10} sx={{ width: '100%', mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1 }}>
              {/* Logo area */}
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
                aria-label={t('nav.home')}>
                <Box
                  component="img"
                  src={i18n.language === 'ar' ? logoUrlAr : logoUrlEn}
                  alt={logoAlt}
                  sx={{ width: 200, height: 50, objectFit: 'fill' }}
                />
              </Box>

              <IconButton
                aria-label={t('navbar.aria.openMenu')}
                onClick={openMobileDrawer}
                sx={{ color: theme.palette.primary.main, p: 0.5 }}>
                <MenuIcon fontSize="large" />
              </IconButton>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="left" spacing={2} sx={{ width: '100%' }}>
              <UserProfile />

              <ThemeToggle />

              <Tooltip title={t('nav.language')}>
                <IconButton
                  color="inherit"
                  onClick={toggleLanguage}
                  sx={{ p: 0.5 }}>
                  <Language fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Tour launcher (mobile) */}
              <Tooltip title="جولة تفاعلية">
                <IconButton
                  color="primary"
                  onClick={startTour}
                  sx={{ p: 0.5 }}>
                  <TourIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Blue divider line under header (like the reference). */}
          <Box
            sx={{
              height: 2,
              bgcolor: theme.palette.primary.main,
              borderRadius: 999,
              mb: 0.75,
            }}
          />
        </div>
      </Box>

      {/* Mobile drawer — must be mounted inside the mobile branch so it exists in the DOM when the burger is tapped. */}
      <MobileNavDrawer
        open={mobileDrawerOpen}
        logoSrc={i18n.language === 'ar' ? logoUrlAr : logoUrlEn}
        logoAlt={logoAlt}
        items={navLinks}
        activePathname={location.pathname}
        onClose={closeMobileDrawer}
        onNavigate={(to) => navigateTo(to)}
        phoneNumber={phoneNumber}
      />
    </>
  )
  }

  return (
    <>
      <Box>
        <Box
          component="header"
          // Useful for debugging responsive behavior without changing UI logic.
          data-device-type={deviceType}
          className="full-bleed"
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: 'none',
            borderColor: 'divider',
            p: 0,
            // Sticky behavior applied to the wrapper so it persists across the whole page scroll.
            position: 'relative',
            top: 0,
            zIndex: (t) => t.zIndex.appBar,
            // Smoothly animate height changes when the header becomes "stuck".
            transition: 'box-shadow 180ms ease',
            boxShadow: isDesktopHeaderStuck ? 1 : 0,
            ...sx,
          }}>
          <div className="container">
            {/* Row 1: phone (left), nav links (center), logo (right). */}
            <Stack
              direction="row"
              sx={{
                ...rowSx,
                // Reduce sticky header height once it is actually stuck.
                pt: isDesktopHeaderStuck ? 0.5 : 1.25,
                pb: isDesktopHeaderStuck ? 0.5 : 0.75,
                transition: 'padding 180ms ease',
              }}>
              {/* Logo area */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  component={RouterLink}
                  to="/"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    color: 'text. ',
                    marginInlineStart: 'auto',
                  }}
                  aria-label={t('nav.home')}>
                  <Box
                    component="img"
                    src={i18n.language === 'ar' ? logoUrlAr : logoUrlEn}
                    alt={logoAlt}
                    sx={{
                      width: isDesktopHeaderStuck ? 96 : '300px',
                      height: isDesktopHeaderStuck ? 56 : '62px',
                      objectFit: 'contain',
                      transition: 'width 180ms ease, height 180ms ease',
                    }}
                  />
                  <Box
                    sx={{
                      width: '0.5px',
                      height: '32px',
                      bgcolor: 'divider',
                      flexShrink: 0,
                      opacity: 0.6,
                    }}
                  />
                </Box>
              </Stack>

              {/* Primary nav links */}
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  flex: '1 1 auto',
                  justifyContent: 'flex-start',
                  minWidth: 240,
                  overflowX: 'auto', // Enable horizontal scrolling for many categories
                  scrollbarWidth: 'none', // Hide scrollbar for cleaner look
                  '&::-webkit-scrollbar': { display: 'none' },
                  // Ensure items don't shrink too much
                  '& .MuiButton-root': {
                    flexShrink: 0,
                  },
                }}>
                {navLinks.map((item, index) => {
                  const children = item.children;
                  const hasChildren = typeof children !== 'undefined' && children.length > 0;
                  const active = isActive(item);
                  const isRamadanCampaign = item.id === 'ramadanCampaign2026';

                  const pillSx: SxProps<Theme> = {
                    fontSize: '15px',
                    fontWeight: 'bold',
                    // Ramadan campaign link should always be red (requested).
                    color: isRamadanCampaign
                      ? theme.palette.error.main
                      : active
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    borderRadius: 1.5,
                    px: '24px',
                    minHeight: 0,
                    lineHeight: 1.2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: isRamadanCampaign
                        ? theme.palette.error.main
                        : active
                          ? theme.palette.primary.main
                          : 'text.primary',
                    },
                  };

                  return (
                    <React.Fragment key={item.id}>
                      {hasChildren ? (
                        <Button onClick={(evt) => openNavMenu(item.id, evt)} sx={pillSx}>
                          {item.label}
                        </Button>
                      ) : (
                        <Button
                          // External URLs should render as real anchors, internal URLs as RouterLinks.
                          component={isExternalUrl(item.to) ? 'a' : RouterLink}
                          href={isExternalUrl(item.to) ? item.to : undefined}
                          to={isExternalUrl(item.to) ? undefined : item.to}
                          target={isExternalUrl(item.to) ? '_blank' : undefined}
                          rel={isExternalUrl(item.to) ? 'noopener noreferrer' : undefined}
                          sx={{
                            ...pillSx,
                            textDecoration: 'none',
                          }}>
                          {item.label}
                        </Button>
                      )}

                      {/* Render a vertical separator between buttons, but not after the last one */}
                      {index < navLinks.length - 1 && (
                        <Box
                          sx={{
                            width: '0.5px',
                            height: '18px',
                            bgcolor: 'divider',
                            flexShrink: 0,
                            opacity: 0.6,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </Stack>

            </Stack>
          </div>
        </Box>

        {/* Desktop Row 2 (non-sticky) */}
        <Box
          className="full-bleed"
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: 'none',
            borderColor: 'divider',
            p: 0,
            ...sx,
          }}>
          <div className="container">
            {/* Row 2: search (left), icons + login (right). */}
            <Stack direction="row" justifyContent="space-between" sx={{ ...rowSx, pt: '25px', pb: '10px' }}>
              {/* Icons + login */}
              <Stack direction="row" spacing={2} alignItems="center" >

                <UserProfile />

                <ThemeToggle />

                <Tooltip title={t('nav.language')}>
                  <IconButton color="primary" onClick={toggleLanguage}>
                    <Language sx={{ color: theme.palette.primary.main, fontSize: '25px' }} />
                  </IconButton>
                </Tooltip>

                {/* Tour launcher — opens the interactive walkthrough */}
                <Tooltip title="جولة تفاعلية">
                  <IconButton
                    data-tour="tour-btn"
                    color="primary"
                    onClick={startTour}
                    sx={{ color: theme.palette.primary.main }}>
                    <TourIcon sx={{ fontSize: '26px' }} />
                  </IconButton>
                </Tooltip>

              </Stack>

              {/* Search input - Styled to match the design reference */}
              <Paper
                component="form"
                onSubmit={handleSubmitSearch}
                elevation={0}
                sx={{
                  flex: '1 1 560px',
                  maxWidth: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  px: '8px',
                  borderRadius: '3.6px',
                  bgcolor: 'background.default',
                  height: '40px',
                  transition: 'all 0.2s ease-in-out',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper',
                    boxShadow: (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.1)}`,
                  },
                }}>
                <InputBase
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  inputProps={{ 'aria-label': t('nav.search') }}
                  sx={{
                    flex: 1,
                    fontSize: '15px',
                    fontWeight: 500,
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                  }}
                />
                <Box
                  sx={{
                    width: '0.5px',
                    height: '28px',
                    bgcolor: theme.palette.primary.main,
                    flexShrink: 0,
                    opacity: 0.6,
                    mx: '11px'
                  }}
                />
                <Search sx={{ color: theme.palette.primary.main, fontSize: '18px' }} />

              </Paper>
            </Stack>

            {/* Blue divider line under header (like the reference). */}
            <Box
              sx={{
                height: '1px',
                bgcolor: theme.palette.primary.main,
                borderRadius: 999,
                mb: '15px',
              }}
            />
          </div>
        </Box>
      </Box>

      {/* Mobile drawer navigation (only opened on mobile). */}
      <MobileNavDrawer
        open={mobileDrawerOpen}
        logoSrc={i18n.language === 'ar' ? logoUrlAr : logoUrlEn}
        logoAlt={logoAlt}
        items={navLinks}
        activePathname={location.pathname}
        onClose={closeMobileDrawer}
        onNavigate={(to) => navigateTo(to)}
        phoneNumber={phoneNumber}
      />

      {/* Dynamic nav dropdown (renders for any item that has `children`) */}
      <Popover
        open={navMenuOpen}
        anchorEl={navMenuState === null ? null : navMenuState.anchorEl}
        onClose={closeNavMenuAndReset}
        anchorOrigin={{ vertical: 'bottom', horizontal: popoverHorizontal }}
        transformOrigin={{ vertical: 'top', horizontal: popoverHorizontal }}
        PaperProps={{
          sx: {
            p: '10px',
            pb: '4px',
            mr: '-20px',
            borderRadius: '5.6px',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: '220px',
            maxWidth: '220px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
            backgroundColor: 'background.paper'
          },
        }}>
        <Box sx={{ bgcolor: 'background.paper' }}>
          {/* Nested, expandable tree to support deeper subcategories */}
          <Box
            sx={{
              p: 0,
              maxHeight: '70vh', // Limit height to 70% of viewport height
              overflowY: 'auto', // Enable vertical scrolling
              // Custom scrollbar styling for better integration
              '&::-webkit-scrollbar': {
                width: '5px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0, 0, 0, 0.2)',
              },
            }}>
            {(() => {
              // Avoid Array.isArray here because it narrows to `any[]` and breaks strict typing.
              const rootChildren = openMenuItem?.children;
              const hasRootChildren = typeof rootChildren !== 'undefined' && rootChildren.length > 0;

              if (!hasRootChildren) {
                return (
                  <MenuList dense sx={{ py: 0 }}>
                    <MenuItem disabled>{t('nav.noItems')}</MenuItem>
                  </MenuList>
                );
              }

              return (
                <List dense disablePadding sx={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {rootChildren.map((child) => {
                    const childChildren = child.children;
                    const hasChildren = typeof childChildren !== 'undefined' && childChildren.length > 0;
                    const isOpen = Boolean(expandedSections[child.id]);

                    // Shared style: boxed rows like the screenshot.
                    const rowSx: SxProps<Theme> = {
                      mb: '6px',
                      border: '0.1px solid',
                      borderColor: 'divider',
                      borderRadius: 0,
                      bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.03),
                      px: '3px',
                      py: '0px',
                      '&:hover': { bgcolor: 'action.hover' },
                    };

                    if (!hasChildren) {
                      const isChildActive = location.pathname === child.to;
                      return (
                        <ListItemButton
                          key={child.id}
                          onClick={() => {
                            closeNavMenuAndReset();
                            navigateTo(child.to);
                          }}
                          sx={{
                            ...rowSx,
                            ...(isChildActive ? { bgcolor: 'action.selected' } : {}),
                          }}>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: '16px',
                                fontWeight: isChildActive ? 'bold' : 'normal',
                                color: isChildActive ? theme.palette.primary.main : 'text.primary',
                              },
                            }}
                          />
                        </ListItemButton>
                      );
                    }

                    // Section row with + / − toggle.
                    const isSectionActive =
                      isActive(child) && Array.isArray(child.children) && child.children.length > 0;

                    return (
                      <Box key={child.id} sx={{ mb: 0.75 }}>
                        <ListItemButton
                          onClick={() => toggleSection(child.id)}
                          sx={{
                            ...rowSx,
                            mb: isOpen ? '0px' : '4px',
                            borderBottom: isOpen ? 'none' : '0.1px solid',
                            backgroundColor: (t: Theme) => isOpen ? alpha(t.palette.primary.main, 0.06) : 'transparent',

                          }}>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: '16px',
                                fontWeight: isSectionActive || isOpen ? 'bold' : 'normal',
                                color: isSectionActive || isOpen ? 'primary.main' : 'text.secondary',
                              },
                            }}
                          />
                          <ListItemIcon
                            sx={{
                              minWidth: '15px',
                              color: isSectionActive || isOpen ? 'primary.main' : 'text.secondary',
                              justifyContent: 'center',
                            }}>
                            {isOpen ? <Remove sx={{ fontSize: '16px' }} /> : <Add sx={{ fontSize: '16px' }} />}
                          </ListItemIcon>
                        </ListItemButton>

                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box
                            sx={{
                              mt: 0,
                              px: '6px',
                              // Visual separator like the screenshot inner box.
                              border: '1px solid',
                              borderColor: 'divider',
                              borderTop: 'none',
                              borderRadius: 0,
                              bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.06),

                              py: '4px',
                            }}>
                            <List dense disablePadding>
                              {childChildren.map((grandChild) => {
                                const isChildActive = isActive(grandChild);

                                return (
                                  <ListItemButton
                                    key={grandChild.id}
                                    onClick={() => {
                                      closeNavMenuAndReset();
                                      navigateTo(grandChild.to);
                                    }}
                                    sx={{
                                      mb: '5px',
                                      border: '0.1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 0,
                                      bgcolor: 'transparent',
                                      px: '6px',
                                      py: '0px',
                                      '&:last-of-type': { mb: 0 },
                                      '&:hover': { bgcolor: 'action.hover' },
                                      ...(isChildActive ? { bgcolor: 'action.selected' } : {}),
                                    }}>
                                    <ListItemText
                                      primary={grandChild.label}
                                      primaryTypographyProps={{
                                        sx: {
                                          fontSize: '16px',
                                          fontWeight: isChildActive ? 'bold' : 'normal',
                                          color: isChildActive ? 'primary.main' : 'primary.main',
                                        },
                                      }}
                                    />
                                  </ListItemButton>
                                );
                              })}
                            </List>
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </List>
              );
            })()}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default Navbar;
