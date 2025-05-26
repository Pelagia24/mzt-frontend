import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {Lesson} from "../types/models/Lesson.ts";


const courseApi = createApi({
    reducerPath: 'coursesApi',
    tagTypes: ['Courses', 'Lessons', 'UserCourses'],
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
    endpoints: builder =>  ({
        getCourses: builder.query<{ courses: { course_id: string, name: string, description: string }[] }, void>({
            query: () => '/courses/',
            providesTags: ['Courses']
        }),
        getLessons: builder.query<{lessons: Lesson[]}, string>({
            query: (courseId) => `/courses/${courseId}/lessons/`,
            providesTags: ['Lessons']
        }),
        getCoursesByUserId: builder.query<{ courses: { course_id: string, name: string, description: string }[] }, void>({
            query: () => '/users/me/courses',
            providesTags: ['UserCourses']
        }),
        buyCourse: builder.mutation<{ url: string}, string>({
            query: (id) => ({
                url: `/courses/${id}/users/`,
                method: 'POST'
            }),
            invalidatesTags: ['UserCourses']
        })
    })
})

export default courseApi;
export const {
    useGetCoursesQuery,
    useGetLessonsQuery,
    useGetCoursesByUserIdQuery,
    useBuyCourseMutation
} = courseApi;