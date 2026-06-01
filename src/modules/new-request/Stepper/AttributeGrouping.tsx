import React from "react";
import { Box } from "@mui/material";
import { getControlKey, getControlType } from "../../../core/utils/control.utils";
import { FormField } from "../../../core/types/FormField";
import { UseFormReturn } from "react-hook-form";

interface AttributeGroupingProps {
  fields: FormField[];
  formMethods: UseFormReturn<Record<string, unknown>>;
}

/**
 * Renders a flat list of form fields with no accordion grouping.
 * (formData-v1.json has no group flags, so grouping is assumed off.)
 */
const AttributeGrouping: React.FC<AttributeGroupingProps> = ({
  fields,
  formMethods,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "0.5rem",
      }}
    >
      {fields.map((field) => {
        if (!field.isVisible) return null;

        const controlKey = getControlKey(field);
        const Component = getControlType(controlKey);

        if (!Component) return null;

        return (
          <Component
            key={field.fieldId}
            formField={field}
            formMethods={formMethods}
          />
        );
      })}
    </Box>
  );
};

export default AttributeGrouping;
