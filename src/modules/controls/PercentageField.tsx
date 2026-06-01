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
              /** Clamp the native HTML input to 0–100 so keyboard arrows respect the range */
              inputProps={{ min: 0, max: 100, step: 1 }}
              onChange={(e) => field.onChange(e.target.value)}
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
