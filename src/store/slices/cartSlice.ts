import { createSlice } from '@reduxjs/toolkit';
import type { GetMyRequestOutput } from 'octopian-apis';
import type { RootState } from '../store';

/**
 * Cart item type.
 *
 * The SDK type sometimes omits translation fields that appear in API responses,
 * so we allow them as optional.
 */
export type CartItem = GetMyRequestOutput & Readonly<{ AssetNameTranslations?: string }>;

/**
 * Minimal cart snapshot to share across the app.
 *
 * NOTE: This slice intentionally does NOT call APIs; the Cart module owns fetching.
 */
export type CartSnapshot = Readonly<{
  items: CartItem[];
  count: number;
  /** Total can be unknown depending on backend response shape. */
  totalCount: number | null;
  /** Only used when totalCount is unknown to disable Next on the last page. */
  hasNextPage: boolean;
  pageIndex: number;
  pageSize: number;
}>;

export interface CartState {
  /** Latest loaded page items (used by Cart page). */
  items: CartItem[];
  /** Global count (used by Navbar badge). */
  count: number;

  /** Pagination state for the Cart page. */
  pageIndex: number;
  pageSize: number;
  totalCount: number | null;
  hasNextPage: boolean;

  /**
   * A monotonically increasing counter that other modules can bump to request a refetch.
   * The Cart module can `useEffect` on this value to call `DABGetMyDonations`.
   */
  refreshRequestId: number;
}

const initialState: CartState = {
  items: [],
  count: 0,
  pageIndex: 0,
  pageSize: 5,
  totalCount: null,
  hasNextPage: false,
  refreshRequestId: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Set the current cart snapshot (typically after a successful API fetch).
     */
    setCartSnapshot(state, action: { payload: CartSnapshot }) {
      state.items = action.payload.items;
      state.count = action.payload.count;
      state.totalCount = action.payload.totalCount;
      state.hasNextPage = action.payload.hasNextPage;
      state.pageIndex = action.payload.pageIndex;
      state.pageSize = action.payload.pageSize;
    },

    /**
     * Update only the cart count (useful when you don't have the full list).
     */
    setCartCount(state, action: { payload: { count: number } }) {
      const next = action.payload.count;
      state.count = Number.isFinite(next) && next >= 0 ? next : 0;
    },

    /**
     * Request a cart refetch. This does not fetch by itself.
     *
     * The Cart module can watch `refreshRequestId` and call the API when it changes.
     */
    requestCartRefresh(state) {
      state.refreshRequestId += 1;
    },

    /**
     * Clear cart state locally (useful on logout or token loss).
     */
    clearCartState(state) {
      state.items = [];
      state.count = 0;
      state.totalCount = null;
      state.hasNextPage = false;
      state.refreshRequestId = 0;
    },
  },
});

export const {
  setCartSnapshot,
  setCartCount,
  requestCartRefresh,
  clearCartState,
} = cartSlice.actions;

export default cartSlice.reducer;

/**
 * Selectors (use these anywhere in the app).
 */
export const selectCartCount = (state: RootState): number => state.cart.count;
export const selectCartItems = (state: RootState): ReadonlyArray<CartItem> => state.cart.items;
export const selectCartRefreshRequestId = (state: RootState): number => state.cart.refreshRequestId;

/**
 * Safely parse a numeric amount from a cart row.
 *
 * Some SDK fields are strings and may be empty or formatted with commas, so we validate carefully.
 */
export function parseCartItemAmount(item: CartItem): number {
  const candidates: ReadonlyArray<unknown> = [item.Amount, item.Cost, item.Price, item.Quantity];

  for (let i = 0; i < candidates.length; i += 1) {
    const raw = candidates[i];
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (trimmed.length === 0) continue;

    const normalized = trimmed.replace(/,/g, '');
    const num = Number(normalized);
    if (Number.isFinite(num) && num >= 0) return num;
  }

  return 0;
}

/**
 * Total cart amount computed from the current cart snapshot in Redux.
 *
 * Notes:
 * - This reflects the latest fetched cart rows (not in-component UI overrides).
 * - Consumers should still display 0 if the cart hasn't been fetched yet.
 */
export const selectCartTotalAmount = (state: RootState): number => {
  const items = state.cart.items;
  let total = 0;

  for (let i = 0; i < items.length; i += 1) {
    total += parseCartItemAmount(items[i]);
  }

  return total;
};

