import styles from "../courseContent/courseContent.module.scss";
import LessonInfoProps from "./lessonInfo.props.ts";

const LessonInfo = ({lesson}: LessonInfoProps) => {


    return <section className={styles.activeLesson}>
        <h2 className={styles.lessonHeading}>{lesson?.title}</h2>
        <p className={styles.lessonSummary}>{lesson?.summery}</p>

        <iframe className={styles.player}
                src={lesson?.video_url}
                frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen>
        </iframe>
        <h2 className={styles.lessonHeading}>Текстовое содержание урока</h2>
        <p className={styles.lessonDescription}>{lesson?.text}</p>
    </section>
}

export default LessonInfo;