import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Fade,
  Divider,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Schema as DependenciesIcon,
  Description as FormIcon,
  History as VersionIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import AdminLayout from '../../shared/AdminLayout';
import {
  useAdminFormDetail,
  useAddField,
  useRemoveField,
  useSetCalculation,
} from '../../../../core/hooks/admin/useAdminForms';
import { useAdminControlTypes, useAdminDataTypes, useAdminFrequencies, useAdminLookupTypes } from '../../../../core/hooks/admin/useAdminLookups';
import { BRAND_NAVY, BRAND_ACCENT } from '../../../../core/constants/theme';
import { ControlKeys } from '../../../../core/enums/control-keys.enum';
import type { AdminFormField, AddFieldRequest } from '../../../../core/types/admin/adminForms';
import type { ControlType, DataType, LookupType } from '../../../../core/types/admin/adminLookups';
import { frequencySupportsCustomPeriodStart, toDateInputValue } from '../../../../core/utils/frequencyPeriods';
import CalculationConfigFields from './CalculationConfigFields';
import {
  buildSetCalculationRequest,
  createDefaultCalculationConfig,
  validateCalculationConfig,
  type CalculationConfigDraft,
} from './calculationConfig.utils';
import {
  formatControlTypeLabel,
  getControlRequirements,
  isCalculatedControlType,
  isLookupRequired,
  resolveControlType,
  resolveSuggestedDataTypeId,
} from './controlFieldRequirements';
import ManageTableStructureDialog from './ManageTableStructureDialog';
import ManageFieldFrequencyDialog from './ManageFieldFrequencyDialog';
import EditFieldDialog from './EditFieldDialog';
import RegexPatternSelect from './RegexPatternSelect';
import type { RegexPatternPreset } from './regexPatterns';

// ─── Add Field helpers ────────────────────────────────────────────────────────

const parseOptionalString = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseOptionalNumber = (
  value: string,
  fieldName: string,
  errs: Record<string, string>,
): number | undefined => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    errs[fieldName] = 'Must be a valid number';
    return undefined;
  }
  return parsed;
};

interface FieldSectionProps {
  title: string;
  children: React.ReactNode;
}

const FieldSection: React.FC<FieldSectionProps> = ({ title, children }) => (
  <Box>
    <Typography
      variant="caption"
      fontWeight={800}
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}
    >
      {title}
    </Typography>
    <Stack spacing={2}>{children}</Stack>
  </Box>
);

const resolveLookupType = (
  lookupTypeId: number | null,
  lookupTypes: LookupType[],
): LookupType | undefined => {
  if (lookupTypeId === null) {
    return undefined;
  }
  return lookupTypes.find((lookupType) => lookupType.lookupTypeId === lookupTypeId);
};

const formatLookupTypeLabel = (
  lookupTypeId: number | null,
  lookupTypes: LookupType[],
): string => {
  const lookupType = resolveLookupType(lookupTypeId, lookupTypes);
  if (lookupType === undefined) {
    return lookupTypeId === null ? '—' : `Lookup #${lookupTypeId}`;
  }
  return lookupType.nameEn;
};

// ─── Add Field Dialog ─────────────────────────────────────────────────────────

interface AddFieldDialogProps {
  formId: number;
  currentMaxOrder: number;
  inheritedFrequencyName: string | null;
  onClose: () => void;
}

