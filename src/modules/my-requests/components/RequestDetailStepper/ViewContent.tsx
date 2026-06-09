import React, { useMemo } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { UseFormReturn } from "react-hook-form";

import { getControlKey, getControlType } from "../../../../core/utils/control.utils";
import { groupAttributesByPage } from "../../../../core/utils/groupAttributesByPage";
import type { FormField } from "../../../../core/types/FormField";
import type { FieldValue } from "../../../../core/types/getSubmissionDetailsResponse";
import { fieldValueToFormField } from "../../utils/fieldValueToFormField";
import styles from "../../../new-request/Stepper/Stepper.module.css";

interface ViewContentProps {
  activeStep: number;
  formMethods: UseFormReturn<Record<string, unknown>>;
  /** The saved field values from the submission detail API response */
  fieldValues: FieldValue[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

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
    return groupAttributesByPage(fieldValues.map(fieldValueToFormField));
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
