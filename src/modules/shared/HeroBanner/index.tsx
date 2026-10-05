import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import type { SvgIconComponent } from '@mui/icons-material';
import { useDeviceType } from '../../../core/hooks/useDeviceType';
import { BRAND_NAVY_DARK } from '../../../core/constants/theme';
import aqabaImage from '../../../assets/images/home/aqaba-1.jpg';

/** Height values per breakpoint (in px). All keys are optional. */
type BannerHeight = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

/**
 * Layered shadow that keeps white copy readable on the bright photo
 * without darkening the whole banner.
 */
const BANNER_TEXT_SHADOW = [
  '0 1px 1px rgba(0, 0, 0, 0.9)',
  '0 2px 8px rgba(0, 0, 0, 0.65)',
  '0 8px 24px rgba(0, 0, 0, 0.4)',
].join(', ');

interface HeroBannerProps {
  /**
   * URL of the background photo (remote or local /public path).
   * Defaults to the shared Aqaba banner used across the system.
   */
  imageUrl?: string;
  /** Main heading displayed over the image. */
  title: string;
  /** Optional supporting text shown below the heading. */
  subtitle?: string;
  /** Short label rendered inside the frosted-glass pill badge. */
  badgeLabel?: string;
  /** MUI SvgIcon component rendered inside the badge (e.g. AssignmentTurnedInIcon). */
  BadgeIcon?: SvgIconComponent;
  /**
   * CSS background-position value for fine-tuning which part of the image
   * is centred in the banner. Defaults to 'center 40%' to match the Aqaba photo.
   */
  imagePosition?: string;
  /** Override the default responsive height. */
  height?: BannerHeight;
}

/**
 * HeroBanner
 *
 * A reusable full-width banner with a background photo, an optional frosted-glass
 * badge, a main heading, and an optional subtitle.
 *
 * Direction-awareness comes entirely from theme.direction (the MUI canonical
 * source of truth), so this component works correctly for any RTL language —
 * not just Arabic — without any language-specific checks.
 *
 * CSS logical properties (marginInlineStart, paddingInline, textAlign: 'start')
 * are used wherever the browser supports them so the layout adapts automatically
 * when the dir attribute flips. The one exception is linear-gradient, which has
 * no logical equivalent yet, so its direction is toggled via theme.direction.
 */
const HeroBanner: React.FC<HeroBannerProps> = ({
  imageUrl = aqabaImage,
  title,
  subtitle,
  badgeLabel,
  BadgeIcon,
  imagePosition = 'center 60%',
  height = { xs: 180, sm: 220, md: 500 },
}) => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '24px',
        overflow: 'hidden',
        mb: 4,
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: imagePosition,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isRtl
            ? 'linear-gradient(to left, rgba(10,25,50,0.22) 0%, rgba(10,25,50,0.08) 45%, rgba(10,25,50,0) 100%)'
            : 'linear-gradient(to right, rgba(10,25,50,0.22) 0%, rgba(10,25,50,0.08) 45%, rgba(10,25,50,0) 100%)',
        }}
      />

      {/* Subtle noise / grain texture for depth */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      <Box
        dir={theme.direction}
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingInline: { xs: 3, md: 6 },
          gap: 1,
          ...(isMobile && {
           gap: 4,
          }),
        }}
      >
        {/* Frosted-glass pill badge — only rendered when a label is provided */}
        {badgeLabel !== undefined && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              // Solid fill so the photo does not show through the label.
              backgroundColor: BRAND_NAVY_DARK,
              border: `1px solid ${alpha('#ffffff', 0.35)}`,
              borderRadius: '99px',
              px: 1.8,
              py: 0.6,
              mb: 0.5,
            }}
          >
            {BadgeIcon !== undefined && (
              <BadgeIcon sx={{ fontSize: '0.95rem', color: '#ffffff' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                /*
                 * letter-spacing pushes characters apart. In RTL this creates
                 * unwanted space after the last character (before the icon).
                 * Logical direction: only apply spacing in LTR.
                 * No text-shadow here: it blurs this small label.
                 */
                letterSpacing: isRtl ? 'normal' : '0.04em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
            >
              {badgeLabel}
            </Typography>
          </Box>
        )}

        {/* Main heading */}
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: '#ffffff',
            lineHeight: 1.2,
            textShadow: BANNER_TEXT_SHADOW,
            fontSize: { xs: '1.2rem', md: '2rem' },
            /*
             * textAlign: 'start' is a CSS logical value — it resolves to
             * 'left' in LTR and 'right' in RTL without any JS branching.
             */
            textAlign: 'start',
          }}
        >
          {title}
        </Typography>

        {/* Subtitle — only rendered when provided */}
        {subtitle !== undefined && (
          <Typography
            variant="body2"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              maxWidth: 460,
              lineHeight: 1.6,
              textShadow: BANNER_TEXT_SHADOW,
              textAlign: 'start',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default HeroBanner;
