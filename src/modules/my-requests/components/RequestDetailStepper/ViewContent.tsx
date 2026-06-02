import React, { useMemo } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { UseFormReturn } from "react-hook-form";

import { getControlKey, getControlType } from "../../../../core/utils/control.utils";
import { groupAttributesByPage } from "../../../../core/utils/groupAttributesByPage";
import type { ColumnDef, FormField } from "../../../../core/types/FormField";
import type { FieldValue } from "../../../../core/types/getSubmissionDetailsResponse";
import styles from "../../../new-request/Stepper/Stepper.module.css";

interface ViewContentProps {
  activeStep: number;
  formMethods: UseFormReturn<Record<string, unknown>>;
  /** The saved field values from the submission detail API response */
  fieldValues: FieldValue[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Maps a FieldValue (submission detail) to a FormField (control schema).
 *
 * FieldValue and FormField share identical nested shapes for dataType, controlType,
 * lookupType, and columns — only their TypeScript interface names differ. Each
 * object is constructed explicitly so TypeScript can verify structural compatibility
 * without any casting.
 *
 * isReadOnly is forced to true so every control renders in disabled/read-only mode.
 */
const toFormField = (fv: FieldValue): FormField => ({
  fieldId: fv.fieldId,
  formId: fv.formId,
  fieldKey: fv.fieldKey,
  labelEn: fv.labelEn,
  labelAr: fv.labelAr,
  dataType: {
    dataTypeId: fv.dataType.dataTypeId,
    typeKey: fv.dataType.typeKey,
    typeName: fv.dataType.typeName,
  },
  controlType: {
    controlTypeId: fv.controlType.controlTypeId,
    controlKey: fv.controlType.controlKey,
    controlName: fv.controlType.controlName,
  },
  isRequired: fv.isRequired,
  displayOrder: fv.displayOrder,
  isReadOnly: fv.isReadOnly,
  isVisible: fv.isVisible,
  lookupType:
    fv.lookupType !== null
      ? {
          lookupTypeId: fv.lookupType.lookupTypeId,
          code: fv.lookupType.code,
          nameEn: fv.lookupType.nameEn,
          nameAr: fv.lookupType.nameAr,
        }
      : null,
  placeholderEn: fv.placeholderEn,
  placeholderAr: fv.placeholderAr,
  helpTextEn: fv.helpTextEn,
  helpTextAr: fv.helpTextAr,
  columns:
    fv.columns !== null
      ? fv.columns.map(
          (col): ColumnDef => ({
            columnKey: col.columnKey,
            labelEn: col.labelEn,
            labelAr: col.labelAr,
            dataType: {
              dataTypeId: col.dataType.dataTypeId,
              typeKey: col.dataType.typeKey,
              typeName: col.dataType.typeName,
            },
            controlType: {
              controlTypeId: col.controlType.controlTypeId,
              controlKey: col.controlType.controlKey,
              controlName: col.controlType.controlName,
            },
            lookupType:
              col.lookupType !== null
                ? {
                    lookupTypeId: col.lookupType.lookupTypeId,
                    code: col.lookupType.code,
                    nameEn: col.lookupType.nameEn,
                    nameAr: col.lookupType.nameAr,
                  }
                : null,
          })
        )
      : null,
  rows: null,
  grid: null,
  rowLabelEn: null,
  rowLabelAr: null,
  regexPattern: fv.regexPattern,
  validationMessageEn: fv.validationMessageEn,
  validationMessageAr: fv.validationMessageAr,
  kpiNextSubmissionDateEn: fv.kpiNextSubmissionDateEn,
  kpiNextSubmissionDateAr: fv.kpiNextSubmissionDateAr,
  calculation: null,
});

const ViewContent: React.FC<ViewContentProps> = ({
  activeStep,
  formMethods,
  fieldValues,
  isLoading,
  isError,
}) => {
  const groupedFields = useMemo((): Record<number, FormField[]> => {
    if (fieldValues === undefined || fieldValues.length === 0) {
      return {};
    }
    return groupAttributesByPage(fieldValues.map(toFormField));
  }, [fieldValues]);

  // activeStep is 0-based; groupAttributesByPage uses 1-based keys
  const pageFields: FormField[] = groupedFields[activeStep + 1] ?? [];

  if (isLoading) {
    return (
      <Box
        className={styles.stepperContent}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress aria-label="Loading submission details" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className={styles.stepperContent} role="alert">
        <Typography color="error">Failed to load submission details.</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.stepperContent}>
      {pageFields.map((field) => {
        if (!field.isVisible) {
          return null;
        }

        const controlKey = getControlKey(field);
        const Component = getControlType(controlKey);

        if (Component === undefined) {
          return null;
        }

        return (
          <Component
            key={field.fieldId}
            formField={field}
            formMethods={formMethods}
            hideHelperText={true}
          />
        );
      })}
    </Box>
  );
};

export default ViewContent;
