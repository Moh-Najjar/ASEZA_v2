import React from 'react';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { useGetSubmissionDetails } from '../../../core/hooks/useFormApi';
import { getStatusChipProps, mapApiStatus } from '../utils/statusHelpers';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface DetailRowProps {
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
}

/** A single labeled row inside the detail drawer */
const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          mt: 0.2,
          color: theme.palette.primary.main,
          opacity: 0.7,
          flexShrink: 0,
          '& svg': { fontSize: 18 },
        }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.primary', fontWeight: 500, mt: 0.25, wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
};

interface NotesSectionProps {
  title: string;
  content: string;
  colorKey?: 'primary' | 'warning';
}

/** A highlighted notes/remarks block */
const NotesSection: React.FC<NotesSectionProps> = ({ title, content, colorKey = 'primary' }) => {
  const theme = useTheme();
  const color = colorKey === 'warning' ? theme.palette.warning.main : theme.palette.primary.main;
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(color, 0.06),
        border: '1px solid',
        borderColor: alpha(color, 0.2),
        borderLeft: `3px solid ${color}`,
      }}>
      <Typography
        variant="caption"
        sx={{
          color,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'block',
          mb: 0.75,
        }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
        {content}
      </Typography>
    </Box>
  );
};

// ─── Loading skeleton for drawer content ─────────────────────────────────────

