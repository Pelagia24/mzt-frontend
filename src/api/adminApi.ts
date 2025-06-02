import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import User from "../types/models/User.ts";

const adminApi = createApi({
    reducerPath: 'admin',
    tagTypes: ['Users', 'Transactions'],
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080/api/v1',
        credentials: 'include',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: builder => ({
        getUsers: builder.query<{users: User[]}, void>({
            query: () => '/users/',
            providesTags: ['Users']
        }),
        deleteUser: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Users']
        }),
        updateUser: builder.mutation<unknown, User>({
            query: (user) => ({
                url: `/users/${user.id}`,
                method: 'PUT',
                body: user
            }),
            invalidatesTags: ['Users']
        }),
        getUserTransactions: builder.query<unknown, string>({
            query: (userId) => ({
                url: `/users/${userId}/transactions`,
                method: 'GET'
            }),
            providesTags: ['Transactions']
        })
    })
})

export const {
    useGetUsersQuery,
    useDeleteUserMutation,
    useGetUserTransactionsQuery,
    useUpdateUserMutation
} = adminApi;

export default adminApi;