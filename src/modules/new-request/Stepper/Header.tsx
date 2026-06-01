import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import styles from "./Stepper.module.css";
import { StepIconProps } from "@mui/material/StepIcon";
import { styled } from "@mui/material/styles";

interface ContentProps {
  activeStep: number;
  steps: { Key: number; Title: string }[];
}

// Add custom styling for the step icon
const CustomStepIcon = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed
    ? theme.palette.primary.main
    : ownerState.active
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  zIndex: 1,
  color: ownerState.active || ownerState.completed ? theme.palette.common.white : theme.palette.text.disabled,
  width: "40px",
  height: "40px",
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  border: `1px solid ${
    ownerState.active || ownerState.completed ? theme.palette.primary.main : theme.palette.divider
  }`,
  fontWeight: "bold",
  transition: "all 0.3s ease",
  boxShadow: ownerState.active ? `0 0 0 4px ${theme.palette.primary.light}40` : "none",
}));

const StyledStep = styled(Step)(({ theme }) => ({
  "& .MuiStepLabel-label": {
    fontWeight: 500,
    marginTop: "8px !important",
    color: theme.palette.text.secondary,
    "&.Mui-active": {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
    "&.Mui-completed": {
      color: theme.palette.text.primary,
    },
  },
}));

const Header: React.FC<ContentProps> = ({ activeStep, steps }) => {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      className={styles.stepperHeader}
      sx={{
        "& .MuiStepConnector-line": {
          borderColor: "divider",
          borderTopWidth: "2px",
        },
        "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
          borderColor: "primary.main",
        },
        "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
          borderColor: "primary.main",
        },
      }}
    >
      {steps.map((page) => (
        <StyledStep key={page.Key}>
          <StepLabel
            StepIconComponent={(props: StepIconProps) => (
              <CustomStepIcon ownerState={props}>
                {props.completed ? "✓" : props.icon}
              </CustomStepIcon>
            )}
          >
            {page.Title}
          </StepLabel>
        </StyledStep>
      ))}
    </Stepper>
  );
};

export default Header;
