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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  OpenInNew as OpenIcon,
  Delete as DeactivateIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Description as FormIcon,
  History as VersionIcon,
} from '@mui/icons-material';
import AdminLayout from '../../shared/AdminLayout';
import {
  useAdminForms,
  useCreateForm,
  useDeactivateForm,
} from '../../../../core/hooks/admin/useAdminForms';
import { useAdminDirectorates } from '../../../../core/hooks/admin/useAdminDirectorates';
import { useAdminFrequencies } from '../../../../core/hooks/admin/useAdminLookups';
import { BRAND_NAVY, BRAND_ACCENT } from '../../../../core/constants/theme';
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

// ─── FormManagement page ──────────────────────────────────────────────────────

const FormManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: rawForms, isLoading, isError, refetch, isFetching } = useAdminForms();
  const forms = Array.isArray(rawForms) ? rawForms : [];
  const deactivateForm = useDeactivateForm();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);

  const handleDeactivate = (): void => {
    if (confirmDeactivateId === null) return;
    deactivateForm.mutate(confirmDeactivateId, {
      onSuccess: () => setConfirmDeactivateId(null),
    });
  };

  return (
    <AdminLayout title="Forms">
      <Box sx={{ maxWidth: 1200 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: '#fff',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ letterSpacing: -0.5, mb: 0.5 }}>
                Form Management
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Chip
                  label={`${forms.length} forms`}
                  size="small"
                  sx={{ bgcolor: alpha(BRAND_NAVY, 0.1), color: BRAND_NAVY, fontWeight: 800, borderRadius: '6px' }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Configure data collection structures
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" gap={1.5}>
              <IconButton
                onClick={() => void refetch()}
                disabled={isFetching}
                sx={{ bgcolor: 'action.hover', borderRadius: '12px', width: 40, height: 40 }}
              >
                {isFetching ? <CircularProgress size={20} thickness={6} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ borderRadius: '12px', fontWeight: 700, px: 3, textTransform: 'none' }}
              >
                New Form
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
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
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', py: 2.5 }}>Form Identifer</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', py: 2.5 }}>Display Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', py: 2.5 }}>Structure</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', py: 2.5 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 11, textTransform: 'uppercase', py: 2.5 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                        <Typography color="text.secondary" fontWeight={600}>No forms have been created yet.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    forms.map((form) => (
                      <TableRow
                        key={form.formId}
                        hover
                        sx={{
                          '&:hover': { bgcolor: alpha(BRAND_ACCENT, 0.02) },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack direction="row" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(BRAND_ACCENT, 0.1), color: BRAND_ACCENT }}>
                              <FormIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={800} color="text.primary">
                                {form.formKey}
                              </Typography>
                              <Stack direction="row" alignItems="center" gap={0.5}>
                                <VersionIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  v{form.version}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="text.primary">
                            {form.nameEn}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ direction: 'rtl', display: 'block' }}>
                            {form.nameAr}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={form.formFields !== undefined ? `${form.formFields.length} fields` : 'Metadata only'}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontWeight: 800,
                              fontSize: 10,
                              borderRadius: '6px',
                              borderColor: 'divider',
                              color: 'text.secondary'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={form.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              height: 24,
                              fontWeight: 800,
                              fontSize: 11,
                              borderRadius: '6px',
                              bgcolor: form.isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.divider, 0.1),
                              color: form.isActive ? 'success.main' : 'text.disabled',
                              border: 'none'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" gap={1} justifyContent="flex-end">
                            <Tooltip title="Configure structure">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/forms/${form.formId}`)}
                                sx={{
                                  bgcolor: alpha(BRAND_NAVY, 0.05),
                                  color: BRAND_NAVY,
                                  '&:hover': { bgcolor: BRAND_NAVY, color: '#fff' }
                                }}
                              >
                                <OpenIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {form.isActive && (
                              <Tooltip title="Deactivate">
                                <IconButton
                                  size="small"
                                  onClick={() => setConfirmDeactivateId(form.formId)}
                                  sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.05),
                                    color: 'error.main',
                                    '&:hover': { bgcolor: 'error.main', color: '#fff' }
                                  }}
                                >
                                  <DeactivateIcon fontSize="small" />
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
