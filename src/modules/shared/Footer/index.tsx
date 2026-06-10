import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

import Logo from '../../../assets/Logo.svg';
import { USEFUL_LINKS, CONTACT_ITEMS, SOCIAL_LINKS, BOTTOM_LINKS } from './footerLinks';
import { useAuth } from '../../../core/context/AuthContext';

/**
 * Strongly-typed props for the shared Footer component.
 */
export interface FooterProps {
  sx?: SxProps<Theme>;
}

const Footer: React.FC<FooterProps> = ({ sx }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        width: `calc(100vw - ${scrollbarWidth}px)`,
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        pt: 8,
        pb: 4,
        p: 4,
        ...sx,
      }}>
      <Box className="container" sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Section 1: Logo and Description */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'center', md: 'start' } }}>
            <Box sx={{ mb: 2 }}>
              <img src={Logo} alt={t('footer.alt.logo')} style={{ maxWidth: '150px',
                filter: 'brightness(0) invert(1)',
               }} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
              {t('footer.description')}
            </Typography>
          </Grid>

          {/* Section 2: Useful Links */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: '600' }}>
              {t('footer.usefulLinks')}
            </Typography>
            <Grid container spacing={1}>
              {USEFUL_LINKS.map((link) => {
                const linkKeyMap: Record<string, string> = {
                  '/about': 'footer.links.about',
                  '/projects': 'footer.links.projects',
                  '/news': 'footer.links.news',
                  '/seasonal-campaigns': 'footer.links.seasonalCampaigns',
                  '/help': 'footer.links.help',
                  '/careers': 'footer.links.careers',
                  '/contact': 'footer.links.contact',
                  '/bank-accounts': 'footer.links.bankAccounts',
                };
                return (
                  <Grid size={{ xs: 6 }} key={link.path}>
                    <Link
                      href={link.path}
                      sx={{
                        color: 'white',
                        textDecoration: 'none',
                        opacity: 0.9,
                        '&:hover': { opacity: 1, textDecoration: 'underline' },
                        fontSize: '0.9rem',
                        display: 'block',
                        mb: 1,
                      }}>
                      {t(linkKeyMap[link.path] || link.path)}
                    </Link>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Section 3: Contact Us */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: '600' }}>
              {t('footer.contactUs')}
            </Typography>
            <Stack spacing={2}>
              {CONTACT_ITEMS.map((item, index) => {
                const contactKey =
                  index === 0
                    ? 'address'
                    : index === 1
                    ? 'email'
                    : index === 2
                    ? 'tollFree'
                    : index === 3
                    ? 'phone'
                    : 'whatsapp';
                return (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    component={item.link ? 'a' : 'div'}
                    href={item.link}
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      opacity: 0.9,
                      '&:hover': item.link ? { opacity: 1 } : {},
                    }}>
                    <item.icon sx={{ fontSize: '1.2rem', mt: 0.5 }} />
                    <Typography variant="body2" dir={contactKey === 'address' ? undefined : 'ltr'} sx={{ fontSize: '0.9rem' }}>
                      {contactKey === 'address' ? t('footer.contact.address') : item.text}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Grid>

          {/* Section 4: Apps and Payments */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'center', md: 'start' } }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: '500', fontSize: '1.1rem' }}>
              {t('footer.downloadApp')}
            </Typography>
            <Stack
              direction={{ xs: 'row', md: 'column', lg: 'row' }}
              spacing={1}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 4 }}>
              <Link href="https://play.google.com/store/apps/details?id=app.itkey.com.daralber&hl=en" target="_blank" rel="noopener">
                <Box
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt={t('footer.alt.googlePlay')}
                  sx={{ height: 40, borderRadius: '4px' }}
                />
              </Link>
              <Link href="https://apps.apple.com/us/app/%D8%AC%D9%85%D8%B9%D9%8A%D8%A9-%D8%AF%D8%A7%D8%B1-%D8%A7%D9%84%D8%A8%D8%B1/id1237668148?ls=1" target="_blank" rel="noopener">
                <Box
                  component="img"
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt={t('footer.alt.appStore')}
                  sx={{ height: 40, borderRadius: '4px' }}
                />
              </Link>
            </Stack>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: '500', fontSize: '1.1rem' }}>
              {t('footer.paymentMethods')}
            </Typography>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: '10px 20px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}>
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg"
                alt={t('footer.alt.unionPay')}
                sx={{ height: 24 }}
              />
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt={t('footer.alt.visa')}
                sx={{ height: 16 }}
              />
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt={t('footer.alt.mastercard')}
                sx={{ height: 24 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        {/* Bottom Bar */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" spacing={1}>
            {SOCIAL_LINKS.map((social) => (
              <IconButton
                key={social.label}
                component="a"
                href={social.link}
                sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                aria-label={social.label}>
                <social.icon />
              </IconButton>
            ))}
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
            {BOTTOM_LINKS.map((link) => {
              const bottomLinkKeyMap: Record<string, string> = {
                '/privacy-policy': 'footer.bottomLinks.privacyPolicy',
                '/terms-and-conditions': 'footer.bottomLinks.termsAndConditions',
              };
              return (
                <Link
                  key={link.label}
                  href={link.path}
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}>
                  {t(bottomLinkKeyMap[link.label] || link.label)}
                </Link>
              );
            })}
            <Typography variant="body2">{t('footer.copyright')}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
