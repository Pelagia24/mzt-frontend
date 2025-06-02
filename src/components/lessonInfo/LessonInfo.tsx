import styles from "../courseContent/courseContent.module.scss";
import LessonInfoProps from "./lessonInfo.props.ts";
import {Carousel} from "primereact/carousel";
import Event from "../../types/models/Event.ts";
import {useGetEventsQuery} from "../../api/courseApi.ts";
import {skipToken} from "@reduxjs/toolkit/query";
import {useState} from "react";
import {Button} from "primereact/button";

const LessonInfo = ({lesson, courseId}: LessonInfoProps) => {
    const {data: events} = useGetEventsQuery(courseId ? courseId : skipToken);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const eventTemplate = (event: Event) => {
        return (
            <div className={`py-5 px-3 ${styles.event}`}>
                <h3 className="mb-1">{event.title}</h3>
                <h4 className="mt-0 mb-3">{new Date(event.event_date).toLocaleDateString()}</h4>
                <p className="mb-3">{event.description}</p>
                {event.secret_info && (
                    <>
                        <Button 
                            label={selectedEventId === event.event_id ? "Hide Secret" : "Show Secret"} 
                            onClick={() => setSelectedEventId(selectedEventId === event.event_id ? null : event.event_id)}
                            className="p-button-outlined p-button-secondary"
                        />
                        {selectedEventId === event.event_id && (
                            <div className="mt-3 p-3 surface-card border-round">
                                <p className="font-semibold text-primary">{event.secret_info}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return <section className={styles.activeLesson}>
        <h2 className={styles.lessonHeading}>{lesson?.title}</h2>
        <p className={styles.lessonSummary}>{lesson?.summery}</p>

        <iframe className={styles.player}
                src={lesson?.video_url}
                frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen>
        </iframe>
        <h2 className={styles.lessonHeading}>Текстовое содержание урока</h2>
        <p className={styles.lessonDescription}>{lesson?.text}</p>
        <h2 className={styles.lessonHeading}>События курса</h2>
        <div className={styles.events}>
            {events && <Carousel value={events.events} numVisible={events.events.length < 3 ? 1 :3} numScroll={events.events.length < 3 ? 1 :3} itemTemplate={eventTemplate}/>}
        </div>
    </section>
}

export default LessonInfo;