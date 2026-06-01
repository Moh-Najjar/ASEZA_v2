// Gray scale "degrees" used across the app (50 → lightest, 900 → darkest).
// Typed to prevent missing shades and keep usage consistent.
export type GrayShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type GrayScale = { [K in GrayShade]: string };

// Shared neutral gray ramp (very close to MUI default `grey` scale).
export const GRAY_SCALE = {
  light: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  } satisfies GrayScale,
  dark: {
    // Same ramp is still useful in dark mode; pick shades based on contrast needs.
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  } satisfies GrayScale,
} as const;

// ─── Brand palette ────────────────────────────────────────────────────────────
// These tokens are the single source of truth for the app's design language.
// The Navbar, Login page, and any other component that needs brand colours
// should derive from the theme rather than re-declaring them locally.

/** Deep blue — primary brand colour, AppBar / headers. */
export const BRAND_NAVY = '#0367A6';
/** Slightly lighter blue used for hover / active states. */
export const BRAND_NAVY_LIGHT = '#3698BF';
/** Darkest blue shade for pressed states. */
export const BRAND_NAVY_DARK = '#024a78';
/** Teal brand mark, highlights, CTAs. */
export const BRAND_ACCENT = '#14A697';
/** Lighter teal for hover states on accent surfaces. */
export const BRAND_ACCENT_LIGHT = '#15BF8F';
/** Darker teal for pressed / active accent states. */
export const BRAND_ACCENT_DARK = '#0d7a6e';

// Theme configuration constants
export const THEME_CONFIG = {
  // ── Light theme ─────────────────────────────────────────────────────────────
  light: {
    gray: GRAY_SCALE.light,
    primary: {
      main: BRAND_NAVY,
      light: BRAND_NAVY_LIGHT,
      dark: BRAND_NAVY_DARK,
      contrastText: '#ffffff',
    },
    secondary: {
      main: BRAND_ACCENT,
      light: BRAND_ACCENT_LIGHT,
      dark: BRAND_ACCENT_DARK,
      // White text on teal background for better contrast.
      contrastText: '#ffffff',
    },
    background: {
      // Soft blue-grey tint matching the Login page backdrop.
      default: '#f0f4f9',
      paper: '#ffffff',
      surface: '#e8f0fb',
    },
    border: {
      default: BRAND_NAVY,
    },
    text: {
      primary: BRAND_NAVY,
      secondary: '#4d6180',
      success: '#009245',
    },
    divider: '#c5d5e8',
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#009245',
      light: '#4caf50',
      dark: '#1b5e20',
    },
  },

  // ── Dark theme ──────────────────────────────────────────────────────────────
  dark: {
    gray: GRAY_SCALE.dark,
    primary: {
      // A palette blue that reads clearly on dark surfaces.
      main: '#3698BF',
      light: '#5db0d1',
      dark: '#0367A6',
      contrastText: '#ffffff',
    },
    secondary: {
      // Teal accent from the palette.
      main: BRAND_ACCENT,
      light: BRAND_ACCENT_LIGHT,
      dark: BRAND_ACCENT_DARK,
      contrastText: '#ffffff',
    },
    border: {
      default: '#3698BF',
    },
    background: {
      // Deep navy-tinted dark surfaces (not pure black) for brand consistency.
      default: '#0a1520',
      paper: '#111e30',
      surface: '#172640',
    },
    text: {
      primary: '#c8daf5',
      secondary: '#8aaad0',
      success: '#4caf50',
    },
    divider: '#808080',
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
  },

  // Common theme settings
  common: {
    shape: {
      borderRadius: 8,
    },
    // typography: {
    //   fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", "Cairo", "Tajawal", sans-serif',
    //   h1: {
    //     fontSize: 'clamp(20px, 2.8vw, 9999px)',
    //   },
    //   h2: {
    //     fontSize: 'clamp(18px, 2.4vw, 9999px)',
    //   },
    //   h3: {
    //     fontSize: 'clamp(16px, 1.8vw, 9999px)',
    //   },
    //   h4: {
    //     fontSize: 'clamp(14px, 1.6vw, 9999px)',
    //   },
    //   h5: {
    //     fontSize: 'clamp(12px, 1.4vw, 9999px)',
    //   },
    //   h6: {
    //     fontSize: 'clamp(11px, 1vw, 9999px)',
    //   },
    //   body1: {
    //     fontSize: 'clamp(12px, 1vw, 9999px)',
    //   },
    //   body2: {
    //     fontSize: 'clamp(10px, 0.9vw, 9999px)',
    //   },
    //   body3: {
    //     fontSize: 'clamp(9px, 0.8vw, 9999px)',
    //   },
    // },
    typography: {
      /**
       * Base font stack
       * English first, Arabic fallback handled by lang selector
       */
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", "Cairo", "Tajawal", sans-serif',

      /**
       * Headings
       * Used for page titles, section titles, and major emphasis
       */

      h1: {
        // Page title / main screen heading
        // Min: 28px (desktop readable)
        // Fluid scaling for large screens
        fontSize: 'clamp(28px, 2.2vw, 40px)',
        fontWeight: 700,
        lineHeight: 1.2,
      },

      h2: {
        // Section titles
        fontSize: 'clamp(24px, 1.9vw, 32px)',
        fontWeight: 600,
        lineHeight: 1.25,
      },

      h3: {
        // Sub-section titles
        fontSize: 'clamp(20px, 1.6vw, 28px)',
        fontWeight: 600,
        lineHeight: 1.3,
      },

      h4: {
        // Card titles / dialog titles
        fontSize: 'clamp(18px, 1.4vw, 24px)',
        fontWeight: 600,
        lineHeight: 1.35,
      },

      h5: {
        // Small headings / labels
        fontSize: 'clamp(16px, 1.2vw, 20px)',
        fontWeight: 500,
        lineHeight: 1.4,
      },

      h6: {
        // Micro headings
        fontSize: 'clamp(14px, 1.1vw, 18px)',
        fontWeight: 500,
        lineHeight: 1.4,
      },

      /**
       * Body text
       * Used for paragraphs, table cells, forms
       */

      body1: {
        // Primary body text
        fontSize: 'clamp(14px, 1vw, 16px)',
        fontWeight: 400,
        lineHeight: 1.6,
      },

      body2: {
        // Secondary text / helper text
        fontSize: 'clamp(13px, 0.95vw, 14px)',
        fontWeight: 400,
        lineHeight: 1.6,
      },

      body3: {
        // Metadata, captions, timestamps
        fontSize: 'clamp(12px, 0.9vw, 13px)',
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
    // font size is dynamic based on the screen size
    spacing: (factor: number) => `${0.5 * factor}vw`,
  },
};

// Theme mode types
export type ThemeMode = 'light' | 'dark';

// Type guard to validate values coming from untyped sources (e.g., localStorage).
export const isThemeMode = (value: string): value is ThemeMode => {
  // Explicitly check allowed values to avoid accidental invalid mode usage.
  return value === 'light' || value === 'dark';
};

// Local storage key for theme preference
export const THEME_STORAGE_KEY = 'theme-mode';

// Default theme mode
export const DEFAULT_THEME_MODE: ThemeMode = 'light';

// Theme transition duration in milliseconds
export const THEME_TRANSITION_DURATION = 300;
