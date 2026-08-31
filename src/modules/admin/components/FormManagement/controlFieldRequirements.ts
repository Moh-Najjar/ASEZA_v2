import { ControlKeys } from '../../../../core/enums/control-keys.enum';
import type { ControlType, DataType } from '../../../../core/types/admin/adminLookups';

/** UI / validation rules for each admin form control type. */
export interface ControlFieldRequirements {
  controlKey: string;
  /** Short admin hint shown when this control is selected. */
  hint: string;
  requiresLookup: boolean;
  requiresCalculation: boolean;
  requiresTableColumns: boolean;
  requiresTableRows: boolean;
  supportsRawTableRowLabels: boolean;
  showValidationSection: boolean;
  showNumericValidation: boolean;
  showLengthValidation: boolean;
  showRegexValidation: boolean;
  /** When false, the validation-message EN/AR fields are hidden. */
  showValidationMessages: boolean;
  showContentHelpSection: boolean;
  showPlaceholder: boolean;
  /** Help text EN/AR shown inside the Validation section (used by table controls). */
  showHelpTextInValidation: boolean;
  showDefaultValue: boolean;
  showKpiField: boolean;
  showAdvancedSection: boolean;
  forceReadOnly: boolean;
  forceOptional: boolean;
  lockDataType: boolean;
  suggestedDataTypeKey: string | null;
}

const baseRequirements = (
  controlKey: string,
  overrides: Partial<ControlFieldRequirements>,
): ControlFieldRequirements => ({
  controlKey,
  hint: 'Configure the basic field properties below.',
  requiresLookup: false,
  requiresCalculation: false,
  requiresTableColumns: false,
  requiresTableRows: false,
  supportsRawTableRowLabels: false,
  showValidationSection: true,
  showNumericValidation: false,
  showLengthValidation: true,
  showRegexValidation: true,
  showValidationMessages: true,
  showContentHelpSection: true,
  showPlaceholder: true,
  showHelpTextInValidation: false,
  showDefaultValue: true,
  showKpiField: true,
  showAdvancedSection: true,
  forceReadOnly: false,
  forceOptional: false,
  lockDataType: false,
  suggestedDataTypeKey: null,
  ...overrides,
});

/** Requirement map keyed by controlKey from the lookups API. */
export const CONTROL_FIELD_REQUIREMENTS: Record<string, ControlFieldRequirements> = {
  [ControlKeys.Text]: baseRequirements(ControlKeys.Text, {
    hint: 'Single-line text input. Supports length and regex validation.',
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Number]: baseRequirements(ControlKeys.Number, {
    hint: 'Numeric input. Use min/max value rules and an input pattern as needed.',
    showNumericValidation: true,
    showLengthValidation: false,
    showRegexValidation: true,
    suggestedDataTypeKey: 'NUMBER',
  }),
  [ControlKeys.Textarea]: baseRequirements(ControlKeys.Textarea, {
    hint: 'Multi-line text input. Supports length validation.',
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Datepicker]: baseRequirements(ControlKeys.Datepicker, {
    hint: 'Date picker input.',
    showLengthValidation: false,
    showRegexValidation: false,
    showDefaultValue: false,
    suggestedDataTypeKey: 'DATE',
  }),
  [ControlKeys.Dropdown]: baseRequirements(ControlKeys.Dropdown, {
    hint: 'Single-select list. A lookup type is required — options come from the lookup.',
    requiresLookup: true,
    showDefaultValue: false,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Checkbox]: baseRequirements(ControlKeys.Checkbox, {
    hint: 'Boolean checkbox. Usually optional with BOOLEAN data type.',
    showValidationSection: false,
    showPlaceholder: false,
    showDefaultValue: false,
    forceOptional: true,
    suggestedDataTypeKey: 'BOOLEAN',
  }),
  [ControlKeys.Radio]: baseRequirements(ControlKeys.Radio, {
    hint: 'Single choice from a lookup list. A lookup type is required.',
    requiresLookup: true,
    showDefaultValue: false,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.FileUpload]: baseRequirements(ControlKeys.FileUpload, {
    hint: 'File upload control.',
    showValidationSection: false,
    showDefaultValue: false,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Multiselect]: baseRequirements(ControlKeys.Multiselect, {
    hint: 'Multi-select list. A lookup type is required — options come from the lookup.',
    requiresLookup: true,
    showDefaultValue: false,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Table]: baseRequirements(ControlKeys.Table, {
    hint: 'Dynamic table/grid. Set help text below, then add columns on the field card.',
    requiresTableColumns: true,
    showValidationSection: true,
    showLengthValidation: false,
    showRegexValidation: false,
    showValidationMessages: false,
    showContentHelpSection: false,
    showPlaceholder: false,
    showHelpTextInValidation: true,
    showAdvancedSection: false,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Percentage]: baseRequirements(ControlKeys.Percentage, {
    hint: 'Percentage input (0–100). Use min/max value rules and an input pattern as needed.',
    showNumericValidation: true,
    showLengthValidation: false,
    showRegexValidation: true,
    suggestedDataTypeKey: 'NUMBER',
  }),
  [ControlKeys.RawTable]: baseRequirements(ControlKeys.RawTable, {
    hint: 'Fixed row/column grid. Set help text below, then configure columns and rows on the field card.',
    requiresTableColumns: true,
    requiresTableRows: true,
    supportsRawTableRowLabels: true,
    showValidationSection: true,
    showLengthValidation: false,
    showRegexValidation: false,
    showValidationMessages: false,
    showContentHelpSection: false,
    showPlaceholder: false,
    showHelpTextInValidation: true,
    showAdvancedSection: false,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.Label]: baseRequirements(ControlKeys.Label, {
    hint: 'Read-only display text. Use placeholder EN/AR as the visible label text.',
    showValidationSection: false,
    showDefaultValue: false,
    showKpiField: false,
    showAdvancedSection: false,
    forceReadOnly: true,
    forceOptional: true,
    suggestedDataTypeKey: 'TEXT',
  }),
  [ControlKeys.CalculatedField]: baseRequirements(ControlKeys.CalculatedField, {
    hint: 'Formula-based field. Configure inputs, formula, and result below.',
    requiresCalculation: true,
    showValidationSection: false,
    showContentHelpSection: false,
    showAdvancedSection: false,
    forceReadOnly: true,
    lockDataType: true,
    suggestedDataTypeKey: 'NUMBER',
  }),
};

export const resolveControlType = (
  controlTypeId: number,
  controlTypes: ControlType[],
): ControlType | undefined =>
  controlTypes.find((controlType) => controlType.controlTypeId === controlTypeId);

export const getControlRequirements = (
  controlTypeId: number | '',
  controlTypes: ControlType[],
): ControlFieldRequirements | null => {
  if (controlTypeId === '') {
    return null;
  }
  const controlType = resolveControlType(controlTypeId, controlTypes);
  if (controlType === undefined) {
    return null;
  }
  return CONTROL_FIELD_REQUIREMENTS[controlType.controlKey] ?? null;
};

export const resolveSuggestedDataTypeId = (
  requirements: ControlFieldRequirements | null,
  dataTypes: DataType[],
): number | '' => {
  if (requirements === null || requirements.suggestedDataTypeKey === null) {
    return '';
  }
  const match = dataTypes.find((dataType) => dataType.typeKey === requirements.suggestedDataTypeKey);
  return match?.dataTypeId ?? '';
};

export const formatControlTypeLabel = (
  controlTypeId: number,
  controlTypes: ControlType[],
): string => {
  const controlType = resolveControlType(controlTypeId, controlTypes);
  if (controlType === undefined) {
    return `Control #${controlTypeId}`;
  }
  return `${controlType.controlName} (#${controlTypeId})`;
};

export const isLookupRequired = (
  controlTypeId: number | '',
  controlTypes: ControlType[],
): boolean => {
  const requirements = getControlRequirements(controlTypeId, controlTypes);
  return requirements?.requiresLookup ?? false;
};

export const isCalculatedControlType = (
  controlTypeId: number | '',
  controlTypes: ControlType[],
): boolean => {
  const requirements = getControlRequirements(controlTypeId, controlTypes);
  return requirements?.requiresCalculation ?? false;
};