const DrawerSkeleton: React.FC = () => (
  <Stack spacing={2.5} sx={{ px: 3, py: 3 }}>
    <Skeleton variant="rectangular" height={28} width="50%" sx={{ borderRadius: 10 }} />
    <Divider />
    {[1, 2, 3, 4, 5].map((i) => (
      <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
        <Skeleton variant="circular" width={20} height={20} sx={{ mt: 0.3, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="35%" height={14} />
          <Skeleton variant="text" width="70%" height={18} sx={{ mt: 0.5 }} />
        </Box>
      </Stack>
    ))}
  </Stack>
);

// ─── Props & main component ───────────────────────────────────────────────────

interface RequestDetailDrawerProps {
  /** The submissionId to fetch; null means the drawer has no target yet */
  submissionId: number | null;
  open: boolean;
  onClose: () => void;
  /** Called when the user triggers an edit action (only enabled for Draft/Returned) */
  onEdit?: (submissionId: number) => void;
}

/**
 * Right-side detail drawer that fetches full KPI submission details via
 * useGetSubmissionDetails and renders them in a structured layout.
 */
const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  submissionId,
  open,
  onClose,
  onEdit,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isAr = i18n.language === 'ar';

  // Fetch detail data — only runs when submissionId is defined
  const { data: detail, isLoading, isError } = useGetSubmissionDetails(
    submissionId ?? undefined,
  );

  /** Format an ISO date string to a readable locale-friendly label */
  const formatDate = (iso: string | null): string => {
    if (iso === null) return '—';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(isAr ? 'ar-JO' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Derive display values from the fetched detail
  const status       = detail ? mapApiStatus(detail.submissionStatus) : 'DRAFT';
  const formName     = detail ? (isAr ? detail.formNameAr     : detail.formNameEn)     : '';
  const directorate  = detail ? (isAr ? detail.directorateNameAr : detail.directorateNameEn) : '';
  const kpiCount     = detail ? detail.fieldValues.length : 0;
  const canEdit      = detail
    ? (detail.submissionStatus === 'Draft' || detail.submissionStatus === 'Returned')
    : false;

  // Period label: "April 2026" style
  const periodLabel  = detail
    ? new Date(detail.reportingDate).toLocaleDateString(isAr ? 'ar-JO' : 'en-GB', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 480 },
          boxShadow: `-8px 0 40px ${alpha(theme.palette.common.black, 0.12)}`,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        },
      }}>

      {/* ── Header ── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexShrink: 0,
        }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{ color: alpha('#fff', 0.7), fontWeight: 700, letterSpacing: '0.12em' }}>
            {t('myRequests.detail.title')}
          </Typography>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.3, mt: 0.3 }}>
            {detail?.referenceNumber ?? (isLoading ? '…' : '—')}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: alpha('#fff', 0.8),
            bgcolor: alpha('#fff', 0.1),
            '&:hover': { bgcolor: alpha('#fff', 0.2) },
          }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Scrollable content ── */}
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        {isLoading && <DrawerSkeleton />}

        {isError && !isLoading && (
          <Box sx={{ px: 3, py: 4 }}>
            <Alert severity="error">{t('common.errorLoading')}</Alert>
          </Box>
        )}

        {!isLoading && !isError && detail && (
          <Stack spacing={3} sx={{ px: 3, py: 3 }}>

            {/* Status chip + KPI count */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                {...getStatusChipProps(status, t)}
                size="medium"
                sx={{ fontWeight: 700, borderRadius: 2, px: 0.5 }}
              />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                {`${kpiCount} ${t('myRequests.detail.kpiCount')}`}
              </Typography>
            </Box>

            <Divider />

            {/* Core detail rows */}
            <Stack spacing={2.5}>
              <DetailRow
                icon={<AssignmentOutlinedIcon />}
                label={t('myRequests.table.form')}
                value={formName}
              />
              <DetailRow
                icon={<InfoOutlinedIcon />}
                label={t('myRequests.table.directorate')}
                value={directorate}
              />
              <DetailRow
                icon={<CalendarTodayOutlinedIcon />}
                label={t('myRequests.table.period')}
                value={periodLabel}
              />
              <DetailRow
                icon={<PersonOutlineIcon />}
                label={t('myRequests.detail.submittedBy')}
                value={detail.enteredByUserName}
              />
              <DetailRow
                icon={<CalendarTodayOutlinedIcon />}
                label={t('myRequests.detail.submittedAt')}
                value={formatDate(detail.createdAt)}
              />
              {detail.submittedAt !== null && (
                <DetailRow
                  icon={<CalendarTodayOutlinedIcon />}
                  label={t('myRequests.detail.lastUpdated')}
                  value={formatDate(detail.submittedAt)}
                />
              )}
              {detail.approvedByUserName !== null && (
                <DetailRow
                  icon={<PersonOutlineIcon />}
                  label={t('myRequests.detail.approvedBy')}
                  value={detail.approvedByUserName}
                />
              )}
            </Stack>

            {/* Submitter notes */}
            {typeof detail.notes === 'string' && detail.notes.length > 0 && (
              <>
                <Divider />
                <NotesSection
                  title={t('myRequests.detail.notes')}
                  content={detail.notes}
                  colorKey="primary"
                />
              </>
            )}

            {/* Rejection reason (reviewer feedback) */}
            {typeof detail.rejectionReason === 'string' && detail.rejectionReason.length > 0 && (
              <>
                <Divider />
                <NotesSection
                  title={t('myRequests.detail.reviewerFeedback')}
                  content={detail.rejectionReason}
                  colorKey={status === 'REJECTED' || status === 'RETURNED' ? 'warning' : 'primary'}
                />
              </>
            )}

          </Stack>
        )}

        {/* Centered spinner during initial open before any data arrives */}
        {isLoading && submissionId !== null && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {/* ── Footer actions ── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1.5,
          justifyContent: 'flex-end',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}>
        <Tooltip title={canEdit ? '' : t('myRequests.detail.cannotEditTooltip')} arrow>
          <span>
            <Box
              component="button"
              disabled={!canEdit}
              onClick={() => {
                if (submissionId !== null && canEdit && onEdit !== undefined) {
                  onEdit(submissionId);
                }
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: canEdit ? 'primary.main' : 'divider',
                bgcolor: 'transparent',
                color: canEdit ? 'primary.main' : 'text.disabled',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: canEdit ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                '&:hover': canEdit ? { bgcolor: alpha(theme.palette.primary.main, 0.08) } : {},
              }}>
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
              {t('myRequests.actions.edit')}
            </Box>
          </span>
        </Tooltip>

        <Box
          component="button"
          onClick={onClose}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2.5,
            py: 1,
            borderRadius: 2,
            border: 'none',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            '&:hover': { bgcolor: 'primary.dark' },
          }}>
          {t('myRequests.actions.close')}
        </Box>
      </Box>
    </Drawer>
  );
};

export default RequestDetailDrawer;
