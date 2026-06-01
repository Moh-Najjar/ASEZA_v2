import { createSlice } from '@reduxjs/toolkit';

export interface SelectedCountryState {
  selectedCountry: { id: string; name: string; originalName: string; flag: string };
}

const initialState: SelectedCountryState = {
  selectedCountry: { id: '', name: '', originalName: '', flag: '' },
};

export interface SetSelectedCountryPayload {
  selectedCountry: { id: string; name: string; originalName: string; flag: string };
}

const mosquesSlice = createSlice({
  name: 'mosques',
  initialState,
  reducers: {
    setSelectedCountry(state, action: { payload: SetSelectedCountryPayload }) {
      const { selectedCountry } = action.payload;
      state.selectedCountry = selectedCountry;
    },
    clearSelectedCountry(state) {
      state.selectedCountry = { id: '', name: '', originalName: '', flag: '' };
    },
  },
});

export const { setSelectedCountry, clearSelectedCountry } = mosquesSlice.actions;

export default mosquesSlice.reducer;
