import React, { useEffect } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import TextFieldLabel from "./InputFieldLabel";
import { FormField } from "../../core/types/FormField";
import { useLocale } from "../../core/hooks/useLocale";
import { useDropdownOptions } from "../../core/hooks/useFormApi";
import { getValidationRules, getLocalizedErrorMessage } from "../../core/utils/validationUtils";
import { findJordanLookupValueId, isCountriesLookupType } from "../../core/utils/countryLookup";

interface DropDownProps {
  formField: FormField;
  formMethods: UseFormReturn<Record<string, unknown>>;
  hideLabel?: boolean;
  hideHelperText?: boolean;
  size?: "small" | "medium";
}

/** Renders a dropdown select control for fields with controlKey "DROPDOWN" */
const DropDown: React.FC<DropDownProps> = ({
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
   * Every DropDown that shares the same lookupTypeId reads from cache
   * without a network round-trip, so adding new table rows never
   * triggers redundant API calls.
   */
  const { data: dropdownListValues } = useDropdownOptions(lookupTypeId);

  /** Options for this field, keyed by the lookupTypeId from the API response */
  const options = lookupTypeId !== undefined
    ? (dropdownListValues?.[String(lookupTypeId)] ?? [])
    : [];

  /** Jordan's lookupValueId when this field is a COUNTRIES dropdown; otherwise undefined */
  const jordanDefaultId = isCountriesLookupType(formField.lookupType)
    ? findJordanLookupValueId(options)
    : undefined;

  /**
   * COUNTRIES lookup only: once options load, pre-select Jordan when the field
   * is still empty. Existing submission values and other lookup types are left alone.
   */
  useEffect(() => {
    if (jordanDefaultId === undefined || isReadOnly) {
      return;
    }

    const current = formMethods.getValues(formField.fieldKey);
    if (current !== undefined && current !== null && String(current) !== "") {
      return;
    }

    formMethods.setValue(formField.fieldKey, jordanDefaultId, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [formField.fieldKey, formMethods, isReadOnly, jordanDefaultId]);

  return (
    <Controller
      name={formField.fieldKey}
      control={control}
      defaultValue=""
      rules={getValidationRules(formField, loc, t)}
      render={({ field, fieldState }) => {
        /**
         * Issue: TABLE / submission APIs often return the country label (or code)
         * while MenuItem values are always lookupValueId — MUI Select stays blank
         * when those do not match.
         * Solution: resolve the stored value (id | code | nameEn | nameAr) to the
         * matching option's lookupValueId before binding it to Select.
         */
        const raw = field.value == null ? "" : String(field.value);
        
        const matched = options.find(
          (o) =>
            String(o.lookupValueId) === raw ||
            o.code === raw ||
            o.nameEn === raw ||
            o.nameAr === raw
        );
        const selectValue = matched !== undefined ? String(matched.lookupValueId) : raw;

        return (
          <Box sx={{ mb: 2.5 }}>
            {!hideLabel && <TextFieldLabel field={formField} />}
            <FormControl
              fullWidth
              size={size}
              error={!!fieldState.error}
              sx={{
                minWidth: hideLabel ? "unset" : "200px",
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
              }}
            >
              <Select
                {...field}
                value={selectValue}
                id={formField.fieldKey}
                displayEmpty
                inputProps={{ readOnly: isReadOnly }}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {/* Placeholder — disabled so the user cannot re-select it */}
                <MenuItem value="" disabled>
                  <em>{placeholder || t("controls.selectValue", "Select value")}</em>
                </MenuItem>
                {options.map((item) => (
                  <MenuItem key={item.lookupValueId} value={String(item.lookupValueId)}>
                    {loc(item.nameEn, item.nameAr)}
                  </MenuItem>
                ))}
              </Select>
              {fieldState.error && (
                <FormHelperText>
                  {getLocalizedErrorMessage(fieldState.error, formField, loc, t)}
                </FormHelperText>
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

export default DropDown;
