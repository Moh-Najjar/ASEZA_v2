// ─── Nested helper shapes ─────────────────────────────────────────────────────

/**
 * Directorate embedded inside AdminForm.
 * Matches the exact shape returned by the API — defined locally to avoid
 * a circular import with adminDirectorates.ts.
 */
export interface FormDirectorate {
  directorateId: number;
  directorateKey: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  createdAt: string;
}

/** Frequency object nested inside AdminForm. */
export interface AdminFormFrequency {
  frequencyId: number;
  code: string;
  nameEn: string;
  nameAr: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Calculation ───────────────────────────────────────────────────────────────

/** A single input variable inside a CALCULATED field's formula. */
export interface CalculationInput {
  inputId: number;
  calculationId: number;
  inputToken: string;
  columnKey: string;
  labelEn: string;
  labelAr: string;
  placeholderEn: string | null;
  placeholderAr: string | null;
  displayOrder: number;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  validationMessageEn: string | null;
  validationMessageAr: string | null;
  isActive: boolean;
  createdAt: string;
  dataTypeId: number;
  controlTypeId: number;
}

/**
 * The calculation definition attached to a CALCULATED field.
 * This is a SINGLE OBJECT (or null) on the field — NOT an array.
 * The API property name on AdminFormField is `formFieldCalculations`.
 */
export interface FieldCalculation {
  calculationId: number;
  fieldId: number;
  formulaExpression: string;
  resultColumnKey: string;
  resultLabelEn: string;
  resultLabelAr: string;
  resultPrecision: number;
  buttonLabelEn: string;
  buttonLabelAr: string;
  helpTextEn: string | null;
  helpTextAr: string | null;
  displayFormulaEn: string | null;
  displayFormulaAr: string | null;
  isActive: boolean;
  createdAt: string;
  resultDataTypeId: number;
  resultControlTypeId: number;
  formFieldCalculationInputs: CalculationInput[];
}

// ─── Field sub-entities ───────────────────────────────────────────────────────

/** A selectable option on a DROPDOWN / RADIO / MULTI_SELECT field. */
export interface FieldOption {
  optionId: number;
  fieldId: number;
  optionKey: string;
  optionLabelEn: string;
  optionLabelAr: string;
  optionValue: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

/** A show/hide/require dependency rule linked to a field. */
export interface FieldDependency {
  dependencyId: number;
  fieldId: number;
  dependsOnFieldId: number;
  conditionOperator: 'EQ' | 'NEQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'CONTAINS' | 'IS_EMPTY' | 'IS_NOT_EMPTY';
  conditionValue: string;
  action: 'SHOW' | 'HIDE' | 'REQUIRE' | 'DISABLE';
  createdAt: string;
}

/** A column definition on a TABLE / GRID field. */
export interface FieldColumn {
  columnId: number;
  fieldId: number;
  columnKey: string;
  labelEn: string;
  labelAr: string;
  displayOrder: number;
  dataTypeId: number;
  controlTypeId: number;
  lookupTypeId: number | null;
}

/** A row definition on a TABLE / GRID field. */
export interface FieldRow {
  rowId: number;
  fieldId: number;
  rowKey: string;
  labelEn: string;
  labelAr: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  placeholderEn: string | null;
  placeholderAr: string | null;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  defaultValue: string | null;
  helpTextEn: string | null;
  helpTextAr: string | null;
  validationMessageEn: string | null;
  validationMessageAr: string | null;
}

// ─── Form Field ───────────────────────────────────────────────────────────────

/** A single field belonging to a form (from GET /admin/forms/:formId). */
export interface AdminFormField {
  fieldId: number;
  formId: number;
  fieldKey: string;
  labelEn: string;
  labelAr: string;
  isRequired: boolean;
  minValue: number | null;
  maxValue: number | null;
  minLength: number | null;
  maxLength: number | null;
  regexPattern: string | null;
  placeholderEn: string | null;
  placeholderAr: string | null;
  defaultValue: string | null;
  displayOrder: number;
  helpTextEn: string | null;
  helpTextAr: string | null;
  isReadOnly: boolean;
  isVisible: boolean;
  validationMessageEn: string | null;
  validationMessageAr: string | null;
  createdAt: string;
  dataTypeId: number;
  controlTypeId: number;
  lookupTypeId: number | null;
  kpiId: number | null;
  isActive: boolean;
  /** Empty array when no options are defined. */
  fieldOptions: FieldOption[];
  /** Empty array when field has no dependencies. */
  fieldDependencies: FieldDependency[];
  /** Empty array when field has no table columns. */
  formFieldColumns: FieldColumn[];
  /** Empty array when field has no table rows. */
  formFieldRows: FieldRow[];
  /** Single calculation object — present only for CALCULATED fields; null otherwise. */
  formFieldCalculations: FieldCalculation | null;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

/**
 * A form record from the admin API.
 * - List endpoint (GET /admin/forms/all): includes `directorate` and `frequency`
 *   but does NOT include `formFields`.
 * - Detail endpoint (GET /admin/forms/:formId): includes all nested objects plus `formFields`.
 */
export interface AdminForm {
  formId: number;
  formKey: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  isActive: boolean;
  version: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string | null;
  directorateId: number | null;
  frequencyId: number | null;
  createdByUserId: number | null;
  updatedByUserId: number | null;
  /** Nested directorate — present in list and detail endpoints. */
  directorate?: FormDirectorate;
  /** Nested frequency — present in list and detail endpoints. */
  frequency?: AdminFormFrequency;
  /** Only present in the detail endpoint (GET /admin/forms/:formId). */
  formFields?: AdminFormField[];
}

// ─── Request bodies ───────────────────────────────────────────────────────────

/** Body for POST /admin/forms. */
export interface CreateFormRequest {
  formKey: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  directorateId: number;
  frequencyId: number;
  /** ISO date string, e.g. "2026-01-01", or null when not set. */
  effectiveFrom?: string | null;
  /** ISO date string, e.g. "2026-12-31", or null when not set. */
  effectiveTo?: string | null;
  isActive: boolean;
}

/** Body for PATCH /admin/forms/:formId. */
export interface UpdateFormRequest {
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  directorateId?: number;
  frequencyId?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

/** Body for POST /admin/forms/:formId/fields. */
export interface AddFieldRequest {
  fieldKey: string;
  labelEn: string;
  labelAr: string;
  dataTypeId: number;
  controlTypeId: number;
  displayOrder: number;
  isRequired: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  regexPattern?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  defaultValue?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  validationMessageEn?: string;
  validationMessageAr?: string;
  isReadOnly: boolean;
  isVisible: boolean;
  lookupTypeId?: number;
  kpiId?: number;
}

/** Body for PATCH /admin/forms/:formId/fields/:fieldId. */
export interface UpdateFieldRequest {
  labelEn?: string;
  labelAr?: string;
  displayOrder?: number;
  isRequired?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  regexPattern?: string;
  placeholderEn?: string;
  placeholderAr?: string;
  defaultValue?: string;
  helpTextEn?: string;
  helpTextAr?: string;
  validationMessageEn?: string;
  validationMessageAr?: string;
  isReadOnly?: boolean;
  isVisible?: boolean;
  isActive?: boolean;
  lookupTypeId?: number;
}

/** Body for POST /admin/forms/:formId/fields/:fieldId/options. */
export interface AddOptionRequest {
  optionKey: string;
  optionLabelEn: string;
  optionLabelAr: string;
  optionValue: string;
  displayOrder: number;
  isActive: boolean;
}

/** Body for POST /admin/forms/:formId/fields/:fieldId/dependencies. */
export interface AddDependencyRequest {
  dependsOnFieldId: number;
  conditionOperator: 'EQ' | 'NEQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'CONTAINS' | 'IS_EMPTY' | 'IS_NOT_EMPTY';
  conditionValue: string;
  action: 'SHOW' | 'HIDE' | 'REQUIRE' | 'DISABLE';
}

/** Body for POST /admin/forms/:formId/fields/:fieldId/columns. */
export interface AddColumnRequest {
  columnKey: string;
  labelEn: string;
  labelAr: string;
  displayOrder: number;
  dataTypeId: number;
  controlTypeId: number;
  lookupTypeId?: number;
}

/** Body for POST /admin/forms/:formId/fields/:fieldId/rows. */
export interface AddRowRequest {
  rowKey: string;
  labelEn: string;
  labelAr: string;
  displayOrder: number;
  placeholderEn?: string;
  placeholderAr?: string;
  isRequired: boolean;
  isReadOnly: boolean;
  isVisible: boolean;
  defaultValue?: string;
  helpTextEn?: string;
  helpTextAr?: string;
}

/** A single input variable inside a SetCalculation request body. */
export interface CalculationInputRequest {
  inputToken: string;
  columnKey: string;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  dataTypeId: number;
  controlTypeId: number;
  displayOrder: number;
  isRequired: boolean;
  isReadOnly?: boolean;
  isVisible: boolean;
}

/** Body for POST /admin/forms/:formId/fields/:fieldId/calculation. */
export interface SetCalculationRequest {
  formulaExpression: string;
  resultColumnKey: string;
  resultLabelEn: string;
  resultLabelAr: string;
  resultPrecision: number;
  resultDataTypeId: number;
  resultControlTypeId: number;
  buttonLabelEn: string;
  buttonLabelAr: string;
  helpTextEn?: string;
  helpTextAr?: string;
  displayFormulaEn?: string;
  displayFormulaAr?: string;
  /** Request body uses `inputs`; response returns `formFieldCalculationInputs`. */
  inputs: CalculationInputRequest[];
}

/** Body for POST /admin/forms/:formId/fields/:fieldId/calculation/inputs. */
export interface AddCalculationInputRequest {
  inputToken: string;
  columnKey: string;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string;
  placeholderAr?: string;
  dataTypeId: number;
  controlTypeId: number;
  displayOrder: number;
  isRequired: boolean;
  isReadOnly?: boolean;
  isVisible: boolean;
}
