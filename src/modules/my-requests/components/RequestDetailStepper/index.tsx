import React, { useEffect, useMemo, useRef, useState } from "react";

import Box from "@mui/material/Box";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ControlKeys } from "../../../../core/enums/control-keys.enum";
import { useLocale } from "../../../../core/hooks/useLocale";
import type {
  FieldValue,
  GetSubmissionDetailsResponse,
} from "../../../../core/types/getSubmissionDetailsResponse";
import { FIELDS_PER_PAGE } from "../../../../core/utils/groupAttributesByPage";
import Header from "../../../new-request/Stepper/Header";
import styles from "../../../new-request/Stepper/Stepper.module.css";
import ViewActions from "./ViewActions";
import ViewContent from "./ViewContent";
import { mapApiStatus } from "../../utils/statusHelpers";
import ApproveConfirmDialog from "./ApproveConfirmDialog";
import RejectConfirmDialog from "./RejectConfirmDialog";
import { useDeviceType } from "../../../../core/hooks/useDeviceType";

interface RequestDetailStepperProps {
  detail: GetSubmissionDetailsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Navigates back to the My Requests list */
  onClose: () => void;
  /** Called when the user clicks Edit — only triggered when canEdit is true */
  onEdit?: (submissionId: number) => void;
  /** Fires on every step change so the parent can track progress (e.g. progress bar) */
  onStepChange?: (current: number, total: number) => void;
}

/**
 * Converts the API's saved fieldValues into react-hook-form defaultValues.
 *
 * - TABLE fields: the fieldArray reads from defaultValues[fieldKey] as an
 *   array of column-keyed objects, matching the shape TableGrid produces.
 * - MULTISELECT fields: RHF expects an array of selected option values.
 * - All other fields: use the scalar string value (or empty string).
 */
const buildDefaultValues = (fields: FieldValue[]): Record<string, unknown> =>
  fields.reduce<Record<string, unknown>>((acc, fv) => {
    if (fv.controlType.controlKey === ControlKeys.Table) {
      acc[fv.fieldKey] = (fv.tableValues ?? []).map((row) => row.columns);
    } else if (fv.controlType.controlKey === ControlKeys.RawTable) {
      // RAW_TABLE RHF shape: { [rowKey]: { [columnKey]: value } }
      const rawTableRows = fv.rawTableValues ?? [];
      acc[fv.fieldKey] = rawTableRows.reduce<Record<string, Record<string, string | number>>>(
        (rowAcc, row) => {
          rowAcc[row.rowKey] = row.columns;
          return rowAcc;
        },
        {},
      );
    } else if (fv.controlType.controlKey === ControlKeys.Multiselect) {
      acc[fv.fieldKey] = fv.multiSelectValues ?? [];
    } else {
      acc[fv.fieldKey] = fv.value ?? "";
    }
    return acc;
  }, {});

const RequestDetailStepper: React.FC<RequestDetailStepperProps> = ({
  detail,
  isLoading,
  isError,
  onClose,
  onEdit,
  onStepChange,
}) => {
  const { t } = useLocale();
  const { i18n } = useTranslation();

  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dialog open states for approve/reject confirmation
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);

  // Derive total page count from the number of field values
  const totalSteps = useMemo<number>(() => {
    if (detail === undefined || detail.fieldValues.length === 0) return 1;
    return Math.ceil(detail.fieldValues.length / FIELDS_PER_PAGE);
  }, [detail]);

  // Build step labels — re-evaluates on language change because t() is reactive
  const steps = useMemo(
    () =>
      Array.from({ length: totalSteps }, (_, i) => ({
        Key: i + 1,
        Title: t("stepper.page", { n: i + 1 }),
        UIViewAlias: null as string | null,
      })),
    // i18n.language is intentionally included so labels update on locale switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalSteps, t, i18n.language]
  );

  const methods = useForm<Record<string, unknown>>({
    defaultValues: detail !== undefined ? buildDefaultValues(detail.fieldValues) : {},
    mode: "onChange",
  });

  // When the submission data loads (async), populate the form with the saved values.
  // A ref guard ensures this only fires once per unique submissionId, not on every re-render.
  const loadedSubmissionIdRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (
      detail !== undefined &&
      loadedSubmissionIdRef.current !== detail.submissionId
    ) {
      loadedSubmissionIdRef.current = detail.submissionId;
      methods.reset(buildDefaultValues(detail.fieldValues));
    }
  }, [detail, methods]);

  // Notify parent whenever the active step or total changes (used for the sidebar progress bar)
  useEffect(() => {
    onStepChange?.(activeStep, totalSteps);
  }, [activeStep, totalSteps, onStepChange]);

  /** Ref attached to the top of the stepper so we can scroll back to it on every step change. */
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  const handleNext = (): void => {
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = (): void => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleApprove = (): void => {
    setApproveOpen(true);
  };

  const handleReject = (): void => {
    setRejectOpen(true);
  };

  // Called by either dialog after a successful API response
  const handleActionSuccess = (): void => {
    setApproveOpen(false);
    setRejectOpen(false);
    // Navigate back to the My Requests list so the user sees the updated status
    onClose();
  };

  return (
    <FormProvider {...methods}>
      {/* A <form> wrapper is needed because the underlying controls use Controller,
          which requires a form context — even though we never submit here. */}
      <form>
        <Box ref={topRef} className={styles.stepperContainer} sx={{ p: isMobile ? 5 : 0 }}>
          <Header activeStep={activeStep} steps={steps} />

          <ViewContent
            activeStep={activeStep}
            formMethods={methods}
            fieldValues={detail?.fieldValues}
            isLoading={isLoading}
            isError={isError}
          />

          <ViewActions
            activeStep={activeStep}
            stepsCount={steps.length}
            onBack={handleBack}
            onNext={handleNext}
            onClose={onClose}
            onApprove={handleApprove}
            onReject={handleReject}
            requestStatus={mapApiStatus(detail?.submissionStatus ?? '')}
          />
        </Box>
      </form>

      {/* Approve / Reject confirmation dialogs — only mounted when submissionId is known */}
      {detail !== undefined && (
        <>
          <ApproveConfirmDialog
            open={approveOpen}
            submissionId={detail.submissionId}
            onClose={() => setApproveOpen(false)}
            onSuccess={handleActionSuccess}
          />

          <RejectConfirmDialog
            open={rejectOpen}
            submissionId={detail.submissionId}
            onClose={() => setRejectOpen(false)}
            onSuccess={handleActionSuccess}
          />
        </>
      )}
    </FormProvider>
  );
};

export default RequestDetailStepper;
