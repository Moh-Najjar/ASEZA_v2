import React, { useState } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import { FormField, CalculationInput, CalculationDef } from "../../core/types/FormField";
import { useLocale } from "../../core/hooks/useLocale";
import TextFieldLabel from "./InputFieldLabel";

interface CalculatedFieldProps {
  formField: FormField;
  formMethods: UseFormReturn<Record<string, unknown>>;
  hideLabel?: boolean;
  hideHelperText?: boolean;
  size?: "small" | "medium";
  isGridField?: boolean;
}

/**
 * Evaluates a two-operand arithmetic formula expression.
 * Tokens in the expression are replaced by their numeric values from the map.
 * Supported operators: +, -, *, /
 * Example: "VALUE2 / VALUE1" with { VALUE1: 4, VALUE2: 20 } → 5
 */
const evaluateFormula = (expression: string, tokenValues: Record<string, number>): number => {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 3) {
    throw new Error(`Invalid formula: "${expression}"`);
  }

  const [leftToken, operator, rightToken] = parts;
  const left = tokenValues[leftToken];
  const right = tokenValues[rightToken];

  if (left === undefined) throw new Error(`Unknown token: "${leftToken}"`);
  if (right === undefined) throw new Error(`Unknown token: "${rightToken}"`);

  switch (operator) {
    case "/":
      if (right === 0) throw new Error("division-by-zero");
      return left / right;
    case "*":
      return left * right;
    case "+":
      return left + right;
    case "-":
      return left - right;
    default:
      throw new Error(`Unsupported operator: "${operator}"`);
  }
};

/** Renders a single numeric input for one calculation input slot — placeholder acts as the visible label */
const CalculationInputField: React.FC<{
  parentKey: string;
  input: CalculationInput;
  formMethods: UseFormReturn<Record<string, unknown>>;
  t: (key: string, opts?: Record<string, unknown>) => string;
  loc: (en: string, ar: string) => string;
  size: "small" | "medium";
  /** Called whenever the user edits this input so the stale result can be cleared */
  onClearResult: () => void;
}> = ({ parentKey, input, formMethods, t, loc, size, onClearResult }) => {
  const { control } = formMethods;
  const fieldName = `${parentKey}.${input.columnKey}`;

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue=""
      rules={{
        required: input.isRequired
          ? t("validation.required", { field: loc(input.labelEn, input.labelAr) })
          : undefined,
      }}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          id={fieldName}
          type="number"
          size={size}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          variant="outlined"
          fullWidth
          /** Floating label rendered inside the outlined border notch */
          label={loc(input.labelEn, input.labelAr)}
          onChange={(e) => {
            field.onChange(e.target.value);
            /** Clear the stale result whenever an input value changes */
            onClearResult();
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "background.paper",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.light",
              },
            },
            "& .MuiFormHelperText-root": {
              mx: 0,
              mt: 0.75,
              fontSize: "0.75rem",
            },
          }}
        />
      )}
    />
  );
};

/** Renders the read-only result field — placeholder acts as the visible label */
const CalculationResultField: React.FC<{
  parentKey: string;
  calculation: CalculationDef;
  formMethods: UseFormReturn<Record<string, unknown>>;
  t: (key: string, opts?: Record<string, unknown>) => string;
  loc: (en: string, ar: string) => string;
  size: "small" | "medium";
  isRequired: boolean;
}> = ({ parentKey, calculation, formMethods, t, loc, size, isRequired }) => {
  const { control } = formMethods;
  const fieldName = `${parentKey}.${calculation.resultColumnKey}`;
  const resultLabel = loc(calculation.result.labelEn, calculation.result.labelAr);

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue=""
      rules={{
        required: isRequired ? t("validation.required", { field: resultLabel }) : undefined,
      }}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          id={fieldName}
          type="number"
          size={size}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          variant="outlined"
          fullWidth
          /** Floating label rendered inside the outlined border notch */
          label={loc(calculation.result.labelEn, calculation.result.labelAr)}
          InputProps={{ readOnly: true }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              /** Distinct tinted background indicates a computed, non-editable value */
              backgroundColor: "action.hover",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.light",
              },
            },
            "& .MuiFormHelperText-root": {
              mx: 0,
              mt: 0.75,
              fontSize: "0.75rem",
            },
          }}
        />
      )}
    />
  );
};

/**
 * Renders a CALCULATED_FIELD control.
 *
 * Layout (matches design):
 *   [Outer label]
 *   ┌─ Paper ──────────────────────────────────────────────────────┐
 *   │  [Input 1]   [Input 2]   [Calculate button]  ← same row     │
 *   │  [Result field — full width, gray]                           │
 *   │  caption: displayFormula                                     │
 *   │  caption: helpText                                           │
 *   └──────────────────────────────────────────────────────────────┘
 */
