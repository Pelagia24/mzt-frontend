import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface AuthState {
    id: string | null;
    role: 'Admin' | 'User' | null;
}

const initialState: AuthState = {
    id: null,
    role: null
}

interface CredentialsPayload {
    id: string;
    role: 'Admin' | 'User';
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<CredentialsPayload>) {
            state.id = action.payload.id;
            state.role = action.payload.role;
        }
    }
});

export const {setCredentials} = authSlice.actions;
export default authSlice.reducer;