import React, { useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

import { useStepper } from "../../../core/hooks/useStepper";
import { useLocale } from "../../../core/hooks/useLocale";
import { useFormFields } from "../../../core/hooks/useFormApi";
import { FIELDS_PER_PAGE } from "../../../core/utils/groupAttributesByPage";
import SubmissionSuccessDialog from "../../shared/SubmissionSuccessDialog";
import Content from "./Content";
import Actions from "./Actions";
import Header from "./Header";
import styles from "./Stepper.module.css";
import { useDeviceType } from "../../../core/hooks/useDeviceType";

interface StepperProps {
  onStepChange?: (step: number, total: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ onStepChange }) => {
  const { t } = useLocale();
  const { i18n } = useTranslation();

  // Fetch form field definitions here so totalSteps can be derived from real API data.
  const { data: formFieldsData, isError, error, isLoading, isSuccess } = useFormFields();
  /** Total number of stepper pages — derived from the live API response. */
  const totalSteps = useMemo(
    () =>
      formFieldsData !== undefined && formFieldsData.length > 0
        ? Math.ceil(formFieldsData.length / FIELDS_PER_PAGE)
        : 0,
    [formFieldsData]
  );

  const methods = useForm<Record<string, unknown>>({
    mode: "onChange",
  });

  /**
   * Re-trigger ONLY fields that already have visible errors whenever the
   * language changes, so their messages are re-evaluated in the new locale.
   *
   * Calling methods.trigger() without arguments would validate every field —
   * including untouched ones — which makes validation messages appear as if
   * the form had been submitted. By scoping the trigger to fields that already
   * carry an error we preserve the current validation state while updating the
   * error text to the newly selected language.
   *
   * Comparing against the stored previous language value (rather than using
   * a "first render" flag) makes this StrictMode-safe: effects running twice
   * on mount will find the language unchanged and skip the trigger both times.
   */
  const prevLanguageRef = useRef(i18n.language);
  useEffect(() => {
    if (prevLanguageRef.current === i18n.language) return;
    prevLanguageRef.current = i18n.language;

    const fieldsWithErrors = Object.keys(methods.formState.errors) as Array<
      keyof Record<string, unknown>
    >;

    if (fieldsWithErrors.length > 0) {
      void methods.trigger(fieldsWithErrors);
    }
  }, [i18n.language, methods]);

  /**
   * Build page titles inside the component so they re-evaluate
   * whenever the language changes (t() is reactive to i18n.language).
   */
  const attributePagesTitles = useMemo(
    () =>
      Array.from({ length: totalSteps }, (_, i) => ({
        Key: i + 1,
        Title: t("stepper.page", { n: i + 1 }),
        UIViewAlias: null as string | null,
      })),
    [totalSteps, t]
  );

  const {
    activeStep,
    handleNext,
    handleBack,
    handleSubmit,
    isSuccessDialogOpen,
    handleSuccessDialogConfirm,
  } = useStepper(attributePagesTitles, methods, formFieldsData ?? []);

  useEffect(() => {
    onStepChange?.(activeStep, totalSteps);
  }, [activeStep, totalSteps, onStepChange]);

  /** Ref attached to the top of the stepper so we can scroll back to it on every step change. */
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <>
      <SubmissionSuccessDialog
        open={isSuccessDialogOpen}
        onConfirm={handleSuccessDialogConfirm}
      />
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box ref={topRef} className={styles.stepperContainer} sx={{ p: isMobile ? 5 : 0 }}>
            <Header activeStep={activeStep} steps={attributePagesTitles} />
            <Content
              activeStep={activeStep}
              formMethods={methods}
              formFieldsData={formFieldsData}
              isLoading={isLoading}
              isError={isError}
              isSuccess={isSuccess}
              error={error instanceof Error ? error : null}
            />
            <Actions
              activeStep={activeStep}
              stepsCount={attributePagesTitles.length}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={methods.handleSubmit(handleSubmit)}
            />
          </Box>
        </form>
      </FormProvider>
    </>
  );
};

export default Stepper;
