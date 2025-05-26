import styles from './courseContent.module.scss';
import {classNames} from "primereact/utils";
import LessonInfo from "../lessonInfo/LessonInfo.tsx";
import courseContentProps from "./courseContent.props.ts";
import {useGetLessonsQuery} from "../../api/courseApi.ts";
import {skipToken} from "@reduxjs/toolkit/query";
import {useEffect, useState} from "react";

const CourseContent = ({courseId}: courseContentProps) => {
    const {data} = useGetLessonsQuery(courseId ? courseId : skipToken);
    const [activeLesson, setActiveLesson] = useState<string | null>();

    useEffect(() => {
        if (data) {
            setActiveLesson(data.lessons[0].lesson_id);
        }
    }, [data]);


    return <main className={styles.content}>
        <aside className={styles.aside}>
            {data && data.lessons.map((lesson, index) => (
                <div onClick={() => setActiveLesson(lesson.lesson_id)} key={index}
                     className={classNames(styles.lesson, {[styles.active]: activeLesson === lesson.lesson_id})}>
                    <h3>{lesson.title}</h3>
                </div>
            ))}
        </aside>

        <LessonInfo lesson={data && data.lessons.filter(lesson => lesson.lesson_id === activeLesson)[0]}/>
    </main>
}

export default CourseContent;