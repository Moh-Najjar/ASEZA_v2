import React, { useCallback, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BarChartIcon from '@mui/icons-material/BarChart';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Power BI secure embed URL.
 * Paste the full `src` from Power BI → File → Embed report → Website or portal,
 * or set `VITE_POWERBI_EXPORTS_EMBED_URL` in your `.env` file.
 */
const POWER_BI_EMBED_SRC: string =
  import.meta.env.VITE_POWERBI_EXPORTS_EMBED_URL ??
  'https://app.powerbi.com/view?r=eyJrIjoiZTFmYWExYWYtYzRhZi00N2YzLWJhZWEtZGRiYTMyNjM5YjgxIiwidCI6Ijhi';

const REPORT_TITLE = 'الصادرات-SP - MIT';

/** Original embed dimensions used to preserve the report aspect ratio. */
const EMBED_WIDTH = 800;
const EMBED_HEIGHT = 636;

const IframeTest: React.FC = () => {
  const theme = useTheme();

  // Track whether the iframe finished loading so we can hide the skeleton overlay.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = useState<boolean>(false);

  // Ref to the wrapper so the fullscreen button can target the whole embed card.
  const embedContainerRef = useRef<HTMLDivElement>(null);

  const isEmbedConfigured =
    POWER_BI_EMBED_SRC.startsWith('https://app.powerbi.com/view?r=') &&
    POWER_BI_EMBED_SRC.length > 120;

  const handleIframeLoad = useCallback((): void => {
    setIsLoading(false);
    setHasLoadError(false);
  }, []);

  const handleIframeError = useCallback((): void => {
    setIsLoading(false);
    setHasLoadError(true);
  }, []);

  const handleOpenInNewTab = useCallback((): void => {
    window.open(POWER_BI_EMBED_SRC, '_blank', 'noopener,noreferrer');
  }, []);

  const handleFullscreen = useCallback((): void => {
    const element = embedContainerRef.current;
    if (element === null) {
      return;
    }

    void element.requestFullscreen();
  }, []);

  return (
    <Box component="main" sx={{ py: { xs: 3, md: 5 }, pb: 8 }}>
      <Container maxWidth="xl">
        {/* Page header */}
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={<BarChartIcon sx={{ fontSize: '1rem !important' }} />}
            label="Power BI"
            size="small"
            sx={{
              mb: 1.5,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
            }}
          />

          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            {REPORT_TITLE}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Interactive dashboard embedded from Microsoft Power BI.
          </Typography>
        </Box>

        {!isEmbedConfigured && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Paste the complete Power BI embed URL into{' '}
            <Typography component="span" variant="body2" fontWeight={700}>
              VITE_POWERBI_EXPORTS_EMBED_URL
            </Typography>{' '}
            or replace the fallback constant in this file.
          </Alert>
        )}

        {hasLoadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            The report could not be loaded. Verify the embed URL and that you are signed in to Power BI.
          </Alert>
        )}

        {/* Responsive embed card */}
        <Paper
          ref={embedContainerRef}
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 18px 48px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              px: { xs: 2, md: 2.5 },
              py: 1.25,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {REPORT_TITLE}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Open in Power BI">
                <IconButton size="small" onClick={handleOpenInNewTab} aria-label="Open report in new tab">
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Fullscreen">
                <IconButton size="small" onClick={handleFullscreen} aria-label="View report fullscreen">
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Aspect-ratio wrapper keeps the iframe responsive on all screen sizes */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: `${EMBED_WIDTH} / ${EMBED_HEIGHT}`,
              minHeight: { xs: 320, sm: 420 },
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            {isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.92),
                }}
              >
                <CircularProgress size={36} />
                <Typography variant="body2" color="text.secondary">
                  Loading report…
                </Typography>
              </Box>
            )}

            <Box
              component="iframe"
              title={REPORT_TITLE}
              src={POWER_BI_EMBED_SRC}
              loading="lazy"
              allow="fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
              }}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default IframeTest;
