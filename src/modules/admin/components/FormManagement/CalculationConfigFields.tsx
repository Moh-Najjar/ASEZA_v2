import React from 'react';
import {
  Box,
  Button,
  Divider,
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
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { BRAND_ACCENT, BRAND_NAVY } from '../../../../core/constants/theme';
import type { ControlType, DataType } from '../../../../core/types/admin/adminLookups';
import type { CalculationConfigDraft, CalculationInputDraft } from './calculationConfig.utils';
import { createCalculationInputDraft } from './calculationConfig.utils';

interface CalculationConfigFieldsProps {
  config: CalculationConfigDraft;
  errors: Record<string, string>;
  dataTypes: DataType[];
  controlTypes: ControlType[];
  onChange: (nextConfig: CalculationConfigDraft) => void;
  onClearError: (field: string) => void;
}

const textFieldSx = { borderRadius: '12px', fontWeight: 600 };

const CalculationConfigFields: React.FC<CalculationConfigFieldsProps> = ({
  config,
  errors,
  dataTypes,
  controlTypes,
  onChange,
  onClearError,
}) => {
  const theme = useTheme();

  const updateConfig = (partial: Partial<CalculationConfigDraft>): void => {
    onChange({ ...config, ...partial });
  };

  const updateInput = (clientId: string, partial: Partial<CalculationInputDraft>): void => {
    updateConfig({
      inputs: config.inputs.map((input) =>
        input.clientId === clientId ? { ...input, ...partial } : input,
      ),
    });
  };

  const addInput = (): void => {
    const nextIndex = config.inputs.length;
    const nextToken = String.fromCharCode(65 + nextIndex);
    const defaultDataTypeId = config.resultDataTypeId;
    const defaultControlTypeId = config.resultControlTypeId;

    updateConfig({
      inputs: [
        ...config.inputs,
        createCalculationInputDraft(
          nextToken,
          `VALUE_${nextToken}`,
          `Value ${nextToken}`,
          `القيمة ${nextToken}`,
          defaultDataTypeId,
          defaultControlTypeId,
          `input-${Date.now()}-${nextIndex}`,
        ),
      ],
    });
  };

  const removeInput = (clientId: string): void => {
    if (config.inputs.length <= 1) {
      return;
    }
    updateConfig({
      inputs: config.inputs.filter((input) => input.clientId !== clientId),
    });
  };

  return (
    <Stack spacing={2.5}>
      <TextField
        label="Formula Expression"
        value={config.formulaExpression}
        onChange={(e) => {
          updateConfig({ formulaExpression: e.target.value });
          onClearError('formulaExpression');
        }}
        error={Boolean(errors.formulaExpression)}
        helperText={errors.formulaExpression ?? 'Use input tokens, e.g. A / B or A * B'}
        fullWidth
        size="small"
        required
        InputProps={{ sx: textFieldSx }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Display Formula (EN)"
          value={config.displayFormulaEn}
          onChange={(e) => updateConfig({ displayFormulaEn: e.target.value })}
          helperText="Optional — shown to users"
          fullWidth
          size="small"
          InputProps={{ sx: textFieldSx }}
        />
        <TextField
          label="Display Formula (AR)"
          value={config.displayFormulaAr}
          onChange={(e) => updateConfig({ displayFormulaAr: e.target.value })}
          helperText="Optional"
          fullWidth
          size="small"
          inputProps={{ dir: 'rtl' }}
          InputProps={{ sx: textFieldSx }}
        />
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        Result Output
      </Typography>

      <TextField
        label="Result Column Key"
        value={config.resultColumnKey}
        onChange={(e) => {
          updateConfig({ resultColumnKey: e.target.value });
          onClearError('resultColumnKey');
        }}
        error={Boolean(errors.resultColumnKey)}
        helperText={errors.resultColumnKey ?? 'Internal key for the computed result, e.g. RESULT'}
        fullWidth
        size="small"
        required
        InputProps={{ sx: textFieldSx }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Result Label (EN)"
          value={config.resultLabelEn}
          onChange={(e) => {
            updateConfig({ resultLabelEn: e.target.value });
            onClearError('resultLabelEn');
          }}
          error={Boolean(errors.resultLabelEn)}
          helperText={errors.resultLabelEn}
          fullWidth
          size="small"
          required
          InputProps={{ sx: textFieldSx }}
        />
        <TextField
          label="Result Label (AR)"
          value={config.resultLabelAr}
          onChange={(e) => {
            updateConfig({ resultLabelAr: e.target.value });
            onClearError('resultLabelAr');
          }}
          error={Boolean(errors.resultLabelAr)}
          helperText={errors.resultLabelAr}
          fullWidth
          size="small"
          required
          inputProps={{ dir: 'rtl' }}
          InputProps={{ sx: textFieldSx }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" fullWidth required error={Boolean(errors.resultDataTypeId)}>
          <InputLabel>Result Data Type</InputLabel>
          <Select
            value={config.resultDataTypeId}
            label="Result Data Type"
            onChange={(e) => {
              updateConfig({ resultDataTypeId: e.target.value as number | '' });
              onClearError('resultDataTypeId');
            }}
            sx={{ borderRadius: '12px' }}
          >
            {dataTypes.map((dataType) => (
              <MenuItem key={dataType.dataTypeId} value={dataType.dataTypeId} sx={{ fontWeight: 600 }}>
                {dataType.typeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth required error={Boolean(errors.resultControlTypeId)}>
          <InputLabel>Result Control Type</InputLabel>
          <Select
            value={config.resultControlTypeId}
            label="Result Control Type"
            onChange={(e) => {
              updateConfig({ resultControlTypeId: e.target.value as number | '' });
              onClearError('resultControlTypeId');
            }}
            sx={{ borderRadius: '12px' }}
          >
            {controlTypes.map((controlType) => (
              <MenuItem key={controlType.controlTypeId} value={controlType.controlTypeId} sx={{ fontWeight: 600 }}>
                {controlType.controlName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Result Precision"
          value={config.resultPrecision}
          onChange={(e) => {
            updateConfig({ resultPrecision: e.target.value });
            onClearError('resultPrecision');
          }}
          error={Boolean(errors.resultPrecision)}
          helperText={errors.resultPrecision ?? 'Decimal places'}
          fullWidth
          size="small"
          required
          type="number"
          inputProps={{ min: 0 }}
          InputProps={{ sx: textFieldSx }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Calculate Button (EN)"
          value={config.buttonLabelEn}
          onChange={(e) => {
            updateConfig({ buttonLabelEn: e.target.value });
            onClearError('buttonLabelEn');
          }}
          error={Boolean(errors.buttonLabelEn)}
          helperText={errors.buttonLabelEn}
          fullWidth
          size="small"
          required
          InputProps={{ sx: textFieldSx }}
        />
        <TextField
          label="Calculate Button (AR)"
          value={config.buttonLabelAr}
          onChange={(e) => {
            updateConfig({ buttonLabelAr: e.target.value });
            onClearError('buttonLabelAr');
          }}
          error={Boolean(errors.buttonLabelAr)}
          helperText={errors.buttonLabelAr}
          fullWidth
          size="small"
          required
          inputProps={{ dir: 'rtl' }}
          InputProps={{ sx: textFieldSx }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Calculation Help (EN)"
          value={config.helpTextEn}
          onChange={(e) => updateConfig({ helpTextEn: e.target.value })}
          helperText="Optional"
          fullWidth
          size="small"
          multiline
          rows={2}
          InputProps={{ sx: { borderRadius: '12px' } }}
        />
        <TextField
          label="Calculation Help (AR)"
          value={config.helpTextAr}
          onChange={(e) => updateConfig({ helpTextAr: e.target.value })}
          helperText="Optional"
          fullWidth
          size="small"
          multiline
          rows={2}
          inputProps={{ dir: 'rtl' }}
          InputProps={{ sx: { borderRadius: '12px' } }}
        />
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Formula Inputs ({config.inputs.length})
        </Typography>
        <Button
          size="small"
          variant="text"
          startIcon={<AddIcon />}
          onClick={addInput}
          sx={{ fontSize: 11, fontWeight: 800, color: BRAND_ACCENT }}
        >
          Add Input
        </Button>
      </Stack>

      {errors.calculationInputs !== undefined && errors.calculationInputs !== '' && (
        <Typography variant="caption" color="error">
          {errors.calculationInputs}
        </Typography>
      )}

      <Stack spacing={1.5}>
        {config.inputs.map((input, index) => {
          const errorPrefix = `calculationInputs.${index}`;
          return (
            <Paper
              key={input.clientId}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.12),
                bgcolor: alpha(BRAND_NAVY, 0.02),
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary">
                  Input #{index + 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeInput(input.clientId)}
                  disabled={config.inputs.length <= 1}
                  sx={{ color: 'error.light' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Token"
                    value={input.inputToken}
                    onChange={(e) => {
                      updateInput(input.clientId, { inputToken: e.target.value });
                      onClearError(`${errorPrefix}.inputToken`);
                    }}
                    error={Boolean(errors[`${errorPrefix}.inputToken`])}
                    helperText={errors[`${errorPrefix}.inputToken`] ?? 'Used in formula, e.g. A'}
                    fullWidth
                    size="small"
                    required
                    InputProps={{ sx: textFieldSx }}
                  />
                  <TextField
                    label="Column Key"
                    value={input.columnKey}
                    onChange={(e) => {
                      updateInput(input.clientId, { columnKey: e.target.value });
                      onClearError(`${errorPrefix}.columnKey`);
                    }}
                    error={Boolean(errors[`${errorPrefix}.columnKey`])}
                    helperText={errors[`${errorPrefix}.columnKey`]}
                    fullWidth
                    size="small"
                    required
                    InputProps={{ sx: textFieldSx }}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Label (EN)"
                    value={input.labelEn}
                    onChange={(e) => {
                      updateInput(input.clientId, { labelEn: e.target.value });
                      onClearError(`${errorPrefix}.labelEn`);
                    }}
                    error={Boolean(errors[`${errorPrefix}.labelEn`])}
                    helperText={errors[`${errorPrefix}.labelEn`]}
                    fullWidth
                    size="small"
                    required
                    InputProps={{ sx: textFieldSx }}
                  />
                  <TextField
                    label="Label (AR)"
                    value={input.labelAr}
                    onChange={(e) => {
                      updateInput(input.clientId, { labelAr: e.target.value });
                      onClearError(`${errorPrefix}.labelAr`);
                    }}
                    error={Boolean(errors[`${errorPrefix}.labelAr`])}
                    helperText={errors[`${errorPrefix}.labelAr`]}
                    fullWidth
                    size="small"
                    required
                    inputProps={{ dir: 'rtl' }}
                    InputProps={{ sx: textFieldSx }}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <FormControl size="small" fullWidth required error={Boolean(errors[`${errorPrefix}.dataTypeId`])}>
                    <InputLabel>Data Type</InputLabel>
                    <Select
                      value={input.dataTypeId}
                      label="Data Type"
                      onChange={(e) => {
                        updateInput(input.clientId, { dataTypeId: e.target.value as number | '' });
                        onClearError(`${errorPrefix}.dataTypeId`);
                      }}
                      sx={{ borderRadius: '12px' }}
                    >
                      {dataTypes.map((dataType) => (
                        <MenuItem key={dataType.dataTypeId} value={dataType.dataTypeId} sx={{ fontWeight: 600 }}>
                          {dataType.typeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth required error={Boolean(errors[`${errorPrefix}.controlTypeId`])}>
                    <InputLabel>Control Type</InputLabel>
                    <Select
                      value={input.controlTypeId}
                      label="Control Type"
                      onChange={(e) => {
                        updateInput(input.clientId, { controlTypeId: e.target.value as number | '' });
                        onClearError(`${errorPrefix}.controlTypeId`);
                      }}
                      sx={{ borderRadius: '12px' }}
                    >
                      {controlTypes.map((controlType) => (
                        <MenuItem key={controlType.controlTypeId} value={controlType.controlTypeId} sx={{ fontWeight: 600 }}>
                          {controlType.controlName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ minWidth: 140 }}>
                    <FormControlLabel
                      control={(
                        <Switch
                          checked={input.isRequired}
                          onChange={(e) => updateInput(input.clientId, { isRequired: e.target.checked })}
                          size="small"
                        />
                      )}
                      label={<Typography variant="caption" fontWeight={700}>Required</Typography>}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default CalculationConfigFields;
