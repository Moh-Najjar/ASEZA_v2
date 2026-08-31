/**
 * Ready-made regex presets for admin field validation.
 * The stored JSON value is still `regexPattern` (the actual regex string);
 * admins pick a named option instead of writing the formula by hand.
 */

export interface RegexPatternPreset {
  id: string;
  label: string;
  description: string;
  pattern: string;
  validationMessageEn: string;
  validationMessageAr: string;
}

/** Empty select value — no regex is sent to the API. */
export const NONE_REGEX_PATTERN_VALUE = '';

export const REGEX_PATTERN_PRESETS: RegexPatternPreset[] = [
  {
    id: 'numbers-only',
    label: 'Numbers only',
    description: 'Whole numbers such as 0, 12, 340',
    pattern: '^\\d+$',
    validationMessageEn: 'Only non-negative integer values are allowed',
    validationMessageAr: 'يسمح فقط بالأرقام الصحيحة غير السالبة',
  },
  {
    id: 'numbers-0-100',
    label: 'Number from 0–100',
    description: 'Whole or decimal values between 0 and 100',
    pattern: '^(100(\\.0+)?|[0-9]{1,2}(\\.\\d+)?)$',
    validationMessageEn: 'Enter a number between 0 and 100',
    validationMessageAr: 'أدخل رقماً بين 0 و 100',
  },
  {
    id: 'whole-0-100',
    label: 'Whole number from 0–100',
    description: 'Integers only, from 0 to 100',
    pattern: '^(100|[0-9]{1,2})$',
    validationMessageEn: 'Enter a whole number between 0 and 100',
    validationMessageAr: 'أدخل رقماً صحيحاً بين 0 و 100',
  },
  {
    id: 'decimal-2',
    label: 'Decimal (up to 2 places)',
    description: 'e.g. 12 or 12.50',
    pattern: '^\\d+(\\.\\d{1,2})?$',
    validationMessageEn: 'Only non-negative decimal values are allowed (up to 2 decimal places)',
    validationMessageAr: 'يسمح فقط بالأرقام العشرية غير السالبة (حتى منزلتين عشريتين)',
  },
  {
    id: 'positive-decimal',
    label: 'Positive number (decimals allowed)',
    description: 'Any non-negative number, with or without decimals',
    pattern: '^\\d+(\\.\\d+)?$',
    validationMessageEn: 'Only non-negative numbers are allowed',
    validationMessageAr: 'يسمح فقط بالأرقام غير السالبة',
  },
  {
    id: 'letters-en',
    label: 'Letters only (English)',
    description: 'A–Z, a–z, and spaces',
    pattern: '^[A-Za-z\\s]+$',
    validationMessageEn: 'Only English letters are allowed',
    validationMessageAr: 'يسمح فقط بالحروف الإنجليزية',
  },
  {
    id: 'letters-ar',
    label: 'Letters only (Arabic)',
    description: 'Arabic letters and spaces',
    pattern: '^[\\u0600-\\u06FF\\s]+$',
    validationMessageEn: 'Only Arabic letters are allowed',
    validationMessageAr: 'يسمح فقط بالحروف العربية',
  },
  {
    id: 'alphanumeric',
    label: 'Letters and numbers',
    description: 'No special characters or spaces',
    pattern: '^[A-Za-z0-9]+$',
    validationMessageEn: 'Only letters and numbers are allowed',
    validationMessageAr: 'يسمح فقط بالحروف والأرقام',
  },
  {
    id: 'email',
    label: 'Email address',
    description: 'e.g. name@example.com',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    validationMessageEn: 'Enter a valid email address',
    validationMessageAr: 'أدخل بريداً إلكترونياً صالحاً',
  },
  {
    id: 'jordan-mobile',
    label: 'Jordan mobile number',
    description: 'Starts with 077, 078, or 079',
    pattern: '^07[789]\\d{7}$',
    validationMessageEn: 'Enter a valid Jordanian mobile number (e.g. 0791234567)',
    validationMessageAr: 'أدخل رقم هاتف أردني صالح (مثال: 0791234567)',
  },
];

export const findRegexPreset = (pattern: string): RegexPatternPreset | undefined =>
  REGEX_PATTERN_PRESETS.find((preset) => preset.pattern === pattern);

/** True when a stored regex is not one of the named presets (legacy / custom). */
export const isCustomRegexPattern = (pattern: string): boolean =>
  pattern.trim().length > 0 && findRegexPreset(pattern) === undefined;
