import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import styles from "./Stepper.module.css";
import { useLocale } from "../../../core/hooks/useLocale";
import { FormField } from "../../../core/types/FormField";
import { useMemo } from "react";

interface ActionsProps {
  activeStep: number;
  stepsCount: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const Actions: React.FC<ActionsProps> = ({
  activeStep,
  stepsCount,
  onBack,
  onNext,
  onSubmit,
}) => {
  const { t, isAr } = useLocale();
  const isLastStep = activeStep === stepsCount - 1;
 
  return (
    <Box
      className={styles.actionsContainer}
      sx={{
        mt: 4,
        pt: 3,
        borderTop: "1px solid",
        borderColor: "divider",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* ── Left: Back ── */}
      <Button
        disabled={activeStep === 0}
        onClick={onBack}
        variant="outlined"
        color="primary"
        startIcon={isAr ? <ArrowForwardIcon /> : <ArrowBackIcon />}
        sx={{ borderRadius: "8px", px: 4, textTransform: "none", fontWeight: 600 }}
      >
        {t("stepper.back")}
      </Button>

      {/* ── Right: Next / Submit ── */}
      <Button
        onClick={isLastStep ? onSubmit : onNext}
        variant="contained"
        color="primary"
        disableElevation
        startIcon={isLastStep ? <CheckCircleOutlineIcon /> : undefined}
        endIcon={!isLastStep ? (isAr ? <ArrowBackIcon /> : <ArrowForwardIcon />) : undefined}
        sx={{ borderRadius: "8px", px: 4, textTransform: "none", fontWeight: 600 }}
      >
        {isLastStep ? t("stepper.submit") : t("stepper.next")}
      </Button>
    </Box>
  );
};

export default Actions;
