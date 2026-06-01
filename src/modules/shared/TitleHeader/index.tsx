import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

export interface TitleHeaderProps {
  /** The text shown in the middle of the header. */
  title: string;
  /** Optional override for the line color (defaults to theme primary). */
  lineColor?: string;
  /** Optional override for the text color (defaults to theme text.primary). */
  textColor?: string;
  /** Opacity for the lines; must be between 0 and 1. */
  lineOpacity?: number;
  /** Line thickness in pixels; must be a finite positive number. */
  lineThicknessPx?: number;
  /** Gap between the title and each line in pixels; must be a finite non-negative number. */
  gapPx?: number;
  /** Optional extra styles applied to the root container. */
  sx?: SxProps<Theme>;
}

const TitleHeader: React.FC<TitleHeaderProps> = ({
  title,
  lineColor,
  textColor,
  lineOpacity = 1,
  lineThicknessPx = 1,
  gapPx = 18,
  sx,
}) => {
  const theme = useTheme();

  // Resolve colors with safe fallbacks.
  // Use trimmed strings only; otherwise fall back to theme defaults.
  const resolvedLineColor =
    typeof lineColor === 'string' && lineColor.trim().length > 0 ? lineColor : theme.palette.primary.main;
  const resolvedTextColor =
    typeof textColor === 'string' && textColor.trim().length > 0 ? textColor : theme.palette.text.primary;

  // Prepare commonly-used style values without string concatenation.
  const lineHeight = `${lineThicknessPx}px`;
  const gap = `${gapPx}px`;

  return (
    <Box
      // Root container: center title with symmetrical lines.
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        // Keep the whole header looking balanced on small screens.
        py: { xs: 15, md: 5 },
        gap,
        ...sx,
      }}>
      {/* Left line */}
      <Box
        aria-hidden="true"
        sx={{
          flex: 1,
          height: lineHeight,
          backgroundColor: resolvedLineColor,
          opacity: lineOpacity,
          borderRadius: 999,
        }}
      />

      {/* Centered title */}
      <Typography
        sx={{
          color: resolvedTextColor,
          // Use the globally-registered "Dubai" font ONLY for this header title.
          // Keep a safe fallback to the app's base font variable.
          fontFamily: 'Dubai, var(--font-base)',
          fontWeight: 'bold',
          fontSize: theme.typography.h2.fontSize,
          lineHeight: 1.2,
          px: { xs: 2, md: 5 },
          // Prevent the title from wrapping and collapsing the lines too much.
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
        {title}
      </Typography>

      {/* Right line */}
      <Box
        aria-hidden="true"
        sx={{
          flex: 1,
          height: lineHeight,
          backgroundColor: resolvedLineColor,
          opacity: lineOpacity,
          borderRadius: 999,
        }}
      />
    </Box>
  );
};

export default TitleHeader;
