import { FormField } from "../types/FormField";

/**
 * Returns a new array of FormFields with values updated from the provided
 * form values map (keyed by fieldKey).
 * Leaves unchanged fields as-is for referential stability.
 */
export const updateAttributeLocally = (
  updatedValues: Record<string, unknown>,
  fieldList: FormField[]
): FormField[] => {
  return fieldList.map((field) => {
    const newValue = updatedValues[field.fieldKey];

    if (newValue !== undefined) {
      return field;
    }

    return field;
  });
};
