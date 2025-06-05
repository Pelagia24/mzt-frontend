import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {AuthResponse, UserInfoResponse} from "../types/authApi/responses.ts";
import {RegisterUserRequest, LoginUserRequest} from "../types/authApi/requests.ts";
import { setCredentials } from "../store/slices/authSlice.ts";
import {Dispatch} from "@reduxjs/toolkit";


const updateAccess = async (
    queryFulfilled: Promise<{ data: AuthResponse }>,
    dispatch: Dispatch,
) => {
    try {
        const {data} = await queryFulfilled;
        localStorage.setItem("access_token", data.access_token);
        dispatch(setCredentials({id: data.id, role: data.role}));
    } catch (error) {
        if (localStorage.getItem("access_token")) {
            localStorage.removeItem("access_token");
        }
        console.log(error);
    }
};

const authApi = createApi({
    reducerPath: 'api',
    tagTypes: ['Auth', 'UserInfo'],
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080/api/v1',
        credentials: 'include',
        prepareHeaders: (headers, {endpoint}) => {
            if (endpoint === 'refreshToken' || endpoint === 'getProfile') {
                const token = localStorage.getItem("access_token");
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`);
                }
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
                    localStorage.removeItem('access_token');
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
            },
        }),
        getProfile: builder.query<UserInfoResponse, void>({
            query: () => '/users/me',
            providesTags: ['UserInfo'],
        })
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useRefreshTokenQuery,
    useGetProfileQuery,
} = authApi;

export default authApi;