const CalculatedField: React.FC<CalculatedFieldProps> = ({
  formField,
  formMethods,
  hideLabel = false,
  hideHelperText = false,
  size = "medium",
}) => {
  const { loc, t } = useLocale();
  const { getValues, trigger } = formMethods;

  /**
   * RHF cannot infer deep path value types from Record<string, unknown>,
   * so the nested setValue call would produce a 'never' type error.
   * This alias narrows the signature to the concrete types we actually use.
   */
  const setValue = formMethods.setValue as (
    name: string,
    value: string,
    options?: { shouldValidate?: boolean; shouldDirty?: boolean },
  ) => void;

  /** Holds a formula-level error (e.g. division by zero) separate from field validation */
  const [formulaError, setFormulaError] = useState<string | null>(null);

  /** Clears the result field and any formula error when the user edits an input */
  const clearResult = () => {
    setFormulaError(null);
    setValue(`${formField.fieldKey}.${formField.calculation?.resultColumnKey ?? ""}`, "", {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  const { calculation } = formField;

  if (calculation === null || calculation === undefined) {
    return null;
  }

  /** Inputs sorted by their intended display order */
  const sortedInputs = [...calculation.inputs].sort((a, b) => a.displayOrder - b.displayOrder);

  const inputFieldNames = sortedInputs.map(
    (input) => `${formField.fieldKey}.${input.columnKey}`,
  );

  const formulaDisplay = loc(calculation.displayFormulaEn, calculation.displayFormulaAr);
  const helpText = hideHelperText
    ? undefined
    : loc(formField.helpTextEn, formField.helpTextAr) ?? undefined;

  /**
   * Triggers RHF validation on all inputs first.
   * Only proceeds to formula evaluation when all inputs are valid.
   */
  const handleCalculate = async () => {
    setFormulaError(null);

    /** Let RHF show its own required/pattern errors — no manual messages needed */
    const allValid = await (trigger as (names: string[]) => Promise<boolean>)(inputFieldNames);
    if (!allValid) return;

    const tokenValues: Record<string, number> = {};

    for (const input of sortedInputs) {
      const rawValue = getValues(`${formField.fieldKey}.${input.columnKey}`);
      tokenValues[input.inputToken] = Number(rawValue);
    }

    try {
      const rawResult = evaluateFormula(calculation.formulaExpression, tokenValues);
      /** Store as string — consistent with how TextField controls serialise values in RHF */
      const rounded = rawResult.toFixed(calculation.resultPrecision);

      setValue(`${formField.fieldKey}.${calculation.resultColumnKey}`, rounded, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      /** Surface formula-level errors (e.g. division by zero) via the translation layer */
      setFormulaError(msg === "division-by-zero" ? t("validation.divisionByZero") : msg);
    }
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      {!hideLabel && <TextFieldLabel field={formField} />}

      <Paper
        variant="outlined"
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          borderRadius: "8px",
          borderColor: "divider",
        }}
      >
        {/* ── Row: inputs + Calculate button ─────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          {sortedInputs.map((input) => (
            <Box key={input.columnKey} sx={{ flex: 1 }}>
              <CalculationInputField
                parentKey={formField.fieldKey}
                input={input}
                formMethods={formMethods}
                t={t}
                loc={loc}
                size={size}
                onClearResult={clearResult}
              />
            </Box>
          ))}

          {/* Calculate button — vertically aligned with input boxes */}
          <Button
            variant="contained"
            onClick={() => void handleCalculate()}
            startIcon={<CalculateIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              /** Align button top with the input box (account for MUI medium input height) */
              mt: size === "medium" ? "0px" : "0px",
              height: size === "medium" ? 56 : 40,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {loc(calculation.buttonLabelEn, calculation.buttonLabelAr)}
          </Button>
        </Box>

        {/* ── Result field ────────────────────────────────────────────── */}
        <CalculationResultField
          parentKey={formField.fieldKey}
          calculation={calculation}
          formMethods={formMethods}
          t={t}
          loc={loc}
          size={size}
          isRequired={formField.isRequired}
        />

        {/* ── Formula-level error (e.g. division by zero) ─────────────── */}
        {formulaError !== null && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 0.5, fontSize: "0.75rem" }}
          >
            {formulaError}
          </Typography>
        )}

        {/* ── Footer captions: formula description + help text ────────── */}
        {(formulaDisplay || helpText) && (
          <Box sx={{ mt: 1.5 }}>
            {formulaDisplay && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}
              >
                {formulaDisplay}
              </Typography>
            )}

          </Box>
        )}

      </Paper>
      {helpText && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontSize: "0.75rem",
            lineHeight: 2,
          }}
        >
          {helpText}
        </Typography>
      )}
    </Box>
  );
};

export default CalculatedField;
