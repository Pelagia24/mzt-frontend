import {Lesson} from "../../types/models/Lesson.ts";

interface LessonInfoProps {
    lesson?: Lesson;
    courseId: string;
}

export default LessonInfoProps;