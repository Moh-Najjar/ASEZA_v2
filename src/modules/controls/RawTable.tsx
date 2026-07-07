import React, { useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import TextFieldLabel from "./InputFieldLabel";
import { FormField, GridCell } from "../../core/types/FormField";
import { getControlKey, getControlType } from "../../core/utils/control.utils";
import { useLocale } from "../../core/hooks/useLocale";
import { useMultiDropdownOptions } from "../../core/hooks/useFormApi";

interface RawTableProps {
  formField: FormField;
  formMethods: UseFormReturn<Record<string, unknown>>;
  hideHelperText?: boolean;
}

/** Minimal row entry derived from grid.cells (unique rowKeys ordered by row index) */
interface RenderRow {
  rowKey: string;
  rowLabelEn: string;
  rowLabelAr: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a synthetic FormField from a GridCell so existing control
// components (InputField, DropDown, etc.) can render each cell unchanged.
// RHF path: "<parentFieldKey>.<rowKey>.<columnKey>"
// ─────────────────────────────────────────────────────────────────────────────
const gridCellToFormField = (
  cell: GridCell,
  fieldName: string,
  parentField: FormField
): FormField => ({
  fieldId: 0,
  formId: 0,
  fieldKey: fieldName,
  labelEn: cell.columnLabelEn,
  labelAr: cell.columnLabelAr,
  dataType: cell.dataType,
  controlType: cell.controlType,
  isRequired: parentField.isRequired,
  displayOrder: cell.column,
  isReadOnly: parentField.isReadOnly || cell.isReadOnly,
  isVisible: cell.isVisible,
  lookupType: cell.lookupType,
  placeholderEn: cell.placeholderEn,
  placeholderAr: cell.placeholderAr,
  helpTextEn: cell.helpTextEn ?? "",
  helpTextAr: cell.helpTextAr ?? "",
  columns: null,
  rows: null,
  grid: null,
  rowLabelEn: null,
  rowLabelAr: null,
  regexPattern: parentField.regexPattern,
  validationMessageEn: cell.validationMessageEn,
  validationMessageAr: cell.validationMessageAr,
  // Inherit next-submission date from the parent RAW_TABLE field so cell
  // controls apply the same read-only + helper-text behaviour as InputField.
  kpiNextSubmissionDateEn: parentField.kpiNextSubmissionDateEn,
  kpiNextSubmissionDateAr: parentField.kpiNextSubmissionDateAr,
  calculation: null,
});

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a fixed-row table for fields with controlKey "RAW_TABLE".
 *
 * Data sources:
 *  • formField.columns[]  — column headers (label, columnKey)
 *  • formField.grid.cells — row structure and per-cell control properties
 *                           (controlType, dataType, lookupType, validation…)
 *
 * Row-label column:
 *  Shown only when formField.rowLabelEn or formField.rowLabelAr is non-empty.
 *  That value is used as the column header (e.g. "Record Type").
 *
 * RHF path per cell: "<fieldKey>.<rowKey>.<columnKey>"
 * Submit shape:      { [rowKey]: { [columnKey]: value } }  → rawTableValues
 */
const RawTable: React.FC<RawTableProps> = ({
  formField,
  formMethods,
  hideHelperText = false,
}) => {
  const { loc } = useLocale();
  const { setValue, getValues } = formMethods;

  /** True when a next-submission date is provided for this RAW_TABLE KPI field */
  const kpiDateEn = formField.kpiNextSubmissionDateEn ?? "";
  const kpiDateAr = formField.kpiNextSubmissionDateAr ?? "";
  const kpiNextSubmissionDate = loc(kpiDateEn, kpiDateAr);
  const hasNextSubmissionDate =
    kpiNextSubmissionDate !== null && kpiNextSubmissionDate !== "";

  /** The table is read-only either by its own flag or when a next-submission date is set */
  const isTableReadOnly = formField.isReadOnly || hasNextSubmissionDate;

  /** Column definitions are taken directly from formField.columns */
  const columns = formField.columns ?? [];

  /**
   * Row-label column is shown only when the field provides a non-empty header label.
   * Coalescing to "" guards against both null and undefined (the API may omit the
   * key entirely when it has no value, producing undefined at runtime).
   */
  const hasRowLabelColumn =
    (formField.rowLabelEn ?? "") !== "" ||
    (formField.rowLabelAr ?? "") !== "";

  const grid = formField.grid;

  // ── Unique ordered rows derived from grid.cells ───────────────────────────
  const renderRows = useMemo((): RenderRow[] => {
    if (grid === null) return [];
    const seen = new Set<string>();
    return [...grid.cells]
      .sort((a, b) => a.row - b.row)
      .reduce<RenderRow[]>((acc, cell) => {
        if (!seen.has(cell.rowKey)) {
          seen.add(cell.rowKey);
          acc.push({
            rowKey: cell.rowKey,
            rowLabelEn: cell.rowLabelEn,
            rowLabelAr: cell.rowLabelAr,
          });
        }
        return acc;
      }, []);
  }, [grid]);

  /** Fast cell lookup: "rowKey.columnKey" → GridCell */
  const cellMap = useMemo((): Map<string, GridCell> => {
    if (grid === null) return new Map();
    return grid.cells.reduce<Map<string, GridCell>>((map, cell) => {
      map.set(`${cell.rowKey}.${cell.columnKey}`, cell);
      return map;
    }, new Map());
  }, [grid]);

  // ── DROPDOWN pre-seeding ──────────────────────────────────────────────────
  /** Collect unique lookupTypeIds for every DROPDOWN cell in the grid */
  const dropdownLookupIds = useMemo((): number[] => {
    if (grid === null) return [];
    const ids = new Set<number>();
    for (const cell of grid.cells) {
      if (
        cell.controlType.controlKey === "DROPDOWN" &&
        cell.lookupType !== null
      ) {
        ids.add(cell.lookupType.lookupTypeId);
      }
    }
    return [...ids];
  }, [grid]);

  const { data: dropdownOptionsMap = {} } = useMultiDropdownOptions(
    dropdownLookupIds
  );

  const optionsReady =
    dropdownLookupIds.length === 0 ||
    Object.keys(dropdownOptionsMap).length > 0;

  /** Guard prevents double-seeding under React StrictMode */
  const hasSeeded = React.useRef(false);

  /**
   * Once options arrive, set the first option as the default value for every
   * DROPDOWN cell that the user has not yet touched.
   */
  useEffect(() => {
    if (!optionsReady || hasSeeded.current || grid === null) return;
    hasSeeded.current = true;

    for (const cell of grid.cells) {
      if (
        cell.controlType.controlKey !== "DROPDOWN" ||
        cell.lookupType === null ||
        isTableReadOnly ||
        cell.isReadOnly ||
        !cell.isVisible
      ) {
        continue;
      }
      const path = `${formField.fieldKey}.${cell.rowKey}.${cell.columnKey}`;
      const current = getValues(path as never);
      if (current === undefined || current === "") {
        const options =
          dropdownOptionsMap[String(cell.lookupType.lookupTypeId)] ?? [];
        if (options.length > 0) {
          setValue(path as never, String(options[0].lookupValueId) as never);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsReady]);

  // ── Cell FormField resolver ───────────────────────────────────────────────
  /**
   * Returns a synthetic FormField for the (rowKey, columnKey) intersection,
   * or null when the cell is absent or invisible.
   */
  const getCellFormField = (
    rowKey: string,
    colKey: string,
  ): FormField | null => {
    const cell = cellMap.get(`${rowKey}.${colKey}`);
    if (cell === undefined || !cell.isVisible) return null;
    const fieldName = `${formField.fieldKey}.${rowKey}.${colKey}`;
    return gridCellToFormField(cell, fieldName, formField);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
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
              {/* Row-label column header (e.g. "Record Type") — hidden when null */}
              {hasRowLabelColumn && (
                <TableCell sx={{ fontWeight: "bold", minWidth: 220 }}>
                  {loc(formField.rowLabelEn ?? "", formField.rowLabelAr ?? "")}
                </TableCell>
              )}

              {/* One header cell per column from formField.columns */}
              {columns.map((col) => (
                <TableCell
                  key={col.columnKey}
                  sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                >
                  {loc(col.labelEn, col.labelAr)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* ── Body: one row per unique rowKey in grid.cells ── */}
          <TableBody>
            {renderRows.map((row) => (
              <TableRow key={row.rowKey} hover>
                {/* Optional row-label cell */}
                {hasRowLabelColumn && (
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loc(row.rowLabelEn, row.rowLabelAr)}
                  </TableCell>
                )}

                {/* One data cell per column */}
                {columns.map((col) => {
                  const cellField = getCellFormField(
                    row.rowKey,
                    col.columnKey
                  );

                  if (cellField === null) {
                    /** Cell absent or invisible — render an empty placeholder */
                    return <TableCell key={col.columnKey} />;
                  }

                  const controlKey = getControlKey(cellField);
                  const Component = getControlType(controlKey);

                  return (
                    <TableCell
                      key={col.columnKey}
                      sx={{ verticalAlign: "top", py: 1 }}
                    >
                      {Component !== undefined ? (
                        <Component
                          formField={cellField}
                          formMethods={formMethods}
                          hideLabel={true}
                          size="small"
                          isGridField={true}
                        />
                      ) : (
                        <Typography variant="caption" color="error">
                          {`Unsupported: ${cellField.controlType.controlKey}`}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Next-submission date helper — shown once below the table */}
      {!hideHelperText && hasNextSubmissionDate && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block", fontSize: "0.75rem" }}
        >
          {kpiNextSubmissionDate}
        </Typography>
      )}

      {/* Regular field-level help text when no next-submission date is set */}
      {!hideHelperText &&
        !hasNextSubmissionDate &&
        (formField.helpTextEn !== "" || formField.helpTextAr !== "") && (
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

export default RawTable;
