import { groupAttributesByPage } from "../../../core/utils/groupAttributesByPage";
import { getControlKey, getControlType } from "../../../core/utils/control.utils";
import { FormField } from "../../../core/types/FormField";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import styles from "./Stepper.module.css";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useDeviceType } from "../../../core/hooks/useDeviceType";
import { useLocale } from "../../../core/hooks/useLocale";

/** Field augmented with the latest value from react-hook-form watch (for consumers that read _currentValue). */
type TrackedFormField = FormField & { _currentValue?: unknown };

interface ContentProps {
  activeStep: number;
  formMethods: UseFormReturn<Record<string, unknown>>;
  /** Form field definitions fetched by the parent Stepper. */
  formFieldsData: FormField[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}

const Content: React.FC<ContentProps> = ({
  activeStep,
  formMethods,
  formFieldsData,
  isLoading,
  isError,
  isSuccess,
  error,
}) => {
  const { t } = useLocale();
  const { watch } = formMethods;

  // Group the flat API list into stepper pages (same layout rules as before).
  const groupedFields = useMemo((): Record<number, FormField[]> => {
    if (formFieldsData === undefined || formFieldsData.length === 0) {
      return {};
    }
    return groupAttributesByPage(formFieldsData);
  }, [formFieldsData]);

  // 1-indexed pages: activeStep is 0-based, so use activeStep + 1.
  const pageFields: FormField[] = groupedFields[activeStep + 1] ?? [];

  // Local copy of fields merged with live form values for tracking/debug output.
  const [fieldList, setFieldList] = useState<TrackedFormField[]>([]);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const prevValuesRef = useRef<Record<string, unknown>>({});

  // When the step or the loaded field definitions change, reset tracking to the server list.
  useEffect(() => {
    if (formFieldsData === undefined) {
      setFieldList([]);
      return;
    }
    setFieldList(formFieldsData.map((field) => ({ ...field })));
  }, [activeStep, formFieldsData]);

  // Subscribe to all form values and merge them into fieldList when something actually changes.
  useEffect(() => {
    if (formFieldsData === undefined) {
      return;
    }

    const fieldsSource = formFieldsData;

    subscriptionRef.current = watch((value) => {
      // Skip if the value reference is identical (no real change).
      if (prevValuesRef.current === value) {
        return;
      }

      // Detect whether at least one field value actually changed.
      const hasChanged = Object.keys(value).some(
        (key) =>
          value[key] != null &&
          value[key] !== undefined &&
          prevValuesRef.current[key] !== value[key]
      );

      if (!hasChanged) {
        return;
      }

      prevValuesRef.current = value as Record<string, unknown>;

      // Merge current form values into the field list for local tracking.
      const updatedFields: TrackedFormField[] = fieldsSource.map((field) => {
        const currentValue = value[field.fieldKey];
        if (currentValue !== undefined) {
          return { ...field, _currentValue: currentValue };
        }
        return { ...field };
      });

      //console.log("updatedFields", updatedFields);
      setFieldList(updatedFields);
    });

    return () => subscriptionRef.current?.unsubscribe();
  }, [watch, activeStep, formFieldsData]);

  if (isLoading) {
    return (
      <Box
        className={styles.stepperContent}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress aria-label={t("stepper.loadingFormFields")} />
      </Box>
    );
  }

  if (formFieldsData?.length === 0 || !isSuccess) {
    return (
      <Box className={styles.stepperContent} role="alert">
        <Typography textAlign="center" color="primary">
          {t("stepper.noFormFields")}
        </Typography>
      </Box>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : t("stepper.loadFormFieldsError");
    return (
      <Box className={styles.stepperContent} role="alert">
        <Typography color="error">{message}</Typography>
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

        if (!Component) {
          return null;
        }

        // Prefer the locally tracked field (may include _currentValue from watch).
        const trackedField =
          fieldList.find((f) => f.fieldId === field.fieldId) ?? field;

        return (
          <Component
            key={field.fieldId}
            formField={trackedField}
            formMethods={formMethods}
          />
        );
      })}
    </Box>
  );
};

export default Content;
