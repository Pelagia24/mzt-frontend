import {configureStore} from '@reduxjs/toolkit';
import authApi from '../api/authApi.ts';
import authSlice from "./slices/authSlice.ts";
import adminApi from "../api/adminApi.ts";

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        authSlice
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(authApi.middleware, adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
