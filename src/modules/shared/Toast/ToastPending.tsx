import React from 'react';
import { Box, CircularProgress, Typography, alpha, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ToastPendingProps {
  message: string;
  hint?: string;
}

const ToastPending: React.FC<ToastPendingProps> = ({ message, hint }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        // Using negative margins to fully reach the edges of the Toast container.
        // This removes the "boxed-in" look and makes the background/border hit the edges.
        margin: '-8px -12px',
        width: 'calc(100% + 24px)',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
      }}>
      {/* Spinner */}
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          flexShrink: 0,
          ml: 0.5,
        }}>
        <CircularProgress
          variant="determinate"
          size={24}
          thickness={4.5}
          value={100}
          sx={{ color: alpha(theme.palette.text.primary, 0.12) }}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          size={24}
          thickness={4.5}
          sx={{
            color: theme.palette.primary.main,
            animationDuration: '650ms',
            position: 'absolute',
            left: 0,
            [`& .MuiCircularProgress-circle`]: {
              strokeLinecap: 'round',
            },
          }}
        />
      </Box>

      {/* Text Container */}
      <Box sx={{ flexGrow: 1, minWidth: 0, py: 0.5 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            fontSize: '0.95rem',
          }}>
          {message}
        </Typography>

        {hint && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              mt: 0.5,
              display: 'block',
              fontSize: '0.78rem',
              opacity: 0.85,
              lineHeight: 1.3,
            }}>
            {hint}
          </Typography>
        )}
      </Box>

      {/* End Icon - positioned at the end of the toast */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 0.5,
          color: theme.palette.primary.main,
          opacity: 0.9,
        }}>
        <InfoOutlinedIcon sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  );
};

export default ToastPending;
