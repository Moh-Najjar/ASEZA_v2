/** Represents the dataType object nested inside a FormField or ColumnDef */
export interface DataType {
  dataTypeId: number;
  typeKey: string;
  typeName: string;
}

/** Represents the controlType object nested inside a FormField or ColumnDef */
export interface ControlTypeDef {
  controlTypeId: number;
  /** One of: "NUMBER" | "DATEPICKER" | "DROPDOWN" | "MULTISELECT" | "TABLE" */
  controlKey: string;
  controlName: string;
}

/** Represents the lookupType object (nullable) */
export interface LookupType {
  lookupTypeId: number;
  code: string;
  nameEn: string;
  nameAr: string;
}

/** Represents a single column definition inside a TABLE or RAW_TABLE control */
export interface ColumnDef {
  columnKey: string;
  labelEn: string;
  labelAr: string;
  dataType: DataType;
  controlType: ControlTypeDef;
  lookupType: LookupType | null;
}

/**
 * Represents a fixed row definition inside a RAW_TABLE control.
 * Unlike TABLE (which lets users add rows), RAW_TABLE rows are pre-defined by the API.
 */
export interface RowDef {
  rowId: number;
  rowKey: string;
  labelEn: string;
  labelAr: string;
  displayOrder: number;
  placeholderEn: string;
  placeholderAr: string;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  defaultValue: string | null;
  helpTextEn: string | null;
  helpTextAr: string | null;
  validationMessageEn: string | null;
  validationMessageAr: string | null;
}

/**
 * Represents a single cell in a RAW_TABLE grid.
 * Carries all control-level properties (dataType, controlType, lookupType,
 * validation) independently per cell, allowing mixed control types within
 * the same table (e.g. DROPDOWN in column 1, NUMBER in column 2).
 */
export interface GridCell {
  /** 1-based row index within the grid */
  row: number;
  /** 1-based column index within the grid */
  column: number;
  rowKey: string;
  columnKey: string;
  rowLabelEn: string;
  rowLabelAr: string;
  columnLabelEn: string;
  columnLabelAr: string;
  dataType: DataType;
  controlType: ControlTypeDef;
  lookupType: LookupType | null;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  placeholderEn: string;
  placeholderAr: string;
  defaultValue: string | null;
  helpTextEn: string | null;
  helpTextAr: string | null;
  validationMessageEn: string | null;
  validationMessageAr: string | null;
}

/**
 * Top-level grid descriptor for a RAW_TABLE field.
 * The cells array is a flat list of every (row, column) intersection,
 * ordered by row then column.
 */
export interface GridDef {
  /** Total number of rows in the grid */
  rows: number;
  /** Total number of columns in the grid */
  columns: number;
  /** Flat list of all cells; each entry represents one (row, column) intersection */
  cells: GridCell[];
}

/** Represents a single form field from formData-v1.json */
export interface FormField {
  fieldId: number;
  formId: number;
  fieldKey: string;
  labelEn: string;
  labelAr: string;
  dataType: DataType;
  controlType: ControlTypeDef;
  isRequired: boolean;
  displayOrder: number;
  isReadOnly: boolean;
  isVisible: boolean;
  lookupType: LookupType | null;
  placeholderEn: string;
  placeholderAr: string;
  helpTextEn: string;
  helpTextAr: string;
  /** Column definitions for TABLE and RAW_TABLE controls; null for all other types */
  columns: ColumnDef[] | null;
  /** Fixed row definitions for RAW_TABLE controls; null for all other types */
  rows: RowDef[] | null;
  /**
   * Cell-level grid descriptor for RAW_TABLE controls.
   * When present, RawTable uses this as the primary rendering source,
   * allowing per-cell control types (e.g. DROPDOWN + NUMBER in the same row).
   * Falls back to rows[] + columns[] when null.
   */
  grid: GridDef | null;
  /**
   * Optional header label for the row-label column in RAW_TABLE.
   * When null/empty the row-label column is hidden entirely.
   * Example: "Record Type" for an airport statistics table.
   */
  rowLabelEn: string | null;
  rowLabelAr: string | null;
  regexPattern: string | null;
  validationMessageAr: string | null;
  validationMessageEn: string | null;
  kpiNextSubmissionDateEn: string | null;
  kpiNextSubmissionDateAr: string | null;
}