const AddFieldDialog: React.FC<AddFieldDialogProps> = ({ formId, currentMaxOrder, inheritedFrequencyName, onClose }) => {
  const { data: rawControlTypes } = useAdminControlTypes();
  const { data: rawDataTypes } = useAdminDataTypes();
  const { data: rawLookupTypes } = useAdminLookupTypes();
  const { data: rawFrequencies } = useAdminFrequencies();
  const controlTypes = Array.isArray(rawControlTypes) ? rawControlTypes : [];
  const dataTypes = Array.isArray(rawDataTypes) ? rawDataTypes : [];
  const lookupTypes = Array.isArray(rawLookupTypes) ? rawLookupTypes : [];
  const frequencies = Array.isArray(rawFrequencies) ? rawFrequencies : [];
  const addField = useAddField();
  const setCalculation = useSetCalculation();

  const [fieldKey, setFieldKey] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [labelAr, setLabelAr] = useState('');
  const [dataTypeId, setDataTypeId] = useState<number | ''>('');
  const [controlTypeId, setControlTypeId] = useState<number | ''>('');
  const [displayOrder, setDisplayOrder] = useState(String(currentMaxOrder + 1));
  const [isRequired, setIsRequired] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [minLength, setMinLength] = useState('');
  const [maxLength, setMaxLength] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [placeholderEn, setPlaceholderEn] = useState('');
  const [placeholderAr, setPlaceholderAr] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [helpTextEn, setHelpTextEn] = useState('');
  const [helpTextAr, setHelpTextAr] = useState('');
  const [validationMessageEn, setValidationMessageEn] = useState('');
  const [validationMessageAr, setValidationMessageAr] = useState('');
  const [lookupTypeId, setLookupTypeId] = useState<number | ''>('');
  const [kpiId, setKpiId] = useState('');
  const [frequencyId, setFrequencyId] = useState<number | ''>('');
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [calculationConfig, setCalculationConfig] = useState<CalculationConfigDraft>(() =>
    createDefaultCalculationConfig(dataTypes, controlTypes),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const controlReq = getControlRequirements(controlTypeId, controlTypes);
  const isCalculatedControl = isCalculatedControlType(controlTypeId, controlTypes);
  const lookupRequired = isLookupRequired(controlTypeId, controlTypes);

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

    if (fieldKey.trim().length === 0) {
      errs.fieldKey = 'Required';
    }
    if (labelEn.trim().length === 0) {
      errs.labelEn = 'Required';
    }
    if (labelAr.trim().length === 0) {
      errs.labelAr = 'Required';
    }
    if (dataTypeId === '') {
      errs.dataTypeId = 'Required';
    }
    if (controlTypeId === '') {
      errs.controlTypeId = 'Required';
    }

    if (lookupRequired && lookupTypeId === '') {
      errs.lookupTypeId = 'Required for this control type';
    }

    if (controlReq?.controlKey === ControlKeys.Label) {
      if (placeholderEn.trim().length === 0) {
        errs.placeholderEn = 'Required for Label fields';
      }
      if (placeholderAr.trim().length === 0) {
        errs.placeholderAr = 'Required for Label fields';
      }
    }

    if (isCalculatedControl) {
      const calculationErrors = validateCalculationConfig(calculationConfig);
      Object.assign(errs, calculationErrors);
    }

    const orderTrimmed = displayOrder.trim();
    if (orderTrimmed.length === 0) {
      errs.displayOrder = 'Required';
    } else {
      const parsedOrder = Number(orderTrimmed);
      if (Number.isNaN(parsedOrder) || parsedOrder < 1) {
        errs.displayOrder = 'Must be a positive number';
      }
    }

    const parsedMinValue = parseOptionalNumber(minValue, 'minValue', errs);
    const parsedMaxValue = parseOptionalNumber(maxValue, 'maxValue', errs);
    const parsedMinLength = parseOptionalNumber(minLength, 'minLength', errs);
    const parsedMaxLength = parseOptionalNumber(maxLength, 'maxLength', errs);
    parseOptionalNumber(kpiId, 'kpiId', errs);

    if (
      parsedMinValue !== undefined &&
      parsedMaxValue !== undefined &&
      parsedMinValue > parsedMaxValue
    ) {
      errs.maxValue = 'Max value must be greater than or equal to min value';
    }
    if (
      parsedMinLength !== undefined &&
      parsedMaxLength !== undefined &&
      parsedMinLength > parsedMaxLength
    ) {
      errs.maxLength = 'Max length must be greater than or equal to min length';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    if (dataTypeId === '' || controlTypeId === '') {
      return;
    }

    const validationErrs: Record<string, string> = {};
    const parsedMinValue = parseOptionalNumber(minValue, 'minValue', validationErrs);
    const parsedMaxValue = parseOptionalNumber(maxValue, 'maxValue', validationErrs);
    const parsedMinLength = parseOptionalNumber(minLength, 'minLength', validationErrs);
    const parsedMaxLength = parseOptionalNumber(maxLength, 'maxLength', validationErrs);
    const parsedKpiId = parseOptionalNumber(kpiId, 'kpiId', validationErrs);

    if (Object.keys(validationErrs).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrs }));
      return;
    }

    const data: AddFieldRequest = {
      fieldKey: fieldKey.trim().toUpperCase(),
      labelEn: labelEn.trim(),
      labelAr: labelAr.trim(),
      dataTypeId: Number(dataTypeId),
      controlTypeId: Number(controlTypeId),
      displayOrder: Number(displayOrder.trim()),
      isRequired: controlReq?.forceOptional ? false : isRequired,
      isReadOnly: controlReq?.forceReadOnly ? true : isReadOnly,
      isVisible,
    };

    if (parsedMinValue !== undefined) {
      data.minValue = parsedMinValue;
    }
    if (parsedMaxValue !== undefined) {
      data.maxValue = parsedMaxValue;
    }
    if (parsedMinLength !== undefined) {
      data.minLength = parsedMinLength;
    }
    if (parsedMaxLength !== undefined) {
      data.maxLength = parsedMaxLength;
    }

    if (controlReq?.showRegexValidation) {
      const parsedRegex = parseOptionalString(regexPattern);
      if (parsedRegex !== undefined) {
        data.regexPattern = parsedRegex;
      }
    }
    const parsedPlaceholderEn = parseOptionalString(placeholderEn);
    if (parsedPlaceholderEn !== undefined) {
      data.placeholderEn = parsedPlaceholderEn;
    }
    const parsedPlaceholderAr = parseOptionalString(placeholderAr);
    if (parsedPlaceholderAr !== undefined) {
      data.placeholderAr = parsedPlaceholderAr;
    }
    const parsedDefaultValue = parseOptionalString(defaultValue);
    if (parsedDefaultValue !== undefined) {
      data.defaultValue = parsedDefaultValue;
    }
    const parsedHelpTextEn = parseOptionalString(helpTextEn);
    if (parsedHelpTextEn !== undefined) {
      data.helpTextEn = parsedHelpTextEn;
    }
    const parsedHelpTextAr = parseOptionalString(helpTextAr);
    if (parsedHelpTextAr !== undefined) {
      data.helpTextAr = parsedHelpTextAr;
    }
    const parsedValidationMessageEn = parseOptionalString(validationMessageEn);
    if (parsedValidationMessageEn !== undefined) {
      data.validationMessageEn = parsedValidationMessageEn;
    }
    const parsedValidationMessageAr = parseOptionalString(validationMessageAr);
    if (parsedValidationMessageAr !== undefined) {
      data.validationMessageAr = parsedValidationMessageAr;
    }
    if (lookupTypeId !== '') {
      data.lookupTypeId = Number(lookupTypeId);
    } else if (lookupRequired) {
      return;
    }
    if (parsedKpiId !== undefined) {
      data.kpiId = parsedKpiId;
    }
    if (frequencyId !== '') {
      data.frequencyId = Number(frequencyId);
      const selectedFrequency = frequencies.find((item) => item.frequencyId === Number(frequencyId));
      if (frequencySupportsCustomPeriodStart(selectedFrequency)) {
        data.periodStartDate = periodStartDate.trim().length > 0 ? periodStartDate : null;
      }
    }

    try {
      const createdField = await addField.mutateAsync({ formId, data });

      if (isCalculatedControl) {
        await setCalculation.mutateAsync({
          formId,
          fieldId: createdField.fieldId,
          data: buildSetCalculationRequest(calculationConfig),
        });
      }

      onClose();
    } catch {
      setSubmitError('Unable to create field. Please review the form and try again.');
    }
  };

  const handleControlTypeChange = (nextControlTypeId: number | ''): void => {
    setControlTypeId(nextControlTypeId);
    clearError('controlTypeId');
    clearError('lookupTypeId');

    const nextRequirements = getControlRequirements(nextControlTypeId, controlTypes);

    if (nextRequirements === null) {
      setIsReadOnly(false);
      return;
    }

    const suggestedDataTypeId = resolveSuggestedDataTypeId(nextRequirements, dataTypes);
    if (suggestedDataTypeId !== '') {
      setDataTypeId(suggestedDataTypeId);
    }

    if (nextRequirements.forceReadOnly) {
      setIsReadOnly(true);
    } else {
      setIsReadOnly(false);
    }

    if (nextRequirements.forceOptional) {
      setIsRequired(false);
    }

    if (!nextRequirements.requiresLookup) {
      setLookupTypeId('');
    }

    if (nextRequirements.requiresCalculation) {
      setCalculationConfig(createDefaultCalculationConfig(dataTypes, controlTypes));
    }
  };

  const isSubmitting = addField.isPending || setCalculation.isPending;

  const textFieldSx = { borderRadius: '12px', fontWeight: 600 };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
          Add New Field
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, maxHeight: '70vh' }}>
        <Box component="form" id="add-field-form" onSubmit={handleSubmit} noValidate sx={{ py: 1 }}>
          <Stack spacing={3}>
            <FieldSection title="Basic Information">
              <TextField
                label="Field Identifier (Key)"
                value={fieldKey}
                onChange={(e) => { setFieldKey(e.target.value); clearError('fieldKey'); }}
                error={Boolean(errors.fieldKey)}
                helperText={errors.fieldKey ?? 'Unique key within this form (e.g. TOTAL_AMOUNT).'}
                fullWidth
                size="small"
                required
                InputProps={{ sx: textFieldSx }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Label (EN)"
                  value={labelEn}
                  onChange={(e) => { setLabelEn(e.target.value); clearError('labelEn'); }}
                  error={Boolean(errors.labelEn)}
                  helperText={errors.labelEn}
                  fullWidth
                  size="small"
                  required
                  InputProps={{ sx: textFieldSx }}
                />
                <TextField
                  label="Label (AR)"
                  value={labelAr}
                  onChange={(e) => { setLabelAr(e.target.value); clearError('labelAr'); }}
                  error={Boolean(errors.labelAr)}
                  helperText={errors.labelAr}
                  fullWidth
                  size="small"
                  required
                  inputProps={{ dir: 'rtl' }}
                  InputProps={{ sx: textFieldSx }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl size="small" fullWidth required error={Boolean(errors.dataTypeId)}>
                  <InputLabel>Data Type</InputLabel>
                  <Select
                    value={dataTypeId}
                    label="Data Type"
                    onChange={(e) => { setDataTypeId(e.target.value as number | ''); clearError('dataTypeId'); }}
                    disabled={controlReq?.lockDataType ?? false}
                    sx={{ borderRadius: '12px' }}
                  >
                    {dataTypes.map((dt) => (
                      <MenuItem key={dt.dataTypeId} value={dt.dataTypeId} sx={{ fontWeight: 600 }}>
                        {dt.typeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth required error={Boolean(errors.controlTypeId)}>
                  <InputLabel>Control Type</InputLabel>
                  <Select
                    value={controlTypeId}
                    label="Control Type"
                    onChange={(e) => handleControlTypeChange(e.target.value as number | '')}
                    sx={{ borderRadius: '12px' }}
                  >
                    {controlTypes.map((ct) => (
                      <MenuItem key={ct.controlTypeId} value={ct.controlTypeId} sx={{ fontWeight: 600 }}>
                        {ct.controlName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              {controlReq !== null && (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(BRAND_ACCENT, 0.06), borderColor: alpha(BRAND_ACCENT, 0.2) }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {controlReq.hint}
                  </Typography>
                </Paper>
              )}
              <TextField
                label="Display Order"
                value={displayOrder}
                onChange={(e) => { setDisplayOrder(e.target.value); clearError('displayOrder'); }}
                error={Boolean(errors.displayOrder)}
                helperText={errors.displayOrder ?? `Defaults to ${currentMaxOrder + 1} (next available position).`}
                fullWidth
                size="small"
                required
                type="number"
                inputProps={{ min: 1 }}
                InputProps={{ sx: textFieldSx }}
              />
            </FieldSection>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <FieldSection title="Behavior">
              <Paper variant="outlined" sx={{ p: 1, px: 2, borderRadius: '12px', bgcolor: 'action.hover', border: 'none' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={controlReq?.forceOptional ? false : isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                        disabled={controlReq?.forceOptional ?? false}
                      />
                    )}
                    label={<Typography variant="body2" fontWeight={700}>Required field</Typography>}
                  />
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={controlReq?.forceReadOnly ? true : isReadOnly}
                        onChange={(e) => setIsReadOnly(e.target.checked)}
                        disabled={controlReq?.forceReadOnly ?? false}
                      />
                    )}
                    label={(
                      <Typography variant="body2" fontWeight={700}>
                        {controlReq?.forceReadOnly ? 'Read only (fixed)' : 'Read only'}
                      </Typography>
                    )}
                  />
                  <FormControlLabel
                    control={<Switch checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />}
                    label={<Typography variant="body2" fontWeight={700}>Visible</Typography>}
                  />
                </Stack>
              </Paper>
            </FieldSection>

            {controlReq?.requiresCalculation && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <FieldSection title="Calculation Setup">
                  <CalculationConfigFields
                    config={calculationConfig}
                    errors={errors}
                    dataTypes={dataTypes}
                    controlTypes={controlTypes}
                    onChange={setCalculationConfig}
                    onClearError={clearError}
                  />
                </FieldSection>
              </>
            )}

            {(controlReq?.requiresLookup || (controlReq?.showAdvancedSection && controlReq.showKpiField)) && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <FieldSection title={lookupRequired ? 'Lookup Configuration' : 'Advanced (Optional)'}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {controlReq.requiresLookup && (
                      <FormControl
                        size="small"
                        fullWidth
                        required={lookupRequired}
                        error={Boolean(errors.lookupTypeId)}
                      >
                        <InputLabel>Lookup Type</InputLabel>
                        <Select
                          value={lookupTypeId}
                          label="Lookup Type"
                          onChange={(e) => {
                            const val = e.target.value as string | number;
                            if (val === '' || val === undefined) {
                              setLookupTypeId('');
                            } else {
                              setLookupTypeId(Number(val));
                            }
                            clearError('lookupTypeId');
                          }}
                          sx={{ borderRadius: '12px' }}
                        >
                          {lookupTypes.map((lt) => (
                            <MenuItem key={lt.lookupTypeId} value={lt.lookupTypeId} sx={{ fontWeight: 600 }}>
                              {lt.nameEn}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.lookupTypeId !== undefined && errors.lookupTypeId !== '' ? (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.lookupTypeId}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                            Required — list options are loaded from this lookup.
                          </Typography>
                        )}
                      </FormControl>
                    )}
                    {controlReq.showKpiField && (
                      <TextField
                        label="KPI ID"
                        value={kpiId}
                        onChange={(e) => { setKpiId(e.target.value); clearError('kpiId'); }}
                        error={Boolean(errors.kpiId)}
                        helperText={errors.kpiId ?? 'Optional — numeric KPI reference'}
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 1 }}
                        InputProps={{ sx: textFieldSx }}
                      />
                    )}
                  </Stack>
                </FieldSection>
              </>
            )}

            {controlReq !== null && controlReq.showValidationSection && (
              <>
            <Divider sx={{ borderStyle: 'dashed' }} />

            <FieldSection title="Validation (Optional)">
              {controlReq.showNumericValidation && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Min Value"
                  value={minValue}
                  onChange={(e) => { setMinValue(e.target.value); clearError('minValue'); clearError('maxValue'); }}
                  error={Boolean(errors.minValue)}
                  helperText={errors.minValue ?? 'Optional'}
                  fullWidth
                  size="small"
                  type="number"
                  InputProps={{ sx: textFieldSx }}
                />
                <TextField
                  label="Max Value"
                  value={maxValue}
                  onChange={(e) => { setMaxValue(e.target.value); clearError('maxValue'); }}
                  error={Boolean(errors.maxValue)}
                  helperText={errors.maxValue ?? 'Optional'}
                  fullWidth
                  size="small"
                  type="number"
                  InputProps={{ sx: textFieldSx }}
                />
              </Stack>
              )}
              {controlReq.showLengthValidation && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Min Length"
                  value={minLength}
                  onChange={(e) => { setMinLength(e.target.value); clearError('minLength'); clearError('maxLength'); }}
                  error={Boolean(errors.minLength)}
                  helperText={errors.minLength ?? 'Optional'}
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  InputProps={{ sx: textFieldSx }}
                />
                <TextField
                  label="Max Length"
                  value={maxLength}
                  onChange={(e) => { setMaxLength(e.target.value); clearError('maxLength'); }}
                  error={Boolean(errors.maxLength)}
                  helperText={errors.maxLength ?? 'Optional'}
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  InputProps={{ sx: textFieldSx }}
                />
              </Stack>
              )}
              {controlReq.showRegexValidation && (
              <RegexPatternSelect
                value={regexPattern}
                onChange={(pattern: string, preset: RegexPatternPreset | null) => {
                  setRegexPattern(pattern);
                  if (preset !== null) {
                    setValidationMessageEn(preset.validationMessageEn);
                    setValidationMessageAr(preset.validationMessageAr);
                  }
                }}
              />
              )}
              {controlReq.showHelpTextInValidation && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Help Text (EN)"
                  value={helpTextEn}
                  onChange={(e) => setHelpTextEn(e.target.value)}
                  helperText="Optional — shown as help for this table"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                <TextField
                  label="Help Text (AR)"
                  value={helpTextAr}
                  onChange={(e) => setHelpTextAr(e.target.value)}
                  helperText="Optional"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  inputProps={{ dir: 'rtl' }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
              </Stack>
              )}
              {controlReq.showValidationMessages && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Validation Message (EN)"
                  value={validationMessageEn}
                  onChange={(e) => setValidationMessageEn(e.target.value)}
                  helperText="Optional — custom error shown when validation fails"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                <TextField
                  label="Validation Message (AR)"
                  value={validationMessageAr}
                  onChange={(e) => setValidationMessageAr(e.target.value)}
                  helperText="Optional"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  inputProps={{ dir: 'rtl' }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
              </Stack>
              )}
            </FieldSection>
              </>
            )}

            {controlReq !== null && controlReq.showContentHelpSection && (
              <>
            <Divider sx={{ borderStyle: 'dashed' }} />

            <FieldSection title={controlReq.controlKey === ControlKeys.Label ? 'Display Text' : 'Content & Help (Optional)'}>
              {controlReq.showPlaceholder && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Placeholder (EN)"
                  value={placeholderEn}
                  onChange={(e) => { setPlaceholderEn(e.target.value); clearError('placeholderEn'); }}
                  error={Boolean(errors.placeholderEn)}
                  helperText={errors.placeholderEn ?? (controlReq.controlKey === ControlKeys.Label ? 'Displayed label text (EN)' : 'Optional')}
                  fullWidth
                  size="small"
                  required={controlReq.controlKey === ControlKeys.Label}
                  InputProps={{ sx: textFieldSx }}
                />
                <TextField
                  label="Placeholder (AR)"
                  value={placeholderAr}
                  onChange={(e) => { setPlaceholderAr(e.target.value); clearError('placeholderAr'); }}
                  error={Boolean(errors.placeholderAr)}
                  helperText={errors.placeholderAr ?? (controlReq.controlKey === ControlKeys.Label ? 'Displayed label text (AR)' : 'Optional')}
                  fullWidth
                  size="small"
                  required={controlReq.controlKey === ControlKeys.Label}
                  inputProps={{ dir: 'rtl' }}
                  InputProps={{ sx: textFieldSx }}
                />
              </Stack>
              )}
              {controlReq.showDefaultValue && (
              <TextField
                label="Default Value"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                helperText="Optional"
                fullWidth
                size="small"
                InputProps={{ sx: textFieldSx }}
              />
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Help Text (EN)"
                  value={helpTextEn}
                  onChange={(e) => setHelpTextEn(e.target.value)}
                  helperText="Optional"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
                <TextField
                  label="Help Text (AR)"
                  value={helpTextAr}
                  onChange={(e) => setHelpTextAr(e.target.value)}
                  helperText="Optional"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  inputProps={{ dir: 'rtl' }}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
              </Stack>
            </FieldSection>
              </>
            )}

            {controlReq !== null && !controlReq.requiresCalculation && !controlReq.showValidationSection && !controlReq.showContentHelpSection && !controlReq.requiresLookup && controlReq.showAdvancedSection && (
              <>
            <Divider sx={{ borderStyle: 'dashed' }} />

            <FieldSection title="Advanced (Optional)">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="KPI ID"
                  value={kpiId}
                  onChange={(e) => { setKpiId(e.target.value); clearError('kpiId'); }}
                  error={Boolean(errors.kpiId)}
                  helperText={errors.kpiId ?? 'Optional — numeric KPI reference'}
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{ min: 1 }}
                  InputProps={{ sx: textFieldSx }}
                />
              </Stack>
            </FieldSection>
              </>
            )}

            {controlReq !== null && controlReq.showKpiField && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <FieldSection title="Reporting Frequency (Optional)">
                  <FormControl size="small" fullWidth>
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
                      }}
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="" sx={{ fontWeight: 600 }}>
                        Inherit form frequency
                      </MenuItem>
                      {frequencies.map((item) => (
                        <MenuItem key={item.frequencyId} value={item.frequencyId} sx={{ fontWeight: 600 }}>
                          {item.nameEn}
                          {item.hasDiscretePeriods ? ' · discrete periods' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                      {inheritedFrequencyName !== null
                        ? `Leave empty to inherit “${inheritedFrequencyName}”. Override only when this KPI uses a different cadence.`
                        : 'Leave empty to inherit the form frequency (default).'}
                    </Typography>
                  </FormControl>
                  {frequencySupportsCustomPeriodStart(
                    frequencies.find((item) => item.frequencyId === frequencyId),
                  ) && (
                    <TextField
                      label="Period start date"
                      type="date"
                      value={periodStartDate}
                      onChange={(e) => setPeriodStartDate(e.target.value)}
                      helperText="Only month + day repeat each year (e.g. 1 February). Leave empty for 1 January."
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ sx: textFieldSx }}
                    />
                  )}
                </FieldSection>
              </>
            )}

            {submitError !== '' && (
              <Typography variant="body2" color="error" fontWeight={600}>
                {submitError}
              </Typography>
            )}
          </Stack>
        </Box>
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
          form="add-field-form"
          variant="contained"
          disableElevation
          disabled={isSubmitting}
          sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 4 }}
        >
          {isSubmitting ? 'Working...' : 'Create Field'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Set Calculation Dialog ───────────────────────────────────────────────────

interface SetCalculationDialogProps {
  formId: number;
  field: AdminFormField;
  onClose: () => void;
}

const fieldCalculationToDraft = (
  field: AdminFormField,
  dataTypes: DataType[],
  controlTypes: ControlType[],
): CalculationConfigDraft => {
  const calculation = field.formFieldCalculations;
  if (calculation === null) {
    return createDefaultCalculationConfig(dataTypes, controlTypes);
  }

  return {
    formulaExpression: calculation.formulaExpression,
    resultColumnKey: calculation.resultColumnKey,
    resultLabelEn: calculation.resultLabelEn,
    resultLabelAr: calculation.resultLabelAr,
    resultPrecision: String(calculation.resultPrecision),
    resultDataTypeId: calculation.resultDataTypeId,
    resultControlTypeId: calculation.resultControlTypeId,
    buttonLabelEn: calculation.buttonLabelEn,
    buttonLabelAr: calculation.buttonLabelAr,
    displayFormulaEn: calculation.displayFormulaEn ?? '',
    displayFormulaAr: calculation.displayFormulaAr ?? '',
    helpTextEn: calculation.helpTextEn ?? '',
    helpTextAr: calculation.helpTextAr ?? '',
    inputs: calculation.formFieldCalculationInputs.map((input) => ({
      clientId: `input-${input.inputId}`,
      inputToken: input.inputToken,
      columnKey: input.columnKey,
      labelEn: input.labelEn,
      labelAr: input.labelAr,
      dataTypeId: input.dataTypeId,
      controlTypeId: input.controlTypeId,
      isRequired: input.isRequired,
    })),
  };
};

const SetCalculationDialog: React.FC<SetCalculationDialogProps> = ({ formId, field, onClose }) => {
  const { data: rawControlTypes } = useAdminControlTypes();
  const { data: rawDataTypes } = useAdminDataTypes();
  const controlTypes = Array.isArray(rawControlTypes) ? rawControlTypes : [];
  const dataTypes = Array.isArray(rawDataTypes) ? rawDataTypes : [];
  const setCalculation = useSetCalculation();

  const [config, setConfig] = useState<CalculationConfigDraft>(() =>
    fieldCalculationToDraft(field, dataTypes, controlTypes),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const clearError = (fieldName: string): void => {
    setErrors((prev) => {
      if (prev[fieldName] === undefined || prev[fieldName] === '') {
        return prev;
      }
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validateCalculationConfig(config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await setCalculation.mutateAsync({
        formId,
        fieldId: field.fieldId,
        data: buildSetCalculationRequest(config),
      });
      onClose();
    } catch {
      setSubmitError('Unable to save calculation. Please review the form and try again.');
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
          Configure Calculation
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, maxHeight: '70vh' }}>
        <Box component="form" id="set-calculation-form" onSubmit={handleSubmit} noValidate sx={{ py: 1 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Field: {field.labelEn} ({field.fieldKey})
            </Typography>
            <CalculationConfigFields
              config={config}
              errors={errors}
              dataTypes={dataTypes}
              controlTypes={controlTypes}
              onChange={setConfig}
              onClearError={clearError}
            />
            {submitError !== '' && (
              <Typography variant="body2" color="error" fontWeight={600}>
                {submitError}
              </Typography>
            )}
          </Stack>
        </Box>
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
          form="set-calculation-form"
          variant="contained"
          disableElevation
          disabled={setCalculation.isPending}
          sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 4 }}
        >
          {setCalculation.isPending ? 'Saving...' : 'Save Calculation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Field Card ───────────────────────────────────────────────────────────────

interface FieldCardProps {
  formId: number;
  field: AdminFormField;
}

const FieldCard: React.FC<FieldCardProps> = ({ formId, field }) => {
  const theme = useTheme();
  const { data: rawControlTypes } = useAdminControlTypes();
  const { data: rawLookupTypes } = useAdminLookupTypes();
  const controlTypes = Array.isArray(rawControlTypes) ? rawControlTypes : [];
  const lookupTypes = Array.isArray(rawLookupTypes) ? rawLookupTypes : [];
  const fieldRequirements = getControlRequirements(field.controlTypeId, controlTypes);
  const calculation = field.formFieldCalculations;
  const removeField = useRemoveField();
  const [confirmRemoveFieldOpen, setConfirmRemoveFieldOpen] = useState(false);
  const [editFieldOpen, setEditFieldOpen] = useState(false);
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [frequencyDialogOpen, setFrequencyDialogOpen] = useState(false);

  const handleRemoveField = (): void => {
    removeField.mutate({ formId, fieldId: field.fieldId }, {
      onSuccess: () => setConfirmRemoveFieldOpen(false),
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.08),
        borderRadius: '20px',
        overflow: 'hidden',
        mb: 2.5,
        bgcolor: '#fff',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(BRAND_ACCENT, 0.3),
          boxShadow: `0 8px 24px ${alpha(BRAND_NAVY, 0.05)}`,
        }
      }}
    >
      {/* Field header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          bgcolor: alpha(theme.palette.divider, 0.02),
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.05),
        }}
      >
        <DragIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
              {field.labelEn}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                bgcolor: alpha(BRAND_NAVY, 0.05),
                color: BRAND_NAVY,
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: 10,
              }}
            >
              {field.fieldKey}
            </Typography>
            {field.isRequired && (
              <Chip label="Required" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 900, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark', border: 'none' }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ direction: 'rtl', display: 'block', fontWeight: 600 }}>
            {field.labelAr}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} alignItems="center">
          <Chip
            label={`Order: ${field.displayOrder}`}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 10, fontWeight: 700, color: 'text.disabled', borderColor: 'divider' }}
          />
          <IconButton
            size="small"
            onClick={() => setEditFieldOpen(true)}
            sx={{ color: BRAND_ACCENT, '&:hover': { bgcolor: alpha(BRAND_ACCENT, 0.1) } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setConfirmRemoveFieldOpen(true)} sx={{ color: 'error.light', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Details section */}
      <Box sx={{ p: 3 }}>
        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DependenciesIcon fontSize="inherit" />
          Logic & Validation
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
            <Typography variant="caption" fontWeight={700}>Type:</Typography>
            <Typography variant="caption" fontWeight={800} color="text.primary">
              {formatControlTypeLabel(field.controlTypeId, controlTypes)}
            </Typography>
          </Box>
          {fieldRequirements?.showKpiField === true && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={700}>Frequency:</Typography>
              <Typography
                variant="caption"
                fontWeight={800}
                color={field.frequency !== null ? 'text.primary' : 'text.disabled'}
              >
                {field.frequency !== null ? field.frequency.nameEn : 'Not assigned'}
                {field.periodStartDate !== null && field.periodStartDate.length > 0
                  ? ` · start ${toDateInputValue(field.periodStartDate)}`
                  : ''}
              </Typography>
            </Box>
          )}
          {fieldRequirements?.requiresLookup && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={700}>Lookup:</Typography>
              <Typography
                variant="caption"
                fontWeight={800}
                color={field.lookupTypeId !== null ? 'text.primary' : 'error.main'}
              >
                {field.lookupTypeId !== null
                  ? formatLookupTypeLabel(field.lookupTypeId, lookupTypes)
                  : 'Not assigned'}
              </Typography>
            </Box>
          )}
          {fieldRequirements?.requiresCalculation && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" fontWeight={700}>Formula:</Typography>
                <Typography variant="caption" fontWeight={800} color={calculation !== null ? 'text.primary' : 'error.main'}>
                  {calculation !== null ? calculation.formulaExpression : 'Not configured'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" fontWeight={700}>Result:</Typography>
                <Typography variant="caption" fontWeight={800} color={calculation !== null ? 'text.primary' : 'text.disabled'}>
                  {calculation !== null ? calculation.resultLabelEn : '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" fontWeight={700}>Inputs:</Typography>
                <Typography variant="caption" fontWeight={800} color={calculation !== null ? 'text.primary' : 'text.disabled'}>
                  {calculation !== null ? calculation.formFieldCalculationInputs.length : 0}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setCalculationDialogOpen(true)}
                sx={{ mt: 0.5, borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
              >
                {calculation !== null ? 'Edit Calculation' : 'Configure Calculation'}
              </Button>
            </>
          )}
          {fieldRequirements?.requiresTableColumns && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" fontWeight={700}>Columns:</Typography>
                <Typography variant="caption" fontWeight={800} color={field.formFieldColumns.length > 0 ? 'text.primary' : 'warning.main'}>
                  {field.formFieldColumns.length}
                </Typography>
              </Box>
              {fieldRequirements.requiresTableRows && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
                  <Typography variant="caption" fontWeight={700}>Rows:</Typography>
                  <Typography variant="caption" fontWeight={800} color={field.formFieldRows.length > 0 ? 'text.primary' : 'warning.main'}>
                    {field.formFieldRows.length}
                  </Typography>
                </Box>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setTableDialogOpen(true)}
                sx={{ mt: 0.5, borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
              >
                {fieldRequirements.requiresTableRows ? 'Configure Grid' : 'Configure Columns'}
              </Button>
            </>
          )}
          {fieldRequirements?.controlKey === ControlKeys.Label && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
              <Typography variant="caption" fontWeight={700}>Display:</Typography>
              <Typography variant="caption" fontWeight={800} color="text.primary">
                {field.placeholderEn ?? '—'}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}>
            <Typography variant="caption" fontWeight={700}>Rules:</Typography>
            <Typography variant="caption" fontWeight={800} color={field.fieldDependencies.length > 0 ? BRAND_ACCENT : 'text.disabled'}>
              {field.fieldDependencies.length} Rules Active
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditFieldOpen(true)}
            sx={{ mt: 0.5, borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
          >
            Edit Field
          </Button>
          {fieldRequirements?.showKpiField === true && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setFrequencyDialogOpen(true)}
              sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
            >
              {field.frequency !== null ? 'Manage Frequency' : 'Assign Frequency'}
            </Button>
          )}
        </Stack>
      </Box>

      {editFieldOpen && (
        <EditFieldDialog
          formId={formId}
          field={field}
          onClose={() => setEditFieldOpen(false)}
        />
      )}

      {tableDialogOpen && (
        <ManageTableStructureDialog
          formId={formId}
          field={field}
          onClose={() => setTableDialogOpen(false)}
        />
      )}

      {frequencyDialogOpen && (
        <ManageFieldFrequencyDialog
          formId={formId}
          field={field}
          onClose={() => setFrequencyDialogOpen(false)}
        />
      )}

      {calculationDialogOpen && (
        <SetCalculationDialog
          formId={formId}
          field={field}
          onClose={() => setCalculationDialogOpen(false)}
        />
      )}

      {/* Confirm remove field dialog */}
      <Dialog
        open={confirmRemoveFieldOpen}
        onClose={() => setConfirmRemoveFieldOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight={800} color="error.main">Delete Field?</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Permanently remove "{field.labelEn}" from this form? Data associated with this field may be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmRemoveFieldOpen(false)} variant="contained" color="inherit" sx={{ borderRadius: '12px', bgcolor: 'action.hover', fontWeight: 700 }}>Cancel</Button>
          <Button
            onClick={handleRemoveField}
            variant="contained"
            disableElevation
            color="error"
            disabled={removeField.isPending}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 4 }}
          >
            {removeField.isPending ? '...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// ─── FormDetail page ──────────────────────────────────────────────────────────

const FormDetail: React.FC = () => {
  const { formId: formIdParam } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const formId = formIdParam !== undefined ? parseInt(formIdParam, 10) : 0;
  const { data: form, isLoading, isError, refetch, isFetching } = useAdminFormDetail(formId);

  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  if (isLoading) {
    return (
      <AdminLayout title="Form Builder">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 20, gap: 2 }}>
          <CircularProgress thickness={5} />
          <Typography variant="body2" color="text.secondary" fontWeight={700}>Loading architecture...</Typography>
        </Box>
      </AdminLayout>
    );
  }

  if (isError || form === undefined) {
    return (
      <AdminLayout title="Form Builder">
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mx: 'auto', mb: 2 }}>!</Avatar>
          <Typography fontWeight={700}>Unable to load form structure</Typography>
          <Button onClick={() => void refetch()} variant="text" sx={{ mt: 1 }}>Retry</Button>
        </Box>
      </AdminLayout>
    );
  }

  const fields = form.formFields ?? [];
  const filteredFields = isActiveFilter === undefined
    ? fields
    : fields.filter((field) => field.isActive === isActiveFilter);

  const maxFieldOrder = fields.length > 0
    ? Math.max(...fields.map((f) => f.displayOrder))
    : 0;

  return (
    <AdminLayout title={form.nameEn}>
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
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Stack direction="row" alignItems="center" gap={3}>
            <IconButton
              onClick={() => navigate('/admin/forms')}
              sx={{ bgcolor: 'action.hover', borderRadius: '12px' }}
            >
              <BackIcon />
            </IconButton>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 0.5 }}>
                <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ letterSpacing: -0.5 }}>
                  {form.nameEn}
                </Typography>
                <Chip
                  label={form.formKey}
                  size="small"
                  sx={{ bgcolor: alpha(BRAND_NAVY, 0.05), color: BRAND_NAVY, fontWeight: 800, borderRadius: '6px', fontSize: 10 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ direction: 'rtl', display: 'block' }}>
                {form.nameAr}
              </Typography>
            </Box>

            <Stack direction="row" gap={1.5}>
              <IconButton
                onClick={() => void refetch()}
                disabled={isFetching}
                sx={{ bgcolor: 'action.hover', borderRadius: '12px' }}
              >
                {isFetching ? <CircularProgress size={20} thickness={6} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddIcon />}
                onClick={() => setAddFieldOpen(true)}
                sx={{ borderRadius: '12px', fontWeight: 700, px: 3, textTransform: 'none' }}
              >
                Add Field
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, px: 1 }} flexWrap="wrap" gap={2}>
              <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
                Form Canvas
              </Typography>
              <Stack direction="row" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIsActiveFilter(val === '' ? undefined : val === 'true');
                    }}
                    displayEmpty
                    startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                    sx={{ borderRadius: '12px', bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                  >
                    <MenuItem value="" sx={{ fontWeight: 600 }}>All Status</MenuItem>
                    <MenuItem value="true" sx={{ fontWeight: 600 }}>Active Only</MenuItem>
                    <MenuItem value="false" sx={{ fontWeight: 600 }}>Inactive Only</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  {isActiveFilter === undefined
                    ? `${fields.length} TOTAL ELEMENTS`
                    : `${filteredFields.length} OF ${fields.length} ELEMENTS`}
                </Typography>
              </Stack>
            </Stack>

            {fields.length === 0 ? (
              <Box
                sx={{
                  p: 10,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: '32px',
                  bgcolor: alpha(theme.palette.divider, 0.02)
                }}
              >
                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.divider, 0.1), color: 'text.disabled', mx: 'auto', mb: 3 }}>
                  <FormIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={800} color="text.secondary" gutterBottom>
                  Empty Canvas
                </Typography>
                <Typography variant="body2" color="text.disabled" fontWeight={600} sx={{ mb: 4 }}>
                  Start building your form by adding the first field element.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddFieldOpen(true)}
                  sx={{ borderRadius: '12px', fontWeight: 700, px: 4, borderColor: BRAND_ACCENT, color: BRAND_ACCENT }}
                >
                  Add First Field
                </Button>
              </Box>
            ) : filteredFields.length === 0 ? (
              <Box
                sx={{
                  p: 8,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: '32px',
                  bgcolor: alpha(theme.palette.divider, 0.02),
                }}
              >
                <Typography variant="h6" fontWeight={800} color="text.secondary" gutterBottom>
                  No Matching Fields
                </Typography>
                <Typography variant="body2" color="text.disabled" fontWeight={600}>
                  No fields match the selected status filter.
                </Typography>
              </Box>
            ) : (
              <Box>
                {[...filteredFields]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field) => (
                    <FieldCard key={field.fieldId} formId={form.formId} field={field} />
                  ))}
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Form Properties Sidebar */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.08),
                  bgcolor: '#fff',
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon fontSize="small" sx={{ color: BRAND_NAVY }} />
                  Properties
                </Typography>

                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>STATUS</Typography>
                    <Chip
                      label={form.isActive ? 'PUBLISHED & ACTIVE' : 'DRAFT / INACTIVE'}
                      size="small"
                      sx={{
                        width: '100%',
                        height: 32,
                        borderRadius: '8px',
                        fontWeight: 900,
                        fontSize: 10,
                        bgcolor: form.isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.divider, 0.1),
                        color: form.isActive ? 'success.main' : 'text.disabled',
                        border: 'none'
                      }}
                    />
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1 }}>VERSION HISTORY</Typography>
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '12px' }}>
                      <VersionIcon sx={{ color: BRAND_NAVY }} />
                      <Box>
                        <Typography variant="body2" fontWeight={800}>v{form.version}.0</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Updated: {new Date(form.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1 }}>DESCRIPTION</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.6 }}>
                      {form.descriptionEn || 'No description provided for this form structure.'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Box sx={{ p: 3, borderRadius: '24px', bgcolor: alpha(BRAND_NAVY, 0.03), border: '1px dashed', borderColor: alpha(BRAND_NAVY, 0.1) }}>
                <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ display: 'block', textAlign: 'center' }}>
                  CHANGES ARE SAVED AUTOMATICALLY
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Add field dialog */}
      {addFieldOpen && (
        <AddFieldDialog
          formId={form.formId}
          currentMaxOrder={maxFieldOrder}
          inheritedFrequencyName={form.frequency?.nameEn ?? null}
          onClose={() => setAddFieldOpen(false)}
        />
      )}
    </AdminLayout>
  );
};

export default FormDetail;
