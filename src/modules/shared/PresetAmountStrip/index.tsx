import React from "react";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";
import { useDeviceType } from "../../../core/hooks/useDeviceType";

type SmsShortCodeByAmount = Readonly<Record<string, string>>;

export type PresetAmountStripProps = Readonly<{
  /**
   * Currency label rendered next to the amount (e.g. `t("currency")`).
   * Keep it as a plain string so this component stays i18n-agnostic.
   */
  currencyLabel: string;
  /**
   * Called when the user selects a preset amount (desktop/tablet behavior).
   * On mobile, this is used as a fallback if SMS is disabled or missing a mapping.
   */
  onSelectAmount: (amount: number) => void;
  /**
   * Preset amounts to render. Defaults match the existing UI patterns.
   */
  presetAmounts?: ReadonlyArray<number>;
  /**
   * If true, tapping a preset amount on mobile opens the SMS app using `smsShortCodeByAmount`.
   */
  enableSmsOnMobile?: boolean;
  /**
   * Mapping from amount => SMS short code (as string).
   * Example: { "10": "2289" }.
   */
  smsShortCodeByAmount?: SmsShortCodeByAmount;
  /**
   * Optional style overrides for the outer strip container.
   */
  sx?: SxProps<Theme>;
}>;

const DEFAULT_PRESET_AMOUNTS: ReadonlyArray<number> = [10, 20, 50, 100, 200, 500, 1000];

// Default mapping requested for Mosahamat SMS donation flow.
const DEFAULT_SMS_SHORT_CODE_BY_AMOUNT: SmsShortCodeByAmount = {
  "10": "2289",
  "20": "6025",
  "50": "2252",
  "100": "6027",
  "200": "6026",
  "500": "6264",
  "1000": "6380",
};

const openSmsToShortCode = (shortCode: string): void => {
  // Basic runtime validation to avoid navigating to invalid URLs.
  if (shortCode.trim().length === 0) return;
  if (typeof window === "undefined") return;

  // Mobile browsers handle `sms:` by opening the default SMS app.
  window.location.assign(`sms:${shortCode}`);
};

const PresetAmountStrip: React.FC<PresetAmountStripProps> = ({
  currencyLabel,
  onSelectAmount,
  presetAmounts,
  enableSmsOnMobile = false,
  smsShortCodeByAmount,
  sx,
}: PresetAmountStripProps) => {
  const theme = useTheme();

  // Centralized responsive detection (consistent across the app).
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";

  const amounts = presetAmounts ?? DEFAULT_PRESET_AMOUNTS;
  const mapping = smsShortCodeByAmount ?? DEFAULT_SMS_SHORT_CODE_BY_AMOUNT;

  const handleClick = (amount: number): void => {
    // Mobile-only SMS behavior (requested). Falls back to onSelectAmount safely.
    if (enableSmsOnMobile && isMobile) {
      const shortCode = mapping[String(amount)];
      if (typeof shortCode === "string" && shortCode.trim().length > 0) {
        openSmsToShortCode(shortCode);
        return;
      }
    }

    onSelectAmount(amount);
  };

  return (
    <Box
      sx={{
        mt: { xs: 6, md: 2 },
        background: "linear-gradient(to bottom, #FDFDFD 50%, #F1F1F2 100%)",
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.65)}`,
        display: "flex",
        alignItems: "stretch",
        overflowX: { xs: "auto", md: "hidden" },
        overflowY: "hidden",
        width: "100%",
        flexWrap: { xs: "nowrap", md: "nowrap" },
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin",
        ...(sx ?? {}),
      }}>
      {amounts.map((val, index) => (
        <React.Fragment key={val}>
          <Button
            onClick={() => handleClick(val)}
            sx={{
              flex: { xs: "0 0 auto", md: 1 },
              minWidth: { xs: 140, sm: 160, md: 0 },
              py: { xs: 3, md: 1.1 },
              px: 1,
              borderRadius: 0,
              color: theme.palette.primary.main,
              textTransform: "none",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
              {enableSmsOnMobile && isMobile ? (
                <SmsOutlinedIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              ) : null}

              <Typography variant="body1" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                {val}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: theme.palette.text.primary, whiteSpace: "nowrap" }}>
                {currencyLabel}
              </Typography>
            </Stack>
          </Button>

          {index < amounts.length - 1 ? (
            <Box
              sx={{
                flex: "0 0 1px",
                width: "1px",
                alignSelf: "stretch",
                my: { xs: 1, md: 0.9 },
                backgroundColor: alpha(theme.palette.primary.main, 0.65),
              }}
              aria-hidden="true"
            />
          ) : null}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default PresetAmountStrip;


