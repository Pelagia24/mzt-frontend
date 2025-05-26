import CourseContent from "../../components/courseContent/CourseContent.tsx";
import NavBar from "../../components/navBar/NavBar.tsx";
import {useParams} from "react-router-dom";

const CoursePage = () => {
    const {courseId} = useParams();

    return <>
        <NavBar/>
        <CourseContent courseId={courseId as string}/>
    </>
}

export default CoursePage;