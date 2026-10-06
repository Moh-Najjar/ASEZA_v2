import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Avatar,
  Fade,
  InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import {
  Add as AddIcon,
  OpenInNew as OpenIcon,
  Delete as DeactivateIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Description as FormIcon,
  History as VersionIcon,
  Search as SearchIcon,
  CheckCircleOutline as ActiveIcon,
  PauseCircleOutline as InactiveIcon,
} from '@mui/icons-material';
import AdminLayout from '../../shared/AdminLayout';
import {
  useAdminForms,
  useCreateForm,
  useDeactivateForm,
} from '../../../../core/hooks/admin/useAdminForms';
import { useAdminDirectorates } from '../../../../core/hooks/admin/useAdminDirectorates';
import { useAdminFrequencies } from '../../../../core/hooks/admin/useAdminLookups';
import { BRAND_ACCENT, subtleBorder } from '../../../../core/constants/theme';
import type { CreateFormRequest } from '../../../../core/types/admin/adminForms';

// ─── Create Form Dialog ───────────────────────────────────────────────────────

interface CreateFormDialogProps {
  onClose: () => void;
}

const CreateFormDialog: React.FC<CreateFormDialogProps> = ({ onClose }) => {
  const createForm = useCreateForm();

  const { data: rawDirectorates, isLoading: directoratesLoading } = useAdminDirectorates();
  const { data: rawFrequencies, isLoading: frequenciesLoading } = useAdminFrequencies();

  const directorates = Array.isArray(rawDirectorates) ? rawDirectorates : [];
  const frequencies = Array.isArray(rawFrequencies) ? rawFrequencies : [];

  const [formKey, setFormKey] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [directorateId, setDirectorateId] = useState<number | ''>('');
  const [frequencyId, setFrequencyId] = useState<number | ''>('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const lookupsLoading = directoratesLoading || frequenciesLoading;

  const clearError = (field: string): void => {
    setErrors((prev) => {
      if (prev[field] === undefined || prev[field] === '') {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (formKey.trim().length === 0) {
      errs.formKey = 'Form key is required.';
    }
    if (nameEn.trim().length === 0) {
      errs.nameEn = 'English name is required.';
    }
    if (nameAr.trim().length === 0) {
      errs.nameAr = 'Arabic name is required.';
    }
    if (directorateId === '') {
      errs.directorateId = 'Directorate is required.';
    }
    if (frequencyId === '') {
      errs.frequencyId = 'Frequency is required.';
    }
    if (
      effectiveFrom.trim().length > 0 &&
      effectiveTo.trim().length > 0 &&
      effectiveTo < effectiveFrom
    ) {
      errs.effectiveTo = 'Effective to must be on or after effective from.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!validate()) return;

    if (directorateId === '' || frequencyId === '') {
      return;
    }

    const data: CreateFormRequest = {
      formKey: formKey.trim().toUpperCase(),
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      descriptionEn: descEn.trim().length > 0 ? descEn.trim() : undefined,
      descriptionAr: descAr.trim().length > 0 ? descAr.trim() : undefined,
      directorateId: Number(directorateId),
      frequencyId: Number(frequencyId),
      effectiveFrom: effectiveFrom.trim().length > 0 ? effectiveFrom.trim() : null,
      effectiveTo: effectiveTo.trim().length > 0 ? effectiveTo.trim() : null,
      isActive,
    };

    createForm.mutate(data, { onSuccess: onClose });
  };

  const handleDirectorateChange = (e: SelectChangeEvent<number | string>): void => {
    const val = e.target.value;
    setDirectorateId(val === '' ? '' : Number(val));
    clearError('directorateId');
  };

  const handleFrequencyChange = (e: SelectChangeEvent<number | string>): void => {
    const val = e.target.value;
    setFrequencyId(val === '' ? '' : Number(val));
    clearError('frequencyId');
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
          Create New Form
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {lookupsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box component="form" id="create-form-form" onSubmit={handleSubmit} noValidate sx={{ py: 1 }}>
            <Stack spacing={3}>
              <TextField
                label="Form Unique Key"
                value={formKey}
                onChange={(e) => {
                  setFormKey(e.target.value);
                  clearError('formKey');
                }}
                error={errors.formKey !== undefined && errors.formKey !== ''}
                helperText={errors.formKey ?? 'e.g. PERMIT_REQUEST. This cannot be changed later.'}
                fullWidth
                size="small"
                required
                InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="English Name"
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    clearError('nameEn');
                  }}
                  error={errors.nameEn !== undefined && errors.nameEn !== ''}
                  helperText={errors.nameEn}
                  fullWidth
                  size="small"
                  required
                  InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
                />
                <TextField
                  label="Arabic Name"
                  value={nameAr}
                  onChange={(e) => {
                    setNameAr(e.target.value);
                    clearError('nameAr');
                  }}
                  error={errors.nameAr !== undefined && errors.nameAr !== ''}
                  helperText={errors.nameAr}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ dir: 'rtl' }}
                  InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
                />
              </Stack>

              <TextField
                label="English Description"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={2}
                InputProps={{ sx: { borderRadius: '12px' } }}
              />
              <TextField
                label="Arabic Description"
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={2}
                inputProps={{ dir: 'rtl' }}
                InputProps={{ sx: { borderRadius: '12px' } }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl size="small" fullWidth required error={errors.directorateId !== undefined && errors.directorateId !== ''}>
                  <InputLabel>Directorate</InputLabel>
                  <Select
                    value={directorateId}
                    label="Directorate"
                    onChange={handleDirectorateChange}
                    sx={{ borderRadius: '12px' }}
                  >
                    {directorates.length === 0 ? (
                      <MenuItem disabled value="">
                        No directorates available
                      </MenuItem>
                    ) : (
                      directorates.map((d) => (
                        <MenuItem key={d.directorateId} value={d.directorateId} sx={{ fontWeight: 600 }}>
                          {d.nameEn}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.directorateId !== undefined && errors.directorateId !== '' && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.directorateId}
                    </Typography>
                  )}
                </FormControl>

                <FormControl size="small" fullWidth required error={errors.frequencyId !== undefined && errors.frequencyId !== ''}>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={frequencyId}
                    label="Frequency"
                    onChange={handleFrequencyChange}
                    sx={{ borderRadius: '12px' }}
                  >
                    {frequencies.length === 0 ? (
                      <MenuItem disabled value="">
                        No frequencies available
                      </MenuItem>
                    ) : (
                      frequencies.map((f) => (
                        <MenuItem key={f.frequencyId} value={f.frequencyId} sx={{ fontWeight: 600 }}>
                          {f.nameEn}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.frequencyId !== undefined && errors.frequencyId !== '' && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.frequencyId}
                    </Typography>
                  )}
                </FormControl>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Effective From"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => {
                    setEffectiveFrom(e.target.value);
                    clearError('effectiveFrom');
                    clearError('effectiveTo');
                  }}
                  error={errors.effectiveFrom !== undefined && errors.effectiveFrom !== ''}
                  helperText={errors.effectiveFrom ?? 'Optional'}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
                />
                <TextField
                  label="Effective To"
                  type="date"
                  value={effectiveTo}
                  onChange={(e) => {
                    setEffectiveTo(e.target.value);
                    clearError('effectiveTo');
                  }}
                  error={errors.effectiveTo !== undefined && errors.effectiveTo !== ''}
                  helperText={errors.effectiveTo ?? 'Optional'}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: effectiveFrom.length > 0 ? effectiveFrom : undefined }}
                  InputProps={{ sx: { borderRadius: '12px', fontWeight: 600 } }}
                />
              </Stack>

              <Paper
                variant="outlined"
                sx={{ p: 1, px: 2, borderRadius: '12px', bgcolor: 'action.hover', border: 'none' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={700}>
                      Form is active
                    </Typography>
                  }
                />
              </Paper>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="inherit"
          sx={{ borderRadius: '12px', bgcolor: 'action.hover', fontWeight: 700, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-form-form"
          variant="contained"
          disableElevation
          disabled={createForm.isPending || lookupsLoading}
          sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 4 }}
        >
          {createForm.isPending ? 'Creating...' : 'Create Form'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Search helpers ───────────────────────────────────────────────────────────

/** Arabic diacritics (tashkeel) and the tatweel stretch character. */
const ARABIC_MARKS_PATTERN = /[\u064B-\u065F\u0670\u0640]/g;

/**
 * Normalises text for case- and spelling-tolerant matching:
 * lowercases Latin text, strips Arabic diacritics, and unifies common
 * Arabic letter variants (أ/إ/آ → ا, ى → ي, ة → ه).
 */
const normalizeSearchText = (value: string | null | undefined): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .trim()
    .toLowerCase()
    .replace(ARABIC_MARKS_PATTERN, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
};

// ─── Summary stat card ────────────────────────────────────────────────────────

interface SummaryStatProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

/** Compact count card shown above the forms table. */
const SummaryStat: React.FC<SummaryStatProps> = ({ label, value, color, icon }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: subtleBorder(theme, 0.14),
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(color, 0.12),
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

// ─── FormManagement page ──────────────────────────────────────────────────────

const FormManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: rawForms, isLoading, isError, refetch, isFetching } = useAdminForms();
  const forms = Array.isArray(rawForms) ? rawForms : [];
  const deactivateForm = useDeactivateForm();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeactivate = (): void => {
    if (confirmDeactivateId === null) return;
    deactivateForm.mutate(confirmDeactivateId, {
      onSuccess: () => setConfirmDeactivateId(null),
    });
  };

  // Filter by English or Arabic name; an empty query shows every form.
  const normalizedQuery = normalizeSearchText(searchQuery);
  const filteredForms =
    normalizedQuery.length === 0
      ? forms
      : forms.filter(
          (form) =>
            normalizeSearchText(form.nameEn).includes(normalizedQuery) ||
            normalizeSearchText(form.nameAr).includes(normalizedQuery),
        );
  const activeCount = forms.filter((form) => form.isActive).length;

  // Shared header cell style for the forms table.
  const headerCellSx: SxProps<Theme> = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    bgcolor: alpha(theme.palette.text.primary, 0.03),
    borderBottom: '1px solid',
    borderColor: subtleBorder(theme, 0.12),
    py: 1.75,
    whiteSpace: 'nowrap',
  };

  // Outlined icon button style used by the header actions.
  const headerIconSx: SxProps<Theme> = {
    borderRadius: '12px',
    border: '1px solid',
    borderColor: subtleBorder(theme, 0.18),
    bgcolor: 'background.paper',
  };

  return (
    <AdminLayout>
      <Box sx={{ width: '100%', maxWidth: 1360 }}>
        {/* Page header */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.4 }}>
              Form Management
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.25 }}>
              Configure data collection structures
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} justifyContent="flex-end">
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  aria-label="Refresh forms"
                  sx={headerIconSx}
                >
                  {isFetching ? <CircularProgress size={20} thickness={6} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: '12px', fontWeight: 700, px: 2.5, textTransform: 'none' }}
            >
              New Form
            </Button>
          </Stack>
        </Stack>

        {/* Summary strip */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
            mb: 3,
          }}
        >
          <SummaryStat label="TOTAL FORMS" value={forms.length} color={theme.palette.primary.main} icon={<FormIcon fontSize="small" />} />
          <SummaryStat label="ACTIVE" value={activeCount} color={theme.palette.success.main} icon={<ActiveIcon fontSize="small" />} />
          <SummaryStat
            label="INACTIVE"
            value={forms.length - activeCount}
            color={theme.palette.grey[600]}
            icon={<InactiveIcon fontSize="small" />}
          />
        </Box>

        {/* Forms table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: subtleBorder(theme, 0.14),
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Toolbar with search */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid',
              borderColor: subtleBorder(theme, 0.12),
            }}
          >
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name (English or Arabic)…"
              size="small"
              inputProps={{ 'aria-label': 'Search forms by English or Arabic name' }}
              sx={{
                width: { xs: '100%', sm: 380 },
                '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 14, fontWeight: 600 },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: subtleBorder(theme, 0.28) },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment:
                  searchQuery.length > 0 ? (
                    <InputAdornment position="end">
                      <IconButton size="small" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
              }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ letterSpacing: '0.04em' }}>
              {normalizedQuery.length === 0
                ? `${forms.length} FORMS`
                : `${filteredForms.length} OF ${forms.length} FORMS`}
            </Typography>
          </Stack>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress thickness={5} />
            </Box>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mx: 'auto', mb: 2 }}>!</Avatar>
              <Typography fontWeight={700}>Unable to load forms</Typography>
              <Button onClick={() => void refetch()} variant="text" sx={{ mt: 1 }}>Retry</Button>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 900, '& .MuiTableCell-root': { px: 2 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Form Identifier</TableCell>
                    <TableCell sx={headerCellSx}>Display Name</TableCell>
                    <TableCell sx={headerCellSx}>Directorate</TableCell>
                    <TableCell sx={headerCellSx}>Structure</TableCell>
                    <TableCell sx={headerCellSx}>Status</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10, borderBottom: 0 }}>
                        <Typography color="text.secondary" fontWeight={600}>No forms have been created yet.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredForms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: 0 }}>
                        <SearchIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight={800} color="text.secondary">
                          No matching forms
                        </Typography>
                        <Typography variant="body2" color="text.disabled" fontWeight={600} sx={{ mb: 2 }}>
                          {`No form name matches "${searchQuery.trim()}".`}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSearchQuery('')}
                          sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                        >
                          Clear search
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredForms.map((form) => (
                      <TableRow
                        key={form.formId}
                        sx={{
                          '& td': {
                            borderColor: subtleBorder(theme, 0.1),
                            py: 1.75,
                            bgcolor: form.isActive ? 'transparent' : alpha(theme.palette.grey[500], 0.08),
                            transition: 'background-color 0.15s ease',
                          },
                          '& td:first-of-type': {
                            boxShadow: `inset 3px 0 0 ${form.isActive ? BRAND_ACCENT : theme.palette.text.disabled}`,
                          },
                          '&:nth-of-type(even) td': {
                            bgcolor: form.isActive ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.grey[500], 0.11),
                          },
                          '&:hover td': { bgcolor: alpha(BRAND_ACCENT, 0.08) },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        {/* Identifier */}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                                borderRadius: '10px',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(BRAND_ACCENT, 0.12),
                                color: BRAND_ACCENT,
                              }}
                            >
                              <FormIcon fontSize="small" />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'inline-block',
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                                  color: theme.palette.primary.main,
                                  px: 0.75,
                                  py: 0.25,
                                  borderRadius: '6px',
                                  fontWeight: 700,
                                  fontSize: 11,
                                  wordBreak: 'break-all',
                                }}
                              >
                                {form.formKey}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                                <VersionIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  v{form.version}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Names */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={800} color="text.primary">
                            {form.nameEn}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ direction: 'rtl', display: 'block', mt: 0.25 }}
                          >
                            {form.nameAr}
                          </Typography>
                        </TableCell>

                        {/* Directorate */}
                        <TableCell>
                          {form.directorate !== undefined ? (
                            <>
                              <Typography variant="body2" fontWeight={700} color="text.primary">
                                {form.directorate.nameEn}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={600}
                                sx={{ direction: 'rtl', display: 'block' }}
                              >
                                {form.directorate.nameAr}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="text.disabled" fontWeight={700}>
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* Structure */}
                        <TableCell>
                          <Stack spacing={0.75} alignItems="flex-start">
                            <Chip
                              label={form.formFields !== undefined ? `${form.formFields.length} fields` : 'Metadata only'}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontWeight: 800,
                                fontSize: 10,
                                borderRadius: '6px',
                                borderColor: subtleBorder(theme, 0.4),
                                color: 'text.secondary',
                              }}
                            />
                            {form.frequency !== undefined && (
                              <Chip
                                label={form.frequency.nameEn}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontWeight: 800,
                                  fontSize: 10,
                                  borderRadius: '6px',
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  color: theme.palette.primary.main,
                                }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Chip
                            label={form.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              height: 22,
                              fontWeight: 800,
                              fontSize: 10,
                              borderRadius: '6px',
                              bgcolor: form.isActive
                                ? alpha(theme.palette.success.main, 0.12)
                                : alpha(theme.palette.grey[500], 0.14),
                              color: form.isActive ? 'success.main' : 'text.secondary',
                            }}
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                            <Tooltip title="Configure structure">
                              <IconButton
                                size="small"
                                aria-label="Configure structure"
                                onClick={() => navigate(`/admin/forms/${form.formId}`)}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '8px',
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  color: theme.palette.primary.main,
                                  '&:hover': { bgcolor: theme.palette.primary.main, color: '#fff' },
                                }}
                              >
                                <OpenIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            {form.isActive && (
                              <Tooltip title="Deactivate">
                                <IconButton
                                  size="small"
                                  aria-label="Deactivate"
                                  onClick={() => setConfirmDeactivateId(form.formId)}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    bgcolor: alpha(theme.palette.error.main, 0.08),
                                    color: 'error.main',
                                    '&:hover': { bgcolor: 'error.main', color: '#fff' },
                                  }}
                                >
                                  <DeactivateIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Create form dialog */}
      {createDialogOpen && (
        <CreateFormDialog onClose={() => setCreateDialogOpen(false)} />
      )}

      {/* Confirm deactivate dialog */}
      <Dialog
        open={confirmDeactivateId !== null}
        onClose={() => setConfirmDeactivateId(null)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="error.main">Deactivate Form?</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.6 }}>
            Are you sure you want to deactivate this form? It will be archived and will no longer be accessible for new submissions.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setConfirmDeactivateId(null)}
            variant="contained"
            color="inherit"
            sx={{ borderRadius: '12px', bgcolor: 'action.hover', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeactivate}
            variant="contained"
            disableElevation
            color="error"
            disabled={deactivateForm.isPending}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 4 }}
          >
            {deactivateForm.isPending ? 'Working...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default FormManagement;
