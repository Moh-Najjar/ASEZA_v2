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
import { useTranslation } from "react-i18next";


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
  const { t } = useTranslation();

  const handleNext = async () => {
    const isValid = await formMethods.trigger();

    if (isValid) {
      if (activeStep < pages.length - 1) {
        setActiveStep((prev) => prev + 1);
      }
      // Final step submission is driven by the form's onSubmit → handleSubmit below.
    } else {
      // Errors are already displayed inline by react-hook-form;
      // a toast can be added here if a summary notification is needed.
      const { errors } = formMethods.formState;

      // Scroll to the first error
      const firstError = Object.entries(errors).find(([field, error]) => error?.type === "required" || error?.type === "pattern");

      if (firstError) {
        const fieldElement = document.getElementById(firstError[0]);
        fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Show errors in toast
      // Object.entries(errors).forEach(([field, error]) => {
      //   if (error?.type === "required") {
      //     toast.error(`${field} is required`);
      //   }
      //   if (error?.type === "pattern") {
      //     toast.error(`${field} should match the pattern ${error.message}`);
      //   }
      // });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const checkIfAllFieldsHaveNextSubmissionDate = async () => {
    return formFieldsData.every(field => field.kpiNextSubmissionDateEn !== null && field.kpiNextSubmissionDateAr !== null);
  };

  /**
   * Called by React Hook Form's `handleSubmit` wrapper, so `formData` has
   * already been validated. Maps the raw field values to the API request
   * shape and fires the mutation.
   *
   * TODO: Replace stub meta values with real data from auth context /
   *       period selector once those features are wired up.
   */
  const handleSubmit = async (formData: Record<string, unknown>) => {

    const request: SubmitFormRequest = {
      formId: 14,
      directorateId: 14,
      reportingDate: new Date().toISOString().split('T')[0],
      periodYear: new Date().getFullYear(),
      periodMonth: new Date().getMonth() + 1,
      kpiId: null,
      notes: '',
      fieldValues: mapFormDataToFieldValues(formData),
    };

    const allFieldsHaveNextSubmissionDate = await checkIfAllFieldsHaveNextSubmissionDate();
    if (allFieldsHaveNextSubmissionDate) {
      toast.info(t('validation.waitNextSubmissionDate')); 
      void queryClient.invalidateQueries({ queryKey: [FORM_FIELDS_QUERY_KEY] });
      setActiveStep(0);
      return;
    }

    submitForm(request, {
      onSuccess: () => {
        // Invalidate the my-submissions cache so the list refetches
        // immediately when the user lands on the my-requests page.
        void queryClient.invalidateQueries({ queryKey: [MY_SUBMISSIONS_QUERY_KEY] });
        void queryClient.invalidateQueries({ queryKey: [FORM_FIELDS_QUERY_KEY] });
        setIsSuccessDialogOpen(true);
      }
    });
  };

  /** Closes the success dialog and navigates to the home page */
  const handleSuccessDialogConfirm = () => {
    setIsSuccessDialogOpen(false);
    navigate('/my-requests');
  };

  return {
    activeStep,
    handleNext,
    handleBack,
    handleSubmit,
    isSubmitting,
    isSuccessDialogOpen,
    handleSuccessDialogConfirm,
  };
};
