import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {Lesson} from "../types/models/Lesson";
import Event from "../types/models/Event";
import {RootState} from "../store";

interface Course {
    course_id: string;
    name: string;
    description: string;
    price: {
        amount: number;
        currency_code: string;
    };
}

interface CreateCourseRequest {
    name: string;
    description: string;
    price: {
        amount: number;
        currency_code: string;
    };
}

interface UpdateCourseRequest extends CreateCourseRequest {
    courseId: string;
}

export interface CreateLessonRequest {
    course_id: string;
    title: string;
    description: string;
    summaryURL: string;
    video_url: string;
}

export interface UpdateLessonRequest {
    lessonId: string;
    course_id: string;
    title: string;
    description: string;
    summaryURL: string;
    video_url: string;
}

export const courseApi = createApi({
    reducerPath: 'courseApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:8080/api/v1',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Courses', 'Lessons', 'Events', 'UserCourses'],
    endpoints: builder =>  ({
        getCourses: builder.query<{ courses: Course[] }, void>({
            query: () => '/courses/',
            providesTags: ['Courses']
        }),
        createCourse: builder.mutation<Course, CreateCourseRequest>({
            query: (course) => ({
                url: '/courses/',
                method: 'POST',
                body: course
            }),
            invalidatesTags: ['Courses']
        }),
        updateCourse: builder.mutation<Course, UpdateCourseRequest>({
            query: ({ courseId, ...course }) => ({
                url: `/courses/${courseId}`,
                method: 'PUT',
                body: course
            }),
            invalidatesTags: ['Courses']
        }),
        deleteCourse: builder.mutation<void, string>({
            query: (courseId) => ({
                url: `/courses/${courseId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Courses']
        }),
        getLessons: builder.query<{lessons: Lesson[]}, string>({
            query: (courseId) => `/courses/${courseId}/lessons/`,
            providesTags: (result, error, courseId) => [
                { type: 'Lessons', id: courseId }
            ]
        }),
        createLesson: builder.mutation<Lesson, CreateLessonRequest>({
            query: ({ course_id, ...lesson }) => ({
                url: `/courses/${course_id}/lessons/`,
                method: 'POST',
                body: lesson
            }),
            invalidatesTags: (result, error, { course_id }) => [
                { type: 'Lessons', id: course_id }
            ]
        }),
        updateLesson: builder.mutation<void, UpdateLessonRequest>({
            query: ({ lessonId, course_id, ...data }) => ({
                url: `/courses/${course_id}/lessons/${lessonId}`,
                method: 'PUT',
                body: {
                    title: data.title,
                    description: data.description,
                    summary_url: data.summaryURL,
                    video_url: data.video_url
                }
            }),
            invalidatesTags: (result, error, { course_id }) => [
                { type: 'Lessons', id: course_id }
            ]
        }),
        deleteLesson: builder.mutation<void, { courseId: string, lessonId: string }>({
            query: ({ courseId, lessonId }) => ({
                url: `/courses/${courseId}/lessons/${lessonId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'Lessons', id: courseId }
            ]
        }),
        getCoursesByUserId: builder.query<{ courses: Course[] }, void>({
            query: () => '/users/me/courses',
            providesTags: ['UserCourses']
        }),
        buyCourse: builder.mutation<{ url: string}, string>({
            query: (id) => ({
                url: `/courses/${id}/users/`,
                method: 'POST'
            }),
            invalidatesTags: ['UserCourses']
        }),
        getEvents: builder.query<{ events: Event[] }, string>({
            query: (courseId) => `/courses/${courseId}/events/`,
            providesTags: (result, error, courseId) => [
                { type: 'Events', id: courseId }
            ]
        }),
        createEvent: builder.mutation<Event, { course_id: string, event: Omit<Event, 'event_id'> }>({
            query: ({ course_id, event }) => ({
                url: `/courses/${course_id}/events/`,
                method: 'POST',
                body: event
            }),
            invalidatesTags: (result, error, { course_id }) => [
                { type: 'Events', id: course_id }
            ]
        }),
        updateEvent: builder.mutation<Event, { course_id: string, event_id: string, event: Partial<Event> }>({
            query: ({ course_id, event_id, event }) => ({
                url: `/courses/${course_id}/events/${event_id}`,
                method: 'PUT',
                body: event
            }),
            invalidatesTags: (result, error, { course_id }) => [
                { type: 'Events', id: course_id }
            ]
        }),
        deleteEvent: builder.mutation<void, { courseId: string, eventId: string }>({
            query: ({ courseId, eventId }) => ({
                url: `/courses/${courseId}/events/${eventId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'Events', id: courseId }
            ]
        })
    })
})

export default courseApi;
export const {
    useGetCoursesQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    useGetLessonsQuery,
    useCreateLessonMutation,
    useUpdateLessonMutation,
    useDeleteLessonMutation,
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useGetCoursesByUserIdQuery,
    useBuyCourseMutation
} = courseApi;