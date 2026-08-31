import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import {
  findRegexPreset,
  isCustomRegexPattern,
  NONE_REGEX_PATTERN_VALUE,
  REGEX_PATTERN_PRESETS,
  type RegexPatternPreset,
} from './regexPatterns';

interface RegexPatternSelectProps {
  value: string;
  onChange: (pattern: string, preset: RegexPatternPreset | null) => void;
}

const RegexPatternSelect: React.FC<RegexPatternSelectProps> = ({ value, onChange }) => {
  const selectedPreset = findRegexPreset(value);
  const showCustomOption = isCustomRegexPattern(value);

  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="regex-pattern-select-label" shrink>
        Input Pattern
      </InputLabel>
      <Select
        labelId="regex-pattern-select-label"
        label="Input Pattern"
        value={value}
        displayEmpty
        notched
        onChange={(e) => {
          const nextPattern = String(e.target.value);
          if (nextPattern === NONE_REGEX_PATTERN_VALUE) {
            onChange(NONE_REGEX_PATTERN_VALUE, null);
            return;
          }
          const preset = findRegexPreset(nextPattern) ?? null;
          onChange(nextPattern, preset);
        }}
        renderValue={(selected) => {
          if (selected === NONE_REGEX_PATTERN_VALUE) {
            return 'None';
          }
          const preset = findRegexPreset(selected);
          return preset?.label ?? 'Custom';
        }}
        sx={{ borderRadius: '12px', fontWeight: 600 }}
      >
        <MenuItem value={NONE_REGEX_PATTERN_VALUE} sx={{ fontWeight: 600 }}>
          None
        </MenuItem>
        {REGEX_PATTERN_PRESETS.map((preset) => (
          <MenuItem key={preset.id} value={preset.pattern} sx={{ whiteSpace: 'normal', py: 1.25 }}>
            <Box>
              <Typography variant="body2" fontWeight={700}>
                {preset.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {preset.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        {showCustomOption && (
          <MenuItem value={value} sx={{ whiteSpace: 'normal', py: 1.25 }}>
            <Box>
              <Typography variant="body2" fontWeight={700}>
                Custom
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {value}
              </Typography>
            </Box>
          </MenuItem>
        )}
      </Select>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
        {selectedPreset !== undefined
          ? selectedPreset.description
          : showCustomOption
            ? 'This field already has a custom pattern. Pick a listed option to replace it.'
            : 'Optional — pick a ready-made format instead of writing a regex'}
      </Typography>
    </FormControl>
  );
};

export default RegexPatternSelect;
