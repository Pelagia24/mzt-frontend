import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {AuthResponse, UserInfoResponse} from "../types/authApi/responses.ts";
import {RegisterUserRequest, LoginUserRequest} from "../types/authApi/requests.ts";
import { setCredentials } from "../store/slices/authSlice.ts";
import {Dispatch} from "@reduxjs/toolkit";

const clearAuthData = () => {
    localStorage.removeItem("access_token");
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=mzt-study.ru;";
};

const updateAccess = async (
    queryFulfilled: Promise<{ data: AuthResponse }>,
    dispatch: Dispatch,
) => {
    try {
        const {data} = await queryFulfilled;
        localStorage.setItem("access_token", data.access_token);
        dispatch(setCredentials({id: data.id, role: data.role}));
    } catch (error: any) {
        clearAuthData();
        dispatch(setCredentials({id: '', role: 'User'}));
        window.location.href = '/login';
    }
};

const authApi = createApi({
    reducerPath: 'api',
    tagTypes: ['Auth', 'UserInfo'],
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://mzt-study.ru/api/v1',
        credentials: 'include',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("access_token");
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: builder => ({
        registerUser: builder.mutation<AuthResponse, RegisterUserRequest>({
            query: body => ({
                url: '/auth/signup',
                method: 'POST',
                body,
            }),
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                await updateAccess(queryFulfilled, dispatch)
            },
            invalidatesTags: ['Auth'],
        }),
        loginUser: builder.mutation<AuthResponse, LoginUserRequest>({
            query: credentials => ({
                url: '/auth/signin',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                clearAuthData();
                await updateAccess(queryFulfilled, dispatch)
            },
            invalidatesTags: ['Auth'],
        }),
        logoutUser: builder.mutation<void, void>({
            query: () => {
                const token = localStorage.getItem("access_token");
                return {
                    url: '/auth/logout',
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
            },
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                try {
                    await queryFulfilled;
                    clearAuthData();
                    dispatch(setCredentials({id: '', role: 'User'}));
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            },
            invalidatesTags: ['Auth'],
        }),
        refreshToken: builder.query<AuthResponse, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST'
            }),
            providesTags: ['Auth'],
            async onQueryStarted(_, {dispatch, queryFulfilled}) {
                await updateAccess(queryFulfilled, dispatch)
            }
        }),
        getProfile: builder.query<UserInfoResponse, void>({
            query: () => '/users/me',
            providesTags: ['UserInfo'],
        }),
        updateProfile: builder.mutation<UserInfoResponse, Partial<UserInfoResponse['user']>>({
            query: (userData) => ({
                url: `/users/${userData.id}`,
                method: 'PUT',
                body: userData
            }),
            invalidatesTags: ['UserInfo']
        })
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useRefreshTokenQuery,
    useGetProfileQuery,
    useUpdateProfileMutation
} = authApi;

export default authApi;
