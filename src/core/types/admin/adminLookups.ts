/** A control type entry (e.g. TEXTBOX, DROPDOWN, TABLE, CALCULATED). */
export interface ControlType {
  controlTypeId: number;
  controlKey: string;
  controlName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

/** A data type entry (e.g. TEXT, NUMBER, DATE, BOOLEAN). */
export interface DataType {
  dataTypeId: number;
  typeKey: string;
  typeName: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

/** A lookup type category (e.g. GENDER, NATIONALITY). */
export interface LookupType {
  lookupTypeId: number;
  code: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

/** A specific value within a lookup type (e.g. MALE, FEMALE). */
export interface LookupValue {
  lookupValueId: number;
  code: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

/** A frequency entry (e.g. DAILY, WEEKLY, MONTHLY, ANNUALLY). */
export interface Frequency {
  frequencyId: number;
  code: string;
  nameEn: string;
  nameAr: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}
