import React, { useState } from 'react';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

import type { NewRequestPayload, RequestPeriodType } from '../types';

/** Available KPI form options derived from formData-v1.json directorate groupings */
interface FormOption {
  formId: number;
  labelEn: string;
  labelAr: string;
}

const FORM_OPTIONS: readonly FormOption[] = [
  { formId: 7,  labelEn: 'Urban Transactions & Licensing KPIs',            labelAr: 'مؤشرات المعاملات العمرانية والتراخيص' },
  { formId: 8,  labelEn: 'Real Estate Assessment KPIs',                    labelAr: 'مؤشرات تقييم العقارات' },
  { formId: 9,  labelEn: 'Marine Reserve Environmental KPIs',               labelAr: 'مؤشرات المحمية البحرية البيئية' },
  { formId: 10, labelEn: 'Transport & Logistics Sector KPIs',              labelAr: 'مؤشرات قطاع النقل والخدمات اللوجستية' },
  { formId: 11, labelEn: 'Tourism Sector Performance KPIs',                labelAr: 'مؤشرات أداء قطاع السياحة' },
  { formId: 12, labelEn: 'Tenders & Supplies Performance KPIs',            labelAr: 'مؤشرات أداء العطاءات والتوريدات' },
  { formId: 13, labelEn: 'Regional Development Projects KPIs',             labelAr: 'مؤشرات مشاريع التنمية الإقليمية' },
  { formId: 14, labelEn: 'Oversight & Enforcement Inspection KPIs',        labelAr: 'مؤشرات التفتيش والرقابة والتنفيذ' },
  { formId: 15, labelEn: 'Citizens Complaints & Services KPIs',            labelAr: 'مؤشرات شكاوى المواطنين والخدمات' },
  { formId: 16, labelEn: 'Digital Transformation & E-Government KPIs',     labelAr: 'مؤشرات التحول الرقمي والحكومة الإلكترونية' },
  { formId: 17, labelEn: 'Environmental Protection & Sustainability KPIs', labelAr: 'مؤشرات حماية البيئة والاستدامة' },
  { formId: 18, labelEn: 'Human Resources & Workforce KPIs',               labelAr: 'مؤشرات الموارد البشرية والقوى العاملة' },
];

const PERIOD_TYPES: readonly RequestPeriodType[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];

interface AddRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: NewRequestPayload) => void;
}

interface FormState {
  formId: number | '';
  period: string;
  periodType: RequestPeriodType | '';
  notes: string;
}

const INITIAL_STATE: FormState = {
  formId: '',
  period: '',
  periodType: '',
  notes: '',
};

/**
 * Dialog for initiating a new KPI data submission request.
 * Captures form selection, reporting period, and optional notes.
 * Actual KPI value entry is handled in a dedicated form page (future scope).
 */
const AddRequestDialog: React.FC<AddRequestDialogProps> = ({ open, onClose, onSubmit }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isAr = i18n.language === 'ar';

  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  // Validation: all required fields must be filled
  const isValid: boolean =
    form.formId !== '' &&
    form.period.trim().length > 0 &&
    form.periodType !== '';

  const handleFormIdChange = (event: SelectChangeEvent<number | ''>): void => {
    const raw = event.target.value;
    // Convert the select value to a number if it's not an empty string
    const parsed = raw === '' ? '' : Number(raw);
    setForm((prev) => ({ ...prev, formId: parsed }));
  };

  const handlePeriodTypeChange = (event: SelectChangeEvent<RequestPeriodType | ''>): void => {
    setForm((prev) => ({ ...prev, periodType: event.target.value as RequestPeriodType | '' }));
  };

  const handlePeriodChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForm((prev) => ({ ...prev, period: event.target.value }));
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForm((prev) => ({ ...prev, notes: event.target.value }));
  };

  const handleClose = (): void => {
    setForm(INITIAL_STATE);
    onClose();
  };

  const handleSubmit = (): void => {
    // Guard: ensure valid before submitting
    if (!isValid || form.formId === '' || form.periodType === '') return;
    onSubmit({
      formId: form.formId,
      period: form.period.trim(),
      periodType: form.periodType,
      notes: form.notes.trim(),
    });
    setForm(INITIAL_STATE);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
      aria-labelledby="add-request-dialog-title">
      {/* Header */}
      <DialogTitle
        id="add-request-dialog-title"
        sx={{
          p: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AddCircleOutlineIcon sx={{ color: (t) => alpha(t.palette.primary.contrastText, 0.85), fontSize: 22 }} />
            <Typography variant="h6" sx={{ color: 'primary.contrastText', fontWeight: 800 }}>
              {t('myRequests.dialog.title')}
            </Typography>
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: (t) => alpha(t.palette.primary.contrastText, 0.75),
              '&:hover': { bgcolor: (t) => alpha(t.palette.primary.contrastText, 0.15) },
            }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
          {t('myRequests.dialog.subtitle')}
        </Typography>

        <Stack spacing={2.5}>
          {/* KPI Form / Directorate selector */}
          <FormControl fullWidth size="small" required>
            <InputLabel id="form-select-label">{t('myRequests.dialog.selectForm')}</InputLabel>
            <Select
              labelId="form-select-label"
              label={t('myRequests.dialog.selectForm')}
              value={form.formId}
              onChange={handleFormIdChange}
              sx={{ borderRadius: 2 }}>
              {FORM_OPTIONS.map((opt) => (
                <MenuItem key={opt.formId} value={opt.formId}>
                  {isAr ? opt.labelAr : opt.labelEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Period type */}
          <FormControl fullWidth size="small" required>
            <InputLabel id="period-type-select-label">{t('myRequests.dialog.periodType')}</InputLabel>
            <Select
              labelId="period-type-select-label"
              label={t('myRequests.dialog.periodType')}
              value={form.periodType}
              onChange={handlePeriodTypeChange}
              sx={{ borderRadius: 2 }}>
              {PERIOD_TYPES.map((pt) => (
                <MenuItem key={pt} value={pt}>
                  {t(`myRequests.periodType.${pt.toLowerCase()}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Period label — free text e.g. "2024", "Q1 2025", "Jan 2025" */}
          <TextField
            label={t('myRequests.dialog.period')}
            placeholder={t('myRequests.dialog.periodPlaceholder')}
            value={form.period}
            onChange={handlePeriodChange}
            size="small"
            required
            fullWidth
            InputProps={{ sx: { borderRadius: 2 } }}
            helperText={t('myRequests.dialog.periodHelper')}
          />

          {/* Optional notes */}
          <TextField
            label={t('myRequests.dialog.notes')}
            placeholder={t('myRequests.dialog.notesPlaceholder')}
            value={form.notes}
            onChange={handleNotesChange}
            size="small"
            fullWidth
            multiline
            rows={3}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}>
          {t('myRequests.actions.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            fontWeight: 700,
            background: isValid
              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
              : undefined,
          }}>
          {t('myRequests.dialog.submitButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRequestDialog;
