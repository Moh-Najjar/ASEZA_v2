import { createSlice } from "@reduxjs/toolkit";

/**
 * Interface representing the state for fetching/loading and notifications.
 */
interface FetchingState {
  isLoading: boolean;
}

/**
 * Initial state for the fetching slice.
 */
const initialState: FetchingState = {
  isLoading: false,
};

/**
 * Redux slice for managing loading state.
 * Notifications (toasts) are handled as side effects or within actions if needed,
 * but for now, we follow the same logic as the existing context.
 */
const fetchingSlice = createSlice({
  name: "fetching",
  initialState,
  reducers: {
    /**
     * Starts the loading indicator.
     */
    startLoading(state) {
      state.isLoading = true;
    },
    /**
     * Stops the loading indicator.
     */
    stopLoading(state) {
      state.isLoading = false;
    },
  },
});

export const { startLoading, stopLoading } = fetchingSlice.actions;

export default fetchingSlice.reducer;

