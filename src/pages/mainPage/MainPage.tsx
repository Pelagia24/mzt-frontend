import NavBar from "../../components/navBar/NavBar.tsx";
import {Button} from "primereact/button";
import CoursePromo from "../../components/coursePromo/CoursePromo.tsx";
import {useGetCoursesQuery} from "../../api/courseApi.ts";

const MainPage = () => {
    const {data} = useGetCoursesQuery();

    return (
        <>
            <NavBar/>
            <div className="grid grid-nogutter surface-0 text-800">
                <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
                    <section>
                        <span className="block text-6xl font-bold mb-1">MZT</span>
                        <div className="text-3xl font-bold mb-3">Мужское сообщество</div>
                        <p className="mt-0 mb-4 text-700 line-height-3">Будь мастером своего дела, защитником своей
                            семьи, творцом своей жизни</p>

                        <a href="#courses">
                            <Button label="Записаться на курс" type="button" className="mr-3 p-button-raised"/>
                        </a>
                    </section>
                </div>
                <div className="col-12 md:col-6 overflow-hidden">
                    <img src="bg.jpg" alt="hero-1" className="md:ml-auto block"
                         style={{clipPath: 'polygon(8% 0, 100% 0%, 100% 100%, 0 100%)', height: '80vh'}}/>
                </div>
            </div>


            <div className="surface-0 mt-4">
                <div className="text-900 font-bold text-6xl mb-4 text-center">Тарифы</div>
                <div id="courses" className="grid">
                    {
                        data && data.courses.map((course, index) => (
                            <CoursePromo key={index} name={course.name} courseId={course.course_id}/>
                        ))
                    }
                </div>
            </div>

        </>
    );
};

export default MainPage;