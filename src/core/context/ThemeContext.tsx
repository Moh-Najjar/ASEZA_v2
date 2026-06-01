import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { isRtl } from "../../i18n/languages";
import {
  DEFAULT_THEME_MODE,
  THEME_CONFIG,
  THEME_STORAGE_KEY,
  isThemeMode,
  type ThemeMode,
} from "../constants/theme";

// Define theme context interface
interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Create theme context with default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Read the persisted theme preference from localStorage. Falls back to the
 *  app default (light) if no preference has been stored yet. */
const resolveInitialMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== null && isThemeMode(stored)) return stored;
  } catch {
    // localStorage unavailable (e.g. private-browsing restriction) — ignore.
  }

  return DEFAULT_THEME_MODE;
};

// Theme provider component
export const ThemeContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(resolveInitialMode);

  // Read language to derive direction
  const { i18n } = useTranslation();
  const direction = isRtl(i18n.language) ? "rtl" : "ltr";

  // Persist the chosen mode whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Failed to save theme mode to localStorage:", error);
    }
  }, [mode]);

  const toggleTheme = useCallback((): void => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((requestedMode: ThemeMode): void => {
    setModeState(requestedMode);
  }, []);

  // Create Material-UI theme based on current mode and language direction
  const theme = useMemo(() => {
    const themeConfig = THEME_CONFIG[mode];
    const commonConfig = THEME_CONFIG.common;

    return createTheme({
      direction,
      palette: {
        mode,
        primary: themeConfig.primary,
        secondary: themeConfig.secondary,
        // MUI uses the spelling "grey" for the gray ramp: `theme.palette.grey[500]`.
        // We store it as `gray` in our config, then map it here to match MUI's API.
        grey: themeConfig.gray,
        background: themeConfig.background,
        text: themeConfig.text,
        divider: themeConfig.divider,
        error: themeConfig.error,
        warning: themeConfig.warning,
        info: themeConfig.info,
        success: themeConfig.success,
      },
      shape: commonConfig.shape,
      typography: {
        ...commonConfig.typography,
        fontFamily: "var(--font-base)",
      },
      transitions: commonConfig.transitions,
      spacing: commonConfig.spacing,
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: themeConfig.background.paper,
              color: themeConfig.text.primary,
              transition: `background-color ${commonConfig.transitions.duration.standard}ms ${commonConfig.transitions.easing.easeInOut}, color ${commonConfig.transitions.duration.standard}ms ${commonConfig.transitions.easing.easeInOut}`,
              fontFamily: "var(--font-base)",
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              // MUI adds `padding-bottom: 24px` to the last-child by default.
              // We explicitly remove it project-wide to match desired layout.
              "&:last-child": {
                paddingBottom: 0,
              },
            },
          },
        },
      },
    });
  }, [mode, direction]);

  // Context value
  const contextValue: ThemeContextType = useMemo(
    () => ({ mode, toggleTheme, setTheme }),
    [mode, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

// Export the context for direct usage if needed
export { ThemeContext };

