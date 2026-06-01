import { FieldValue, RawTableValueRow, TableValueRow } from "../types/submitFormRequest";

/** ISO date strings from `<input type="date">` (YYYY-MM-DD) */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Maps a raw table cell string to the API column value.
 * Numeric and dropdown values are sent as numbers; dates and other text stay as strings.
 */
function mapTableColumnValue(colVal: string): string | number {
  if (colVal === "") {
    return colVal;
  }
  if (ISO_DATE_PATTERN.test(colVal)) {
    return colVal;
  }
  const parsed = Number(colVal);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  return colVal;
}

/**
 * Returns true when the array contains plain objects (table rows) rather than
 * primitive strings/numbers (multi-select values).
 */
function isTableRowArray(arr: unknown[]): arr is Record<string, string>[] {
  if (arr.length === 0) return false;
  const first = arr[0];
  return (
    typeof first === "object" &&
    first !== null &&
    !Array.isArray(first)
  );
}

/**
 * Returns true when the value is a plain object whose own values are also plain
 * objects — i.e. a RAW_TABLE field stored as { rowKey: { colKey: value } }.
 * This shape is distinct from both scalar fields and array-based TABLE fields.
 */
function isRawTableObject(
  val: unknown
): val is Record<string, Record<string, string>> {
  if (typeof val !== "object" || val === null || Array.isArray(val)) {
    return false;
  }
  return Object.values(val as Record<string, unknown>).every(
    (v) => typeof v === "object" && v !== null && !Array.isArray(v)
  );
}

/**
 * Converts a single raw React Hook Form field value to the typed `FieldValue`
 * discriminated structure expected by the API.
 *
 * Rules:
 *  - Primitive (string / number / boolean)           → `simpleValue`
 *  - Array of primitives                             → `multiSelectValues`
 *  - Array of objects                                → `tableValues`   (dynamic TABLE)
 *  - Plain object whose values are also plain objects → `rawTableValues` (fixed RAW_TABLE)
 */
export function buildFieldValue(fieldKey: string, rawValue: unknown): FieldValue {
  if (Array.isArray(rawValue)) {
    if (isTableRowArray(rawValue)) {
      // Dynamic TABLE field: each array object becomes a TableValueRow with a positional index.
      const tableValues: TableValueRow[] = rawValue.map((row, rowIndex) => ({
        rowIndex,
        columns: Object.entries(row).reduce<Record<string, string | number>>(
          (cols, [colKey, colVal]) => {
            cols[colKey] = mapTableColumnValue(String(colVal));
            return cols;
          },
          {}
        ),
      }));

      return { fieldKey, simpleValue: null, multiSelectValues: null, tableValues, rawTableValues: null };
    }

    // Multi-select field: keep values as strings.
    return {
      fieldKey,
      simpleValue: null,
      multiSelectValues: rawValue.map(String),
      tableValues: null,
      rawTableValues: null,
    };
  }

  // Fixed RAW_TABLE field: nested object { rowKey: { colKey: value } }.
  if (isRawTableObject(rawValue)) {
    const rawTableValues: RawTableValueRow[] = Object.entries(rawValue).map(
      ([rowKey, colVals]) => ({
        rowKey,
        columns: Object.entries(colVals).reduce<Record<string, string | number>>(
          (cols, [colKey, colVal]) => {
            cols[colKey] = mapTableColumnValue(String(colVal));
            return cols;
          },
          {}
        ),
      })
    );
    return { fieldKey, simpleValue: null, multiSelectValues: null, tableValues: null, rawTableValues };
  }

  // Simple scalar field.
  return {
    fieldKey,
    simpleValue: rawValue !== null && rawValue !== undefined ? String(rawValue) : null,
    multiSelectValues: null,
    tableValues: null,
    rawTableValues: null,
  };
}

/**
 * Maps the raw `Record<string, unknown>` that React Hook Form provides on
 * submit into the `Record<string, FieldValue>` shape the API expects.
 */
export function mapFormDataToFieldValues(
  formData: Record<string, unknown>
): Record<string, FieldValue> {
  return Object.entries(formData).reduce<Record<string, FieldValue>>(
    (acc, [fieldKey, rawValue]) => {
      acc[fieldKey] = buildFieldValue(fieldKey, rawValue);
      return acc;
    },
    {}
  );
}
