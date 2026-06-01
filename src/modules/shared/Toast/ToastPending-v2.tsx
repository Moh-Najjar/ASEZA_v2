import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface ToastPendingProps {
  message: string;
  hint?: string;
}

/**
 * Professional pending indicator for toast.promise
 * Reassures users that the process runs in the background.
 */
const ToastPending: React.FC<ToastPendingProps> = ({ message, hint }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2.5,
        py: 1,
        px: 0.5,
      }}>
      {/* Modern High-End Loader */}
      <Box
        sx={{
          position: 'relative',
          width: 22,
          height: 22,
          mt: 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
        {/* Animated outer pulses */}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              opacity: 0,
            }}
            animate={{
              scale: [0.6, 2.2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 1,
              ease: 'easeOut',
            }}
          />
        ))}
        
        {/* Solid center dot with glow */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.main,
            position: 'relative',
            zIndex: 2,
            boxShadow: `0 0 15px ${theme.palette.primary.main}80`,
          }}
        />
        
        {/* Rotating subtle ring */}
        <motion.div
          style={{
            position: 'absolute',
            width: '130%',
            height: '130%',
            borderRadius: '50%',
            border: `1.5px solid ${theme.palette.primary.main}15`,
            borderTopColor: theme.palette.primary.main,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </Box>

      {/* Text Content */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            lineHeight: 1.3,
            fontSize: '0.925rem',
            letterSpacing: '-0.01em',
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
              fontWeight: 400,
              lineHeight: 1.4,
              opacity: 0.75,
              fontSize: '0.78rem',
            }}>
            {hint}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ToastPending;
