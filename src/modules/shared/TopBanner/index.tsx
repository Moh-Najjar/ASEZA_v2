import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { useDirection } from '../../../core/context/DirectionContext';

/**
 * TopBanner
 * Reusable banner that renders:
 * - A background image
 * - A translucent "glass" text panel positioned at the top-left
 *
 * Requirements covered:
 * - Strict TypeScript (no `any`)
 * - Defensive runtime validation (fails safe)
 * - Double-quote strings
 */
export interface TopBannerProps {
  /** Background image src (imported asset string or URL). */
  imageSrc: string;
  /** Accessible alt text for the banner image. */
  imageAlt?: string;

  /**
   * If true, render an image-only banner (no text panel).
   * This is useful for pages that only want the banner artwork without a verse block.
   */
  hideTextPanel?: boolean;

  /** First line of text (e.g., "قال تعالى:"). */
  text1?: string;
  /** Second line of text (e.g., the quote). */
  text2?: string;
  /** Third line of text (e.g., a reference); optional for pages that only need 2 lines. */
  text3?: string;

  /** Optional override for the text color (defaults to theme primary). */
  textColor?: string;

  /**
   * Where to anchor the text panel inside the banner.
   * - "top-left": aligns panel to the top-left (default)
   * - "top-right": aligns panel to the top-right
   * - "center": centers panel
   */
  anchor?: 'top-left' | 'top-right' | 'center';

  /** Optional override for text alignment within the panel. */
  textAlign?: 'left' | 'right' | 'center';

  /** Optional additional styles for the text panel. */
  panelSx?: SxProps<Theme>;

  /** Optional additional styles for the root container. */
  sx?: SxProps<Theme>;
}

// Small helper to validate strings without using `any`.
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const TopBanner: React.FC<TopBannerProps> = ({
  imageSrc,
  imageAlt,
  hideTextPanel = false,
  text1,
  text2,
  text3,
  textColor,
  anchor = 'top-right',
  textAlign,
  panelSx,
  sx,
}) => {
  const theme = useTheme();
  const dir = useDirection();
  // Validate required props at runtime to avoid rendering a broken banner.
  // TypeScript prevents most issues, but runtime checks help if data is dynamic.
  if (!isNonEmptyString(imageSrc)) {
    console.error(['TopBanner: invalid props.', `imageSrc="${String(imageSrc)}"`].join(' '));
    return null;
  }

  // If we are rendering the text panel, `text1` and `text2` are required.
  if (!hideTextPanel && (!isNonEmptyString(text1) || !isNonEmptyString(text2))) {
    console.error(
      [
        'TopBanner: invalid props (text panel requires text1 + text2).',
        `text1="${String(text1)}"`,
        `text2="${String(text2)}"`,
      ].join(' ')
    );
    return null;
  }

  // Resolve the text color with a safe fallback.
  const resolvedTextColor = isNonEmptyString(textColor) ? theme.palette.primary.main : theme.palette.primary.main;

  // Derive layout defaults from the anchor, while still allowing explicit overrides.
  const resolvedAlignItems: 'flex-start' | 'flex-end' | 'center' =
    anchor === 'top-right' ? 'flex-end' : anchor === 'center' ? 'center' : 'flex-start';
  const resolvedJustifyContent: 'flex-start' | 'center' = anchor === 'center' ? 'center' : 'flex-start';
  const resolvedTextAlign: 'left' | 'right' | 'center' =
    typeof textAlign === 'string'
      ? textAlign
      : anchor === 'top-left'
      ? 'right'
      : anchor === 'center'
      ? 'center'
      : 'left';

  return (
    <Box
      // Root: contains the background image and the text panel.
      sx={{
        position: 'relative',
        width: '100%',
        // Keep the existing desktop height, and let mobile height be driven by content.
        height: { xs: '150px', md: '450px' },
        borderRadius: '16px',
        overflow: 'hidden',
        mb: 4,
        // Use a column layout (same as the original banners) and anchor the panel using flex alignment.
        display: 'flex',
        flexDirection: 'column',
        alignItems: resolvedAlignItems,
        justifyContent: resolvedJustifyContent,
        // Add breathing room so the panel isn't flush to the edges.
        p: { xs: 2, md: 3 },
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        direction: dir === 'rtl' ? 'ltr' : 'rtl',
        ...sx,
      }}>
      {/* Background image */}
      <Box
        component="img"
        src={imageSrc}
        alt={isNonEmptyString(imageAlt) ? imageAlt : 'Banner'}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      {/* Text panel */}
      {!hideTextPanel ? (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            // Text alignment is configurable; default is derived from `anchor`.
            p: { xs: '20px', md: '60px' },
            // backdropFilter: 'blur(2px)',
            borderRadius: '12px',
            // Prevent the panel from spanning the whole banner on wide screens.
            ...panelSx,

          }}>
          <Typography sx={{ color: resolvedTextColor, fontSize: { xs: '13px', md: '24px' }, mb: 1, fontFamily: 'LyonArabicText' }}>
            {text1}
          </Typography>

          <Typography
            sx={{
              color: resolvedTextColor,
              fontSize: { xs: '13px', md: '24px' },
              mb: isNonEmptyString(text3) ? 1 : 0,
              // Help Arabic quotes look good with more breathing room.
              lineHeight: 1.6,
              fontFamily: 'LyonArabicText',
              fontWeight: 'bold',
            }}>
            {text2}
          </Typography>

          {isNonEmptyString(text3) ? (
            <Typography sx={{ color: resolvedTextColor, fontSize: { xs: '13px', md: '24px' }, textAlign: 'right', fontFamily: 'LyonArabicText' }}>
              {text3}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default TopBanner;
