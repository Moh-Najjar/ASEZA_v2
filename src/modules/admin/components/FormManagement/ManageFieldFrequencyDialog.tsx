import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  Fade,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  useAdminFieldFrequency,
  useAssignFieldFrequency,
} from '../../../../core/hooks/admin/useAdminForms';
import { useAdminFrequencies, useAdminFrequencyPeriods } from '../../../../core/hooks/admin/useAdminLookups';
import { BRAND_ACCENT } from '../../../../core/constants/theme';
import type { AdminFormField, AssignFieldFrequencyRequest } from '../../../../core/types/admin/adminForms';
import type { Frequency, FrequencyPeriodWindow } from '../../../../core/types/admin/adminLookups';
import {
  formatPeriodRange,
  formatPeriodWindowLabel,
  frequencyRequiresMonth,
  frequencySupportsCustomPeriodStart,
  toDateInputValue,
} from '../../../../core/utils/frequencyPeriods';

interface ManageFieldFrequencyDialogProps {
  formId: number;
  field: AdminFormField;
  onClose: () => void;
}

const textFieldSx = { borderRadius: '12px', fontWeight: 600 };

const MONTH_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = (): number => new Date().getFullYear();
const currentMonth = (): number => new Date().getMonth() + 1;

const resolveFrequency = (
  frequencyId: number | '',
  frequencies: Frequency[],
): Frequency | undefined => {
  if (frequencyId === '') {
    return undefined;
  }
  return frequencies.find((item) => item.frequencyId === frequencyId);
};

interface PeriodWindowsListProps {
  title: string;
  emptyLabel: string;
  periods: FrequencyPeriodWindow[];
  submittedKeys: ReadonlySet<string>;
  isLoading: boolean;
}

