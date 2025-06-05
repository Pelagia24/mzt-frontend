import {Button} from "primereact/button";
import CoursePromoProps from "./coursePromo.props.ts";
import {useGetCoursesQuery, useGetCoursesByUserIdQuery, useBuyCourseMutation} from "../../api/courseApi.ts";
import {useState} from "react";
import {Dialog} from "primereact/dialog";
import {useNavigate} from "react-router-dom";

const CoursePromo = ({courseId, name}: CoursePromoProps) => {
    const {data: coursesData} = useGetCoursesQuery();
    const {data: userCoursesData} = useGetCoursesByUserIdQuery();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [buyCourse] = useBuyCourseMutation();

    const course = coursesData?.courses.find(c => c.course_id === courseId);

    const courseActionHandler = () => {
        const hasAccess = userCoursesData?.courses.some(course => courseId === course.course_id);
        if (hasAccess) {
            navigate(`/course/${courseId}`);
        } else {
            setVisible(true);
        }
    }

    const buyCourseHandler = async () => {
        try {
            const data = await buyCourse(courseId).unwrap();
            window.location.href = data.url;
        } catch (error: any) {
            if (error.status === 401) {
                navigate('/login');
            } else {
                console.error(error);
            }
        }
    }

    return <div className="col-12 lg:col-4">
        <div className="p-3 h-full">
            <div className="shadow-2 p-3 h-full flex flex-column" style={{borderRadius: '6px'}}>
                <div className="text-900 font-medium text-xl mb-2">{name}</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <div className="flex align-items-center">
                    <span className="font-bold text-2xl text-900">
                        {course ? `${course.price.amount}${course.price.currency_code === 'RUB' ? '₽' : course.price.currency_code}` : 'Загрузка...'}
                    </span>
                    <span className="ml-2 font-medium text-600">в месяц</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <ul className="list-none p-0 m-0 flex-grow-1">
                    <li className="flex align-items-center mb-3">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <span>Участие в КВР</span>
                    </li>
                    <li className="flex align-items-center mb-3">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <span>МК экспертов</span>
                    </li>
                    <li className="flex align-items-center mb-3">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <span>Ежемесячные встречи</span>
                    </li>
                    <li className="flex align-items-center mb-3">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <span>База знаний</span>
                    </li>
                    <li className="flex align-items-center mb-3">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <span>Закрытый чат</span>
                    </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300 mt-auto"/>
                <Button onClick={courseActionHandler} label="Купить" className="p-3 w-full mt-auto"/>
            </div>
            <Dialog header="Подтверждение" visible={visible} onHide={() => {
                if (!visible) return;
                setVisible(false);
            }}>
                <p className="m-0">
                    Нажимая кнопку оплатить вы соглашайтесь с <a download href="/rules.pdf">правилами</a>
                </p>
                <Button onClick={buyCourseHandler} className="mt-3" size="large" label="Оплатить" severity="success"/>
            </Dialog>
        </div>
    </div>
}

export default CoursePromo;