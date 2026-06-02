/** Control key identifiers that match the controlType.controlKey values in formData-v1.json */
export const ControlKeys = {
  Number: 'NUMBER',
  Percentage: 'PERCENTAGE',
  Datepicker: 'DATEPICKER',
  Dropdown: 'DROPDOWN',
  Multiselect: 'MULTISELECT',
  Table: 'TABLE',
  Text: 'TEXT',
  RawTable: 'RAW_TABLE',
  Label: 'LABEL',
  CalculatedField: 'CALCULATED_FIELD',
} as const;

/** Union type derived from the ControlKeys object values */
export type ControlKeys = (typeof ControlKeys)[keyof typeof ControlKeys];
