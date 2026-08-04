import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as RemoveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  AccountTree as DirectorateIcon,
  Description as FormIcon,
  Security as PermissionsIcon,
} from '@mui/icons-material';
import AdminLayout from '../../shared/AdminLayout';
import {
  useAdminDirectorates,
  useDirectorateForms,
  useActiveFormsDropdown,
  useAssignFormToDirectorate,
  useRemoveFormFromDirectorate,
} from '../../../../core/hooks/admin/useAdminDirectorates';
import { BRAND_NAVY, BRAND_ACCENT } from '../../../../core/constants/theme';
import type { AdminDirectorate, DirectorateFormAccess } from '../../../../core/types/admin/adminDirectorates';

// ─── Assign Form Dialog ───────────────────────────────────────────────────────

interface AssignFormDialogProps {
  directorate: AdminDirectorate;
  assignedFormIds: number[];
  onClose: () => void;
}

const AssignFormDialog: React.FC<AssignFormDialogProps> = ({
  directorate,
  assignedFormIds,
  onClose,
}) => {
  const { data: rawActiveForms } = useActiveFormsDropdown();
  const activeForms = Array.isArray(rawActiveForms) ? rawActiveForms : [];
  const assignForm = useAssignFormToDirectorate();

  const [selectedFormId, setSelectedFormId] = useState<number | ''>('');
  const [canView, setCanView] = useState(true);
  const [canSubmit, setCanSubmit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);

  const availableForms = activeForms.filter((f) => !assignedFormIds.includes(f.formId));

  const handleAssign = (): void => {
    if (selectedFormId === '') return;
    assignForm.mutate(
      {
        directorateId: directorate.directorateId,
        data: { formId: Number(selectedFormId), canView, canSubmit, canApprove },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
            Assign Form
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Target: {directorate.nameEn}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Stack spacing={3} sx={{ py: 1 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Select Form</InputLabel>
            <Select
              value={selectedFormId}
              label="Select Form"
              onChange={(e) => setSelectedFormId(e.target.value as number | '')}
              sx={{ borderRadius: '12px' }}
            >
              {availableForms.length === 0 ? (
                <MenuItem disabled>All forms already assigned</MenuItem>
              ) : (
                availableForms.map((f) => (
                  <MenuItem key={f.formId} value={f.formId} sx={{ fontWeight: 600 }}>
                    {f.nameEn}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PermissionsIcon fontSize="small" sx={{ color: BRAND_ACCENT }} />
              Access Permissions
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: '16px', bgcolor: 'action.hover', border: 'none' }}>
              <FormGroup sx={{ p: 1, px: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={canView} onChange={(e) => setCanView(e.target.checked)} size="small" />}
                  label={<Typography variant="body2" fontWeight={600}>Can View Submissions</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={canSubmit} onChange={(e) => setCanSubmit(e.target.checked)} size="small" />}
                  label={<Typography variant="body2" fontWeight={600}>Can Submit New Data</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={canApprove} onChange={(e) => setCanApprove(e.target.checked)} size="small" />}
                  label={<Typography variant="body2" fontWeight={600}>Can Approve/Reject</Typography>}
                />
              </FormGroup>
            </Paper>
          </Box>
        </Stack>
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
          onClick={handleAssign}
          variant="contained"
          disableElevation
          disabled={selectedFormId === '' || assignForm.isPending}
          sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 4 }}
        >
          {assignForm.isPending ? 'Assigning...' : 'Assign Form'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Directorate Row (expanded content) ──────────────────────────────────────

interface DirectorateRowProps {
  directorate: AdminDirectorate;
}

const DirectorateRow: React.FC<DirectorateRowProps> = ({ directorate }) => {
  const theme = useTheme();

  const { data: rawForms, isLoading } = useDirectorateForms(directorate.directorateId);
  const forms = Array.isArray(rawForms) ? rawForms : [];
  const removeForm = useRemoveFormFromDirectorate();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const assignedFormIds = forms.map((f) => f.formId);

  const handleRemove = (access: DirectorateFormAccess): void => {
    removeForm.mutate({ directorateId: directorate.directorateId, formId: access.formId });
  };

  const permissionBadge = (label: string, granted: boolean): React.ReactNode => (
    <Chip
      key={label}
      label={label}
      size="small"
      sx={{
        fontSize: 10,
        height: 20,
        fontWeight: 800,
        borderRadius: '6px',
        bgcolor: granted ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.divider, 0.5),
        color: granted ? theme.palette.success.main : theme.palette.text.disabled,
        border: 'none',
        mr: 0.5
      }}
    />
  );

  return (
    <>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} thickness={5} />
        </Box>
      ) : (
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormIcon fontSize="small" sx={{ color: BRAND_ACCENT }} />
              Assigned Forms
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAssignDialogOpen(true)}
              sx={{ borderRadius: '8px', fontWeight: 700, fontSize: 12, borderColor: BRAND_ACCENT, color: BRAND_ACCENT }}
            >
              Assign New
            </Button>
          </Stack>

          {forms.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.divider, 0.03), borderRadius: '16px', border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.disabled" fontWeight={600}>
                No forms currently assigned to this unit.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08), overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Form Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase' }}>Permissions</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.map((access) => (
                    <TableRow key={access.accessId} hover sx={{ '&:hover': { bgcolor: alpha(BRAND_ACCENT, 0.02) } }}>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {access.form?.nameEn ?? `Form #${access.formId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {access.form?.formKey}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row">
                          {permissionBadge('View', access.canView)}
                          {permissionBadge('Submit', access.canSubmit)}
                          {permissionBadge('Approve', access.canApprove)}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove Assignment">
                          <IconButton
                            size="small"
                            onClick={() => handleRemove(access)}
                            disabled={removeForm.isPending}
                            sx={{ color: 'error.light', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {assignDialogOpen && (
        <AssignFormDialog
          directorate={directorate}
          assignedFormIds={assignedFormIds}
          onClose={() => setAssignDialogOpen(false)}
        />
      )}
    </>
  );
};

// ─── DirectorateManagement page ───────────────────────────────────────────────

const DirectorateManagement: React.FC = () => {
  const theme = useTheme();
  const { data: rawDirectorates, isLoading, isError, refetch: refetchDirectorates, isFetching } = useAdminDirectorates();
  const directorates = Array.isArray(rawDirectorates) ? rawDirectorates : [];
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleAccordionChange = (id: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  return (
    <AdminLayout title="Directorates">
      <Box sx={{ maxWidth: 1000 }}>
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
                Directorate Structure
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Chip
                  label={`${directorates.length} units`}
                  size="small"
                  sx={{ bgcolor: alpha(BRAND_NAVY, 0.1), color: BRAND_NAVY, fontWeight: 800, borderRadius: '6px' }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Organizational hierarchy and access control
                </Typography>
              </Stack>
            </Box>
            <IconButton
              onClick={() => void refetchDirectorates()}
              disabled={isFetching}
              sx={{ bgcolor: 'action.hover', borderRadius: '12px', width: 40, height: 40 }}
            >
              {isFetching ? <CircularProgress size={20} thickness={6} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Paper>

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress thickness={5} />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography color="error" fontWeight={700}>Unable to load units</Typography>
            <Button onClick={() => void refetchDirectorates()} sx={{ mt: 1 }}>Retry</Button>
          </Box>
        ) : directorates.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 10 }}>No directorates found.</Typography>
        ) : (
          <Stack spacing={2}>
            {directorates.map((dir, index) => (
              <Accordion
                key={dir.directorateId}
                expanded={expanded === dir.directorateId}
                onChange={handleAccordionChange(dir.directorateId)}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.08),
                  borderRadius: '20px !important',
                  bgcolor: '#fff',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  animation: `slideUp 0.4s ease-out ${index * 0.05}s both`,
                  '@keyframes slideUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  },
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    borderColor: alpha(BRAND_ACCENT, 0.3),
                    boxShadow: `0 12px 24px ${alpha(BRAND_NAVY, 0.06)}`,
                    transform: 'scale(1.01)',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: BRAND_NAVY }} />}
                  sx={{ px: 3, py: 1, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                >
                  <Stack direction="row" alignItems="center" gap={2} sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: alpha(BRAND_NAVY, 0.05),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND_NAVY,
                      }}
                    >
                      <DirectorateIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        {dir.nameEn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        {dir.directorateKey}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={dir.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      height: 22,
                      fontWeight: 800,
                      fontSize: 10,
                      borderRadius: '6px',
                      bgcolor: dir.isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.divider, 0.1),
                      color: dir.isActive ? 'success.main' : 'text.disabled',
                      border: 'none',
                      mr: 2
                    }}
                  />
                </AccordionSummary>

                <AccordionDetails sx={{ px: 4, pb: 4, pt: 1 }}>
                  <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />
                  {expanded === dir.directorateId && <DirectorateRow directorate={dir} />}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
};

export default DirectorateManagement;
