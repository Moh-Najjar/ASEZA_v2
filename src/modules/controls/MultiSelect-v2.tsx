import React, { useState, useMemo } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  IconButton,
  InputAdornment,
  TextField,
  Divider,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
} from "@mui/icons-material";
import TextFieldLabel from "./InputFieldLabel";
import { FormField } from "../../core/types/FormField";
import { useLocale } from "../../core/hooks/useLocale";
import { useDropdownOptions } from "../../core/hooks/useFormApi";
import { getValidationRules, getLocalizedErrorMessage } from "../../core/utils/validationUtils";

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
  const { control, setValue } = formMethods;
  const { loc, t } = useLocale();

  const [searchTerm, setSearchTerm] = useState("");

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

  /** Filter options based on search term */
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((item) => {
      const label = loc(item.nameEn, item.nameAr).toLowerCase();
      return label.includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm, loc]);

  /** Build a quick id→label map so renderValue chips show a human-readable name */
  const labelById = useMemo(() => options.reduce<Record<string, string>>((acc, item) => {
    acc[String(item.lookupValueId)] = loc(item.nameEn, item.nameAr);
    return acc;
  }, {}), [options, loc]);

  /** Handle clearing all selected values */
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(formField.fieldKey, [], { shouldValidate: true, shouldDirty: true });
  };

  /** Handle deselecting a single chip */
  const handleDeleteChip = (val: string, currentValues: string[]) => {
    const newValues = currentValues.filter((v) => v !== val);
    setValue(formField.fieldKey, newValues, { shouldValidate: true, shouldDirty: true });
  };

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
                onClose={() => setSearchTerm("")}
                endAdornment={
                  selectedValues.length > 0 && !isReadOnly && (
                    <InputAdornment position="end" sx={{ mr: 3 }}>
                      <Tooltip title={t("common.clearAll", "Clear All")}>
                        <IconButton
                          size="small"
                          onClick={handleClearAll}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }
                renderValue={(selected) => {
                  const selectedArr = selected as string[];
                  if (selectedArr.length === 0) {
                    return (
                      <Typography color="text.secondary" variant="body2" sx={{ fontStyle: "italic" }}>
                        {placeholder || t("common.selectOptions", "Select options")}
                      </Typography>
                    );
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selectedArr.map((val) => (
                        <Chip
                          key={val}
                          label={labelById[val] ?? val}
                          size="small"
                          onDelete={isReadOnly ? undefined : () => handleDeleteChip(val, selectedValues)}
                          onMouseDown={(e) => e.stopPropagation()}
                          sx={{
                            borderRadius: "4px",
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            "& .MuiChip-deleteIcon": {
                              color: "primary.contrastText",
                              "&:hover": { color: "text.secondary" },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 400,
                      width: 250,
                    },
                  },
                }}
              >
                {/* Search and Action Header */}
                <Box sx={{ p: 1, position: "sticky", top: 0, bgcolor: "background.paper", zIndex: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={t("common.search", "Search...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ClearAllIcon />}
                      onClick={handleClearAll}
                      disabled={selectedValues.length === 0}
                      color="inherit"
                    >
                      {t("common.clear", "Clear")}
                    </Button>
                  </Box>
                </Box>
                <Divider />

                {filteredOptions.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm 
                        ? t("common.noMatches", "No matching options") 
                        : (placeholder || t("common.noOptions", "No options available"))}
                    </Typography>
                  </MenuItem>
                ) : (
                  filteredOptions.map((item) => {
                    const id = String(item.lookupValueId);
                    const isChecked = selectedValues.indexOf(id) > -1;
                    return (
                      <MenuItem key={id} value={id} sx={{ py: 0.5 }}>
                        <Checkbox checked={isChecked} size="small" />
                        <ListItemText 
                          primary={loc(item.nameEn, item.nameAr)} 
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </MenuItem>
                    );
                  })
                )}
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

export default MultiSelect;
