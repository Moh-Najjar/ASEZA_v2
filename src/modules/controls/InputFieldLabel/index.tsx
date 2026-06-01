import { InputLabel, Typography, Box } from "@mui/material";
import { FormField } from "../../../core/types/FormField";
import { useLocale } from "../../../core/hooks/useLocale";
import React from "react";

interface TextFieldLabelProps {
  field: FormField;
}

/** Renders a bilingual label for a form control, with a required asterisk when isRequired is true */
const TextFieldLabel: React.FC<TextFieldLabelProps> = ({ field }) => {
  const { loc } = useLocale();

  return (
    <InputLabel
      htmlFor={field.fieldKey}
      sx={{
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "text.primary",
        mb: 1,
        // Allow the label to wrap onto multiple lines instead of clipping.
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "unset",
      }}
    >
      {loc(field.labelEn, field.labelAr)}
      {field.isRequired && (
        <Typography
          component="span"
          sx={{
            color: "error.main",
            fontWeight: "bold",
            fontSize: "1.2rem",
            lineHeight: 0,
            ml: 0.5,
            verticalAlign: "middle",
          }}
        >
          *
        </Typography>
      )}
    </InputLabel>
  );
};

export default TextFieldLabel;
