// to arrange all the reducers in one place
import { combineReducers } from "@reduxjs/toolkit";
import fetchingReducer from "./fetchingSlice";
import mosquesReducer from "./mosquesSlice";
import cartReducer from "./cartSlice";

const rootReducer = combineReducers({
  fetching: fetchingReducer,
  mosques: mosquesReducer,
  cart: cartReducer,
});

export default rootReducer;
