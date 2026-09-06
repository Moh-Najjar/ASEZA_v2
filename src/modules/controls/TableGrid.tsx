import React, { useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TextFieldLabel from "./InputFieldLabel";
import { FormField, ColumnDef, LookupType } from "../../core/types/FormField";
import { getControlKey, getControlType } from "../../core/utils/control.utils";
import { useLocale } from "../../core/hooks/useLocale";
import { useMultiDropdownOptions } from "../../core/hooks/useFormApi";
import { GetDropdownListValuesResponse } from "../../core/types/getDropdownListValuesResponse";
import { findJordanLookupValueId, isCountriesLookupType } from "../../core/utils/countryLookup";

interface TableGridProps {
  formField: FormField;
  formMethods: UseFormReturn<Record<string, unknown>>;
  hideHelperText?: boolean;
}

/**
 * Builds a default row for the table:
 * - COUNTRIES dropdown columns → Jordan's lookupValueId when present.
 * - Other DROPDOWN columns → first available option's lookupValueId so the
 *   value matches what the server receives on submit even without user interaction.
 * - All other columns → empty string.
 */
const buildDefaultRow = (
  columns: ColumnDef[],
  optionsMap: GetDropdownListValuesResponse
): Record<string, string> =>
  columns.reduce<Record<string, string>>((acc, col) => {
    if (col.controlType.controlKey === "DROPDOWN" && col.lookupType !== null) {
      const options = optionsMap[String(col.lookupType.lookupTypeId)] ?? [];
      if (isCountriesLookupType(col.lookupType)) {
        acc[col.columnKey] = findJordanLookupValueId(options) ?? "";
      } else {
        acc[col.columnKey] = options.length > 0 ? String(options[0].lookupValueId) : "";
      }
    } else {
      acc[col.columnKey] = "";
    }
    return acc;
  }, {});

/**
 * Converts a ColumnDef into a minimal FormField so the existing control
 * components (InputField, DropDown, etc.) can render it without any changes.
 * fieldKey is set to the full nested RHF path: "parentKey.rowIndex.columnKey"
 */
const columnToFormField = (
  col: ColumnDef,
  fieldName: string,
  isReadOnly: boolean,
  isRequired: boolean
): FormField => ({
  fieldId: 0,
  formId: 0,
  fieldKey: fieldName,
  labelEn: col.labelEn,
  labelAr: col.labelAr,
  dataType: col.dataType,
  controlType: col.controlType,
  isRequired: isRequired,
  displayOrder: 0,
  isReadOnly,
  isVisible: true,
  lookupType: col.lookupType,
  /** Use the column's own bilingual label as the placeholder inside table cells */
  placeholderEn: col.labelEn,
  placeholderAr: col.labelAr,
  helpTextEn: "",
  helpTextAr: "",
  columns: null,
  /** TABLE cells never carry nested rows, grid, or row-label headers */
  rows: null,
  grid: null,
  rowLabelEn: null,
  rowLabelAr: null,
  /** Table cell columns do not carry per-cell regex constraints */
  regexPattern: null,
  validationMessageEn: null,
  validationMessageAr: null,
  /** Table cells do not carry a next-submission date — that belongs to the parent field */
  kpiNextSubmissionDateEn: null,
  kpiNextSubmissionDateAr: null,
  calculation: null,
});

/** Renders a dynamic table/grid using useFieldArray for fields with controlKey "TABLE" */
const TableGrid: React.FC<TableGridProps> = ({ formField, formMethods, hideHelperText = false }) => {
  const columns = formField.columns ?? [];
  const { loc, t } = useLocale();

  /** True when a next-submission date is provided for this KPI field */
  const kpiDateEn = formField.kpiNextSubmissionDateEn ?? "";
  const kpiDateAr = formField.kpiNextSubmissionDateAr ?? "";
  const kpiNextSubmissionDate = loc(kpiDateEn, kpiDateAr);
  const hasNextSubmissionDate = kpiNextSubmissionDate !== null && kpiNextSubmissionDate !== "";

  /** The table is read-only either by its own flag or when a next-submission date is set */
  const isReadOnly = formField.isReadOnly || hasNextSubmissionDate;

  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    /** fieldKey acts as the array name in the form state (e.g. "KPI_0050") */
    name: formField.fieldKey as never,
  });

  /**
   * Collect the lookupTypeIds for every DROPDOWN column in this table.
   * A single batch request fetches all of them so the first option of each
   * can be pre-selected when a new row is built.
   */
  const dropdownLookupIds = columns
    .filter((col): col is ColumnDef & { lookupType: LookupType } =>
      col.controlType.controlKey === "DROPDOWN" && col.lookupType !== null
    )
    .map((col) => col.lookupType.lookupTypeId);

  const { data: dropdownOptionsMap = {} } = useMultiDropdownOptions(dropdownLookupIds);

  /**
   * Options are considered ready when:
   * - the table has no dropdown columns (nothing to wait for), OR
   * - at least one lookup type's options have arrived in the map.
   */
  const optionsReady =
    dropdownLookupIds.length === 0 ||
    Object.keys(dropdownOptionsMap).length > 0;

  /**
   * Guard ref prevents React StrictMode's double-invocation from appending
   * two rows on first mount — ensures exactly one default row is seeded.
   */
  const hasSeeded = React.useRef(false);

  /**
   * Seed one default row once the dropdown options are available so that
   * every DROPDOWN cell already shows (and submits) the first option.
   */
  useEffect(() => {
    if (!hasSeeded.current && fields.length === 0 && optionsReady) {
      hasSeeded.current = true;
      append(buildDefaultRow(columns, dropdownOptionsMap));
    }
    // Re-run only when optionsReady flips; other deps are stable references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsReady]);

  const handleAddRow = () => {
    append(buildDefaultRow(columns, dropdownOptionsMap));
  };

  return (
    <Box>
      <TextFieldLabel field={formField} />

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mt: 1, borderRadius: 1 }}
      >
        <Table size="small">
          {/* ── Header ── */}
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              {columns.map((col) => (
                <TableCell
                  key={col.columnKey}
                  sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                >
                  {loc(col.labelEn, col.labelAr)}
                </TableCell>
              ))}
              {/* Add Row button lives in the header's action column */}
              <TableCell sx={{ width: 48, textAlign: "center" }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleAddRow}
                  disabled={isReadOnly}
                  aria-label={t("stepper.addRow")}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* ── Body ── */}
          <TableBody>
            {fields.map((row, rowIndex) => (
              <TableRow key={row.id} hover>
                {columns.map((col) => {
                  /** Full RHF nested path: e.g. "KPI_0050.0.FOOD_TYPE" */
                  const fieldName = `${formField.fieldKey}.${rowIndex}.${col.columnKey}`;
                  const isRequired = formField.isRequired;

                  /** Wrap the column as a FormField so existing controls work as-is */
                  const cellField = columnToFormField(
                    col,
                    fieldName,
                    isReadOnly,
                    isRequired
                  );

                  const controlKey = getControlKey(cellField);
                  const Component = getControlType(controlKey);

                  return (
                    <TableCell
                      key={col.columnKey}
                      sx={{ verticalAlign: "top", py: 1 }}
                    >
                      {Component ? (
                        <Component
                          formField={cellField}
                          formMethods={formMethods}
                          hideLabel={true}
                          size="small"
                          isGridField={true}
                        />
                      ) : (
                        <Typography variant="caption" color="error">
                          {`Unsupported: ${col.controlType.controlKey}`}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}

                {/* Delete row button — hidden when only one row remains */}
                <TableCell sx={{ verticalAlign: "top", py: 1, width: 48 }}>
                  {fields.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(rowIndex)}
                      aria-label={`Remove row ${rowIndex + 1}`}
                      disabled={isReadOnly}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!hideHelperText && hasNextSubmissionDate && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block", fontSize: "0.75rem" }}
        >
          {kpiNextSubmissionDate}
        </Typography>
      )}
      {!hideHelperText && !hasNextSubmissionDate && (formField.helpTextEn || formField.helpTextAr) && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block", fontSize: "0.75rem" }}
        >
          {loc(formField.helpTextEn, formField.helpTextAr)}
        </Typography>
      )}
    </Box>
  );
};

export default TableGrid;
