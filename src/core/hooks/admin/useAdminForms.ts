import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllFormsApi,
  getFormByIdApi,
  createFormApi,
  updateFormApi,
  deactivateFormApi,
  addFieldApi,
  updateFieldApi,
  removeFieldApi,
  addOptionApi,
  removeOptionApi,
  addDependencyApi,
  removeDependencyApi,
  addColumnApi,
  removeColumnApi,
  addRowApi,
  removeRowApi,
  setCalculationApi,
  removeCalculationApi,
  addCalculationInputApi,
  removeCalculationInputApi,
} from '../../api/admin/adminForms';
import type {
  CreateFormRequest,
  UpdateFormRequest,
  AddFieldRequest,
  UpdateFieldRequest,
  AddOptionRequest,
  AddDependencyRequest,
  AddColumnRequest,
  AddRowRequest,
  SetCalculationRequest,
  AddCalculationInputRequest,
} from '../../types/admin/adminForms';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const ADMIN_FORMS_QUERY_KEY = 'admin-forms';
export const ADMIN_FORM_DETAIL_QUERY_KEY = 'admin-form-detail';

// ─── Queries ──────────────────────────────────────────────────────────────────

/** All forms including inactive. */
export const useAdminForms = () =>
  useQuery({
    queryKey: [ADMIN_FORMS_QUERY_KEY],
    queryFn: getAllFormsApi,
  });

/** Single form with all fields and sub-relations. */
export const useAdminFormDetail = (formId: number) =>
  useQuery({
    queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, formId],
    queryFn: () => getFormByIdApi(formId),
    enabled: formId > 0,
  });

// ─── Form mutations ───────────────────────────────────────────────────────────

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormRequest) => createFormApi(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_FORMS_QUERY_KEY] });
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, data }: { formId: number; data: UpdateFormRequest }) =>
      updateFormApi(formId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_FORMS_QUERY_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useDeactivateForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formId: number) => deactivateFormApi(formId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_FORMS_QUERY_KEY] });
    },
  });
};

// ─── Field mutations ──────────────────────────────────────────────────────────

export const useAddField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, data }: { formId: number; data: AddFieldRequest }) =>
      addFieldApi(formId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: UpdateFieldRequest;
    }) => updateFieldApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, fieldId }: { formId: number; fieldId: number }) =>
      removeFieldApi(formId, fieldId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

// ─── Option mutations ─────────────────────────────────────────────────────────

export const useAddOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: AddOptionRequest;
    }) => addOptionApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      optionId,
    }: {
      formId: number;
      fieldId: number;
      optionId: number;
    }) => removeOptionApi(formId, fieldId, optionId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

// ─── Dependency mutations ─────────────────────────────────────────────────────

export const useAddDependency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: AddDependencyRequest;
    }) => addDependencyApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveDependency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      dependencyId,
    }: {
      formId: number;
      fieldId: number;
      dependencyId: number;
    }) => removeDependencyApi(formId, fieldId, dependencyId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

// ─── Column mutations ─────────────────────────────────────────────────────────

export const useAddColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: AddColumnRequest;
    }) => addColumnApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      columnId,
    }: {
      formId: number;
      fieldId: number;
      columnId: number;
    }) => removeColumnApi(formId, fieldId, columnId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

// ─── Row mutations ────────────────────────────────────────────────────────────

export const useAddRow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: AddRowRequest;
    }) => addRowApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveRow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      rowId,
    }: {
      formId: number;
      fieldId: number;
      rowId: number;
    }) => removeRowApi(formId, fieldId, rowId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

// ─── Calculation mutations ────────────────────────────────────────────────────

export const useSetCalculation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: SetCalculationRequest;
    }) => setCalculationApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveCalculation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, fieldId }: { formId: number; fieldId: number }) =>
      removeCalculationApi(formId, fieldId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useAddCalculationInput = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      data,
    }: {
      formId: number;
      fieldId: number;
      data: AddCalculationInputRequest;
    }) => addCalculationInputApi(formId, fieldId, data),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};

export const useRemoveCalculationInput = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formId,
      fieldId,
      inputId,
    }: {
      formId: number;
      fieldId: number;
      inputId: number;
    }) => removeCalculationInputApi(formId, fieldId, inputId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_FORM_DETAIL_QUERY_KEY, variables.formId],
      });
    },
  });
};
