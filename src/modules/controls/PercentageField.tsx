import { getValidationRules, getLocalizedErrorMessage } from "../../core/utils/validationUtils";
import { UseFormReturn, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import TextFieldLabel from "./InputFieldLabel";
import { FormField } from "../../core/types/FormField";
import { useLocale } from "../../core/hooks/useLocale";
import { Box } from "@mui/material";
import React from "react";

interface PercentageFieldProps {
  formField: FormField;
  formMethods: UseFormReturn<Record<string, unknown>>;
  hideLabel?: boolean;
  hideHelperText?: boolean;
  size?: "small" | "medium";
}

const PERCENTAGE_MIN = 0;
const PERCENTAGE_MAX = 100;

/**
 * Forces a percentage input string into the 0–100 range.
 * Empty input stays empty so the user can clear the field.
 */
const clampPercentageInput = (raw: string): string => {
  if (raw.trim() === "") {
    return "";
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return "";
  }
  if (parsed < PERCENTAGE_MIN) {
    return String(PERCENTAGE_MIN);
  }
  if (parsed > PERCENTAGE_MAX) {
    return String(PERCENTAGE_MAX);
  }
  return raw;
};

/** Normalises a form value (string or number) into a clamped percentage input. */
const toPercentageInputValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return clampPercentageInput(String(value));
};

/** Renders a numeric input control with a "%" suffix for fields with controlKey "PERCENTAGE" */
const PercentageField: React.FC<PercentageFieldProps> = ({
  formField,
  formMethods,
  hideLabel = false,
  hideHelperText = false,
  size = "medium",
}) => {
  const { control } = formMethods;
  const { loc, t } = useLocale();

  /** True when a next-submission date is provided for this KPI field */
  const kpiDateEn = formField.kpiNextSubmissionDateEn ?? "";
  const kpiDateAr = formField.kpiNextSubmissionDateAr ?? "";
  const kpiNextSubmissionDate = loc(kpiDateEn, kpiDateAr);
  const hasNextSubmissionDate = kpiNextSubmissionDate !== null && kpiNextSubmissionDate !== "";

  /** The field is read-only either by its own flag or when a next-submission date is set */
  const isReadOnly = formField.isReadOnly || hasNextSubmissionDate;

  return (
    <Controller
      name={formField.fieldKey}
      control={control}
      defaultValue=""
      rules={getValidationRules(formField, loc, t)}
      render={({ field, fieldState }) => {
        /**
         * Resolve helper text: validation error takes priority, then next-submission
         * date, then regular help text.
         */
        const helperText: string | undefined = fieldState.error
          ? getLocalizedErrorMessage(fieldState.error, formField, loc, t)
          : hasNextSubmissionDate
            ? (kpiNextSubmissionDate ?? undefined)
            : hideHelperText
              ? undefined
              : loc(formField.helpTextEn, formField.helpTextAr) ?? undefined;

        return (
          <Box sx={{ mb: 2.5 }}>
            {!hideLabel && <TextFieldLabel field={formField} />}
            <TextField
              {...field}
              id={formField.fieldKey}
              type="number"
              size={size}
              value={toPercentageInputValue(field.value)}
              error={!!fieldState.error}
              helperText={helperText}
              variant="outlined"
              fullWidth
              placeholder={loc(
                formField.placeholderEn,
                formField.placeholderAr
              )}
              InputProps={{
                readOnly: isReadOnly,
                /** Show "%" as a visual suffix adornment */
                endAdornment: (
                  <InputAdornment position="end">%</InputAdornment>
                ),
              }}
              inputProps={{ min: PERCENTAGE_MIN, max: PERCENTAGE_MAX, step: 1 }}
              onChange={(e) => {
                field.onChange(clampPercentageInput(e.target.value));
              }}
              onBlur={(e) => {
                field.onChange(clampPercentageInput(e.target.value));
                field.onBlur();
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "background.paper",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.light",
                  },
                  ...(isReadOnly && {
                    backgroundColor: "action.hover",
                  }),
                },
                "& .MuiFormHelperText-root": {
                  mx: 0,
                  mt: 0.75,
                  fontSize: "0.75rem",
                },
                minWidth: hideLabel ? "unset" : "200px",
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default PercentageField;
