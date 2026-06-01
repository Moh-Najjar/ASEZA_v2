// Nested data-type descriptor (e.g. INTEGER, DECIMAL, STRING)
export interface DataType {
  dataTypeId: number;
  typeKey: string;
  typeName: string;
}

// Nested control-type descriptor (e.g. NUMBER, DROPDOWN, TABLE)
export interface ControlType {
  controlTypeId: number;
  controlKey: string;
  controlName: string;
}

// Lookup type reference attached to DROPDOWN / multi-select fields
export interface LookupType {
  lookupTypeId: number;
  code: string;
  nameEn: string;
  nameAr: string;
}

// Column definition used by TABLE/Grid control fields
export interface TableColumn {
  columnKey: string;
  labelEn: string;
  labelAr: string;
  dataType: DataType;
  controlType: ControlType;
  lookupType: LookupType | null;
}

// A single row inside a TABLE control field value
export interface TableValueRow {
  rowIndex: number;
  columns: Record<string, string | number>;
}

// Shape of each entry inside the fieldValues array
export interface FieldValue {
  fieldId: number;
  formId: number;
  fieldKey: string;
  labelEn: string;
  labelAr: string;
  dataType: DataType;
  controlType: ControlType;
  isRequired: boolean;
  displayOrder: number;
  isReadOnly: boolean;
  isVisible: boolean;
  lookupType: LookupType | null;
  placeholderEn: string;
  placeholderAr: string;
  helpTextEn: string;
  helpTextAr: string;
  regexPattern: string | null;
  validationMessageEn: string | null;
  validationMessageAr: string | null;
  columns: TableColumn[] | null;
  value: string | null;
  multiSelectValues: string[] | null;
  tableValues: TableValueRow[] | null;
  kpiNextSubmissionDateEn: string | null;
  kpiNextSubmissionDateAr: string | null;
}

// Full response returned by GET /submissions/:submissionId
export interface GetSubmissionDetailsResponse {
  submissionId: number;
  referenceNumber: string;
  formId: number;
  formNameEn: string;
  formNameAr: string;
  directorateId: number;
  directorateNameEn: string;
  directorateNameAr: string;
  reportingDate: string;
  submissionStatus: string;
  periodYear: number;
  periodMonth: number;
  kpiId: number;
  notes: string | null;
  createdAt: string;
  enteredByUserId: number;
  enteredByUserName: string;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByUserId: number | null;
  approvedByUserName: string | null;
  rejectionReason: string | null;
  fieldValues: FieldValue[];
}
