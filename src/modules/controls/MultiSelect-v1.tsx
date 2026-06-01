import React from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  OutlinedInput,
} from "@mui/material";
import TextFieldLabel from "./InputFieldLabel";
import { FormField } from "../../core/types/FormField";
import { useLocale } from "../../core/hooks/useLocale";
import { useDropdownOptions } from "../../core/hooks/useFormApi";
import { getValidationRules } from "../../core/utils/validationUtils";

interface MultiSelectProps {
  formField: FormField;
  formMethods: UseFormReturn<Record<string, unknown>>;
  hideLabel?: boolean;
  hideHelperText?: boolean;
  size?: "small" | "medium";
}

/** Renders a multi-select control for fields with controlKey "MULTISELECT" */
const MultiSelect: React.FC<MultiSelectProps> = ({
  formField,
  formMethods,
  hideLabel = false,
  hideHelperText = false,
  size = "medium",
}) => {
  const { control } = formMethods;
  const { loc, t } = useLocale();

  const placeholder = loc(formField.placeholderEn, formField.placeholderAr);
  const helpText = loc(formField.helpTextEn, formField.helpTextAr);

  /** True when a next-submission date is provided for this KPI field */
  const kpiDateEn = formField.kpiNextSubmissionDateEn ?? "";
  const kpiDateAr = formField.kpiNextSubmissionDateAr ?? "";
  const kpiNextSubmissionDate = loc(kpiDateEn, kpiDateAr);
  const hasNextSubmissionDate = kpiNextSubmissionDate !== null && kpiNextSubmissionDate !== "";

  /** The field is read-only either by its own flag or when a next-submission date is set */
  const isReadOnly = formField.isReadOnly || hasNextSubmissionDate;

  const lookupTypeId = formField.lookupType?.lookupTypeId;

  /**
   * useQuery fetches once and caches by lookupTypeId.
   * Every MultiSelect that shares the same lookupTypeId reads from cache
   * without a network round-trip, so adding new table rows never
   * triggers redundant API calls.
   */
  const { data: dropdownListValues } = useDropdownOptions(lookupTypeId);

  /** Options for this field, keyed by the lookupTypeId from the API response */
  const options = lookupTypeId !== undefined
    ? (dropdownListValues?.[String(lookupTypeId)] ?? [])
    : [];

  /** Build a quick id→label map so renderValue chips show a human-readable name */
  const labelById = options.reduce<Record<string, string>>((acc, item) => {
    acc[String(item.lookupValueId)] = loc(item.nameEn, item.nameAr);
    return acc;
  }, {});

  return (
    <Controller
      name={formField.fieldKey}
      control={control}
      defaultValue={[]}
      rules={getValidationRules(formField, loc, t)}
      render={({ field, fieldState }) => {
        const selectedValues = Array.isArray(field.value)
          ? (field.value as string[])
          : [];

        return (
          <Box>
            {!hideLabel && <TextFieldLabel field={formField} />}
            <FormControl
              fullWidth
              size={size}
              error={!!fieldState.error}
              sx={{ 
                minWidth: hideLabel ? "unset" : "200px",
                ...(isReadOnly && {
                  backgroundColor: "action.hover",
                }),
              }}
            >
              <Select
                {...field}
                id={formField.fieldKey}
                multiple
                displayEmpty
                inputProps={{ readOnly: isReadOnly }}
                input={<OutlinedInput />}
                value={selectedValues}
                onChange={(e) => field.onChange(e.target.value)}
                renderValue={(selected) => {
                  const selectedArr = selected as string[];
                  if (selectedArr.length === 0) {
                    return <em>{placeholder || "Select options"}</em>;
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selectedArr.map((val) => (
                        /* Show the localized name; fall back to the raw id if not found */
                        <Chip key={val} label={labelById[val] ?? val} size="small" />
                      ))}
                    </Box>
                  );
                }}
              >
                {options.length === 0 ? (
                  <MenuItem disabled value="">
                    <em>{placeholder || "No options available"}</em>
                  </MenuItem>
                ) : (
                  options.map((item) => (
                    <MenuItem key={item.lookupValueId} value={String(item.lookupValueId)}>
                      {loc(item.nameEn, item.nameAr)}
                    </MenuItem>
                  ))
                )}
              </Select>
              {fieldState.error && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
              {!fieldState.error && hasNextSubmissionDate && (
                <FormHelperText>{kpiNextSubmissionDate}</FormHelperText>
              )}
              {!fieldState.error && !hasNextSubmissionDate && helpText && !hideLabel && !hideHelperText && (
                <FormHelperText>{helpText}</FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      }}
    />
  );
};

export default MultiSelect;
