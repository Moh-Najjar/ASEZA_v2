import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSubmitForm, MY_SUBMISSIONS_QUERY_KEY, FORM_FIELDS_QUERY_KEY } from "./useFormApi";
import { SubmitFormRequest } from "../types/submitFormRequest";
import { mapFormDataToFieldValues } from "../utils/formDataMapper";
import { FormField } from "../types/FormField";
import { useLocale } from "./useLocale";
import { groupAttributesByPage } from "../utils/groupAttributesByPage";
import {
  applyValidationIssues,
  collectPageFieldKeys,
  validateAllFormFields,
} from "../utils/validateAllFormFields";
import { useAuth } from "../context/AuthContext";

interface StepperPage {
  Key: number;
  Title: string;
  UIViewAlias: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useStepper = (
  pages: StepperPage[],
  formMethods: UseFormReturn<Record<string, unknown>>,
  formFieldsData: FormField[]
) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: submitForm, isPending: isSubmitting } = useSubmitForm();
  const { t, loc } = useLocale();
  const { authSession } = useAuth();

  /** Number of data-entry pages (excludes the review step) */
  const dataStepCount = pages.length - 1;
  /** 0-based index of the review & confirm step */
  const reviewStepIndex = pages.length - 1;

  /** Scrolls to the first field with a validation error */
  const scrollToFirstError = (): void => {
    const { errors } = formMethods.formState;
    const firstError = Object.entries(errors).find(
      ([, error]) => error?.type === "required" || error?.type === "pattern" || error?.type === "manual"
    );

    if (firstError !== undefined) {
      const fieldElement = document.getElementById(firstError[0]);
      fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  /** Returns the fields belonging to the given 0-based data step index */
  const getPageFields = (stepIndex: number): FormField[] => {
    const grouped = groupAttributesByPage(formFieldsData);
    return grouped[stepIndex + 1] ?? [];
  };

  const handleNext = async (): Promise<void> => {
    const formValues = formMethods.getValues();
    const pageFields = getPageFields(activeStep);
    const pageKeys = collectPageFieldKeys(pageFields, formValues, loc);

    if (activeStep < dataStepCount - 1) {
      const isValid =
        pageKeys.length === 0
          ? true
          : await formMethods.trigger(pageKeys as never);

      if (isValid) {
        setActiveStep((prev) => prev + 1);
      } else {
        scrollToFirstError();
      }
      return;
    }

    if (activeStep === dataStepCount - 1) {
      const isCurrentPageValid =
        pageKeys.length === 0
          ? true
          : await formMethods.trigger(pageKeys as never);

      const allIssues = validateAllFormFields(formFieldsData, formValues, loc, t);

      if (!isCurrentPageValid || allIssues.length > 0) {
        applyValidationIssues(formMethods, allIssues);
        scrollToFirstError();
        return;
      }

      setActiveStep(reviewStepIndex);
    }
  };

  const handleBack = (): void => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  /** Navigates to a specific data step — used by Edit buttons on the review screen */
  const handleGoToStep = (stepIndex: number): void => {
    if (stepIndex >= 0 && stepIndex < dataStepCount) {
      setActiveStep(stepIndex);
    }
  };

  const checkIfAllFieldsHaveNextSubmissionDate = async (): Promise<boolean> => {
    return formFieldsData.every(
      (field) =>
        field.kpiNextSubmissionDateEn !== null &&
        field.kpiNextSubmissionDateAr !== null
    );
  };

  /**
   * Called by React Hook Form's `handleSubmit` wrapper from the review step only.
   * Maps the raw field values to the API request shape and fires the mutation.
   */
  const handleSubmit = async (formData: Record<string, unknown>): Promise<void> => {
    const request: SubmitFormRequest = {
      formId: authSession?.kpiFormId ?? 0,
      directorateId: authSession?.directorateId ?? 0,
      reportingDate: new Date().toISOString().split("T")[0],
      periodYear: new Date().getFullYear(),
      periodMonth: new Date().getMonth() + 1,
      kpiId: null,
      notes: "",
      fieldValues: mapFormDataToFieldValues(formData, formFieldsData),
    };

    console.log(request);

    const allFieldsHaveNextSubmissionDate =
      await checkIfAllFieldsHaveNextSubmissionDate();

    if (allFieldsHaveNextSubmissionDate) {
      toast.info(t("validation.waitNextSubmissionDate"));
      void queryClient.invalidateQueries({ queryKey: [FORM_FIELDS_QUERY_KEY] });
      setActiveStep(0);
      return;
    }

    submitForm(request, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: [MY_SUBMISSIONS_QUERY_KEY] });
        void queryClient.invalidateQueries({ queryKey: [FORM_FIELDS_QUERY_KEY] });
        setIsSuccessDialogOpen(true);
      },
    });
  };

  /** Closes the success dialog and navigates to the my-requests page */
  const handleSuccessDialogConfirm = (): void => {
    setIsSuccessDialogOpen(false);
    navigate("/my-requests", { replace: true });
  };


  return {
    activeStep,
    dataStepCount,
    reviewStepIndex,
    handleNext,
    handleBack,
    handleGoToStep,
    handleSubmit,
    isSubmitting,
    isSuccessDialogOpen,
    handleSuccessDialogConfirm,
  };
};