const PeriodWindowsList: React.FC<PeriodWindowsListProps> = ({
  title,
  emptyLabel,
  periods,
  submittedKeys,
  isLoading,
}) => (
  <Box>
    <Typography
      variant="caption"
      fontWeight={800}
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}
    >
      {title}
    </Typography>
    {isLoading ? (
      <Stack direction="row" alignItems="center" gap={1} sx={{ py: 1 }}>
        <CircularProgress size={16} thickness={6} />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Loading periods...
        </Typography>
      </Stack>
    ) : periods.length === 0 ? (
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {emptyLabel}
      </Typography>
    ) : (
      <Stack spacing={1}>
        {periods.map((period) => {
          const itemKey = period.periodKey.length > 0
            ? period.periodKey
            : `${period.periodStartDate}-${period.periodEndDate}`;
          const isSubmitted = submittedKeys.has(period.periodKey);
          const range = formatPeriodRange(period);

          return (
            <Paper
              key={itemKey}
              variant="outlined"
              sx={{ p: 1.25, px: 1.5, borderRadius: '12px', bgcolor: 'action.hover', border: 'none' }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="body2" fontWeight={800}>
                    {formatPeriodWindowLabel(period)}
                  </Typography>
                  {range.length > 0 && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {range}
                    </Typography>
                  )}
                </Box>
                {isSubmitted && (
                  <Chip
                    label="Submitted"
                    size="small"
                    sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: alpha(BRAND_ACCENT, 0.12), color: BRAND_ACCENT }}
                  />
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    )}
  </Box>
);

const ManageFieldFrequencyDialog: React.FC<ManageFieldFrequencyDialogProps> = ({
  formId,
  field,
  onClose,
}) => {
  const { data: rawFrequencies, isLoading: frequenciesLoading } = useAdminFrequencies();
  const frequencies = Array.isArray(rawFrequencies) ? rawFrequencies : [];
  const assignFrequency = useAssignFieldFrequency();

  const [frequencyId, setFrequencyId] = useState<number | ''>(field.frequencyId ?? '');
  const [periodStartDate, setPeriodStartDate] = useState(toDateInputValue(field.periodStartDate));
  const [yearInput, setYearInput] = useState(String(currentYear()));
  const [month, setMonth] = useState<number>(currentMonth());
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [hasAssigned, setHasAssigned] = useState(false);

  const parsedYear = Number(yearInput.trim());
  const yearIsValid = Number.isInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100;

  const selectedFrequency = resolveFrequency(frequencyId, frequencies);
  const needsMonth = frequencyRequiresMonth(selectedFrequency);
  const showCustomStart = frequencySupportsCustomPeriodStart(selectedFrequency);
  const previewMonth = needsMonth ? month : undefined;
  const previewStartDate = showCustomStart && periodStartDate.trim().length > 0
    ? periodStartDate
    : undefined;

  const previewPeriods = useAdminFrequencyPeriods(
    frequencyId === '' ? 0 : frequencyId,
    yearIsValid ? parsedYear : 0,
    previewMonth,
    previewStartDate,
  );

  const assignedFrequencyQuery = useAdminFieldFrequency(
    formId,
    field.fieldId,
    yearIsValid && (field.frequencyId !== null || hasAssigned) ? parsedYear : 0,
    field.frequency !== null && frequencyRequiresMonth(field.frequency) ? month : undefined,
  );

  const submittedKeys = useMemo(() => {
    const periods = assignedFrequencyQuery.data?.submittedPeriods ?? [];
    return new Set(periods.map((period) => period.periodKey).filter((key) => key.length > 0));
  }, [assignedFrequencyQuery.data?.submittedPeriods]);

  const assignedLabel = field.frequency !== null
    ? field.frequency.nameEn
    : 'Not assigned';

  const handleAssign = async (): Promise<void> => {
    setSubmitError('');
    setError('');

    if (frequencyId === '') {
      setError('Select a frequency before assigning.');
      return;
    }
    if (!yearIsValid) {
      setError('Enter a valid year (1900–2100).');
      return;
    }

    try {
      const data: AssignFieldFrequencyRequest = { frequencyId };
      if (frequencySupportsCustomPeriodStart(selectedFrequency)) {
        data.periodStartDate = periodStartDate.trim().length > 0 ? periodStartDate : null;
      }
      await assignFrequency.mutateAsync({
        formId,
        fieldId: field.fieldId,
        data,
      });
      setHasAssigned(true);
    } catch {
      setSubmitError('Unable to assign frequency. The field must have a KPI definition.');
    }
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
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
            Field Frequency
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {field.labelEn} ({field.fieldKey})
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, maxHeight: '70vh' }}>
        <Stack spacing={3} sx={{ py: 1 }}>
          <Paper
            variant="outlined"
            sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(BRAND_ACCENT, 0.06), borderColor: alpha(BRAND_ACCENT, 0.2) }}
          >
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              CURRENT FREQUENCY
            </Typography>
            <Typography variant="body2" fontWeight={800}>
              {assignedLabel}
              {field.frequency !== null ? ` (${field.frequency.code})` : ''}
            </Typography>
            {field.periodStartDate !== null && field.periodStartDate.length > 0 && (
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.5 }}>
                Custom start: {toDateInputValue(field.periodStartDate)} (month + day repeat each year)
              </Typography>
            )}
            {field.kpiId === null && (
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.5 }}>
                This updates the KPI definition. Assign a KPI on the field if save fails.
              </Typography>
            )}
          </Paper>

          <FormControl size="small" fullWidth error={error.length > 0} required>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={frequencyId}
              label="Frequency"
              onChange={(e) => {
                const val = e.target.value as string | number;
                if (val === '' || val === undefined) {
                  setFrequencyId('');
                } else {
                  setFrequencyId(Number(val));
                }
                setError('');
              }}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="" sx={{ fontWeight: 600 }}>
                {frequenciesLoading ? 'Loading frequencies...' : 'Select frequency'}
              </MenuItem>
              {frequencies.map((item) => (
                <MenuItem key={item.frequencyId} value={item.frequencyId} sx={{ fontWeight: 600 }}>
                  {item.nameEn}
                  {item.hasDiscretePeriods ? ' · discrete periods' : ''}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color={error.length > 0 ? 'error' : 'text.secondary'} sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
              {error.length > 0 ? error : 'PUT assigns this frequency on the field KPI only.'}
            </Typography>
          </FormControl>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Year"
              value={yearInput}
              onChange={(e) => {
                setYearInput(e.target.value);
                setError('');
              }}
              error={!yearIsValid}
              helperText={yearIsValid ? 'Used to preview and load period windows' : 'Enter a year between 1900 and 2100'}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 1900, max: 2100, step: 1 }}
              InputProps={{ sx: textFieldSx }}
            />
            {needsMonth && (
              <FormControl size="small" fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={month}
                  label="Month"
                  onChange={(e) => setMonth(Number(e.target.value))}
                  sx={{ borderRadius: '12px' }}
                >
                  {MONTH_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value} sx={{ fontWeight: 600 }}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                  Required to preview daily / weekly windows.
                </Typography>
              </FormControl>
            )}
            {showCustomStart && (
              <TextField
                label="Period start date"
                type="date"
                value={periodStartDate}
                onChange={(e) => setPeriodStartDate(e.target.value)}
                helperText="Only month + day repeat each year. Leave empty to reset to 1 January."
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: textFieldSx }}
              />
            )}
          </Stack>

          <PeriodWindowsList
            title="Preview windows"
            emptyLabel="Select a frequency to preview its calendar windows."
            periods={previewPeriods.data ?? []}
            submittedKeys={submittedKeys}
            isLoading={previewPeriods.isFetching}
          />

          {(field.frequencyId !== null || hasAssigned) && (
            <>
              <Divider sx={{ borderStyle: 'dashed' }} />
              <PeriodWindowsList
                title="Expected periods"
                emptyLabel="No expected periods for this year."
                periods={assignedFrequencyQuery.data?.expectedPeriods ?? []}
                submittedKeys={submittedKeys}
                isLoading={assignedFrequencyQuery.isFetching}
              />
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}
                >
                  Submitted periods
                </Typography>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  {assignedFrequencyQuery.data?.submittedPeriods.length ?? 0} submission row(s) for this year
                </Typography>
              </Box>
            </>
          )}

          {submitError !== '' && (
            <Typography variant="body2" color="error" fontWeight={600}>
              {submitError}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="inherit"
          sx={{ borderRadius: '12px', bgcolor: 'action.hover', fontWeight: 700, textTransform: 'none' }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            void handleAssign();
          }}
          variant="contained"
          disableElevation
          disabled={assignFrequency.isPending || frequencyId === ''}
          sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 4 }}
        >
          {assignFrequency.isPending ? 'Saving...' : 'Assign Frequency'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageFieldFrequencyDialog;
