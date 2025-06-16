import React, { useState } from 'react';
import { useGetLessonsQuery, useGetEventsQuery, useGetCoursesQuery, useGetCoursesByUserIdQuery } from '../../api/courseApi';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Dropdown } from 'primereact/dropdown';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import styles from './courseContent.module.scss';

interface CourseContentProps {
  courseId: string;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseId }) => {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const navigate = useNavigate();
  const { data: coursesData } = useGetCoursesQuery();
  const { data: userCoursesData } = useGetCoursesByUserIdQuery();
  const { data: lessonsData, isLoading: lessonsLoading } = useGetLessonsQuery(courseId);
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery(courseId);

  const course = coursesData?.courses.find(c => c.course_id === courseId);
  const userCourses = userCoursesData?.courses || [];

  // Reset selected lesson when course changes
  React.useEffect(() => {
    setSelectedLessonIndex(0);
  }, [courseId]);

  const handleLessonChange = (index: number) => {
    try {
      if (lessonsData?.lessons && index >= 0 && index < lessonsData.lessons.length) {
        setSelectedLessonIndex(index);
      }
    } catch (error) {
      console.error('Error changing lesson:', error);
    }
  };

  const handleCourseChange = (e: { value: string }) => {
    navigate(`/course/${e.value}`);
  };

  const toggleSecret = (eventId: string) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    try {
      // Handle YouTube URLs
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        
        if (url.includes('youtube.com')) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get('v') || '';
          
          // Handle youtu.be format
          if (!videoId && url.includes('/watch')) {
            const pathParts = url.split('/watch');
            if (pathParts[1]) {
              const searchParams = new URLSearchParams(pathParts[1]);
              videoId = searchParams.get('v') || '';
            }
          }
        } else if (url.includes('youtu.be')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        }

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }
      }

      // Handle Vimeo URLs
      if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
        }
      }

      // Return original URL if not a supported video platform
      return url;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return '';
    }
  };

  const handleEventNavigation = (direction: 'prev' | 'next') => {
    if (!eventsData?.events) return;
    
    const totalEvents = eventsData.events.length;
    if (totalEvents === 0) return;

    setCurrentEventIndex(prevIndex => {
      if (direction === 'next') {
        return (prevIndex + 1) % totalEvents;
      } else {
        return (prevIndex - 1 + totalEvents) % totalEvents;
      }
    });
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleEventNavigation('prev');
      } else if (e.key === 'ArrowRight') {
        handleEventNavigation('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [eventsData?.events]);

  const eventTemplate = (event: any) => {
    return (
      <div className={styles.eventCard}>
        <h3>{event.title}</h3>
        <p className={styles.eventDate}>{dayjs(event.event_date).format('DD.MM.YYYY')}</p>
        <p className={styles.description}>{event.description}</p>
        {event.secret_info && (
          <div className={styles.secretInfo}>
            <Button
              label={revealedSecrets[event.event_id] ? "Скрыть секретную информацию" : "Показать секретную информацию"}
              className="p-button-outlined"
              onClick={() => toggleSecret(event.event_id)}
            />
            {revealedSecrets[event.event_id] && (
              <div className={styles.secretContent}>
                <h4>Секретная информация</h4>
                <p>{event.secret_info}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const lessonTemplate = (lesson: any) => {
    const lessonEvents = eventsData?.events || [];
    const embedUrl = lesson.video_url ? getEmbedUrl(lesson.video_url) : '';

    return (
      <div className={styles.lessonSlide}>
        <div className={styles.lessonContent}>
          <h2>{lesson.title}</h2>
          <p className={styles.description}>{lesson.summery}</p>
          {embedUrl && (
            <div className={styles.videoContainer}>
              <iframe
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                title={`Video for lesson: ${lesson.title}`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className={styles.markdownContent}>
            <ReactMarkdown>{lesson.text}</ReactMarkdown>
          </div>
          
          {lessonEvents.length > 0 && (
            <div className={styles.lessonEvents}>
              <h3>События курса</h3>
              <div className={styles.eventsNavigation}>
                <Button
                  icon="pi pi-chevron-left"
                  className={styles.eventNavButton}
                  onClick={() => handleEventNavigation('prev')}
                  aria-label="Предыдущее событие"
                />
                <div className={styles.eventCard}>
                  {eventTemplate(lessonEvents[currentEventIndex])}
                </div>
                <Button
                  icon="pi pi-chevron-right"
                  className={styles.eventNavButton}
                  onClick={() => handleEventNavigation('next')}
                  aria-label="Следующее событие"
                />
              </div>
              <div className={styles.eventsKeyboardHint}>
                Используйте стрелки ← → для навигации по событиям
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!course) {
    return (
      <div className={styles.courseContent}>
        <div className={styles.emptyState}>
          <h2>Курс не найден</h2>
        </div>
      </div>
    );
  }

  const courseOptions = userCourses.map(course => ({
    label: course.name,
    value: course.course_id
  }));

  return (
    <div className={styles.courseContent}>
      <div className={styles.courseHeader}>
        <div className={styles.courseHeaderTop}>
          <h1>{course.name}</h1>
          {userCourses.length > 1 && (
            <Dropdown
              value={courseId}
              options={courseOptions}
              onChange={handleCourseChange}
              placeholder="Выберите курс"
              className={styles.courseSelector}
            />
          )}
        </div>
        <p className={styles.description}>{course.description}</p>
      </div>

      <div className={styles.lessonLayout}>
        <div className={styles.lessonSidebar}>
          <h3>Уроки курса</h3>
          {lessonsLoading ? (
            <div className={styles.emptyState}>Загрузка уроков...</div>
          ) : lessonsData?.lessons.length ? (
            <div className={styles.lessonList}>
              {lessonsData.lessons.map((lesson, index) => (
                <Button
                  key={lesson.lesson_id}
                  className={`${styles.lessonButton} ${selectedLessonIndex === index ? styles.activeLesson : ''}`}
                  onClick={() => handleLessonChange(index)}
                  disabled={lessonsLoading}
                >
                  <span className={styles.lessonNumber}>{index + 1}</span>
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>Уроки пока не добавлены</div>
          )}
        </div>

        <div className={styles.lessonMain}>
          {lessonsLoading ? (
            <div className={styles.emptyState}>Загрузка уроков...</div>
          ) : lessonsData?.lessons.length ? (
            <div className={styles.lessonContent}>
              {lessonsData.lessons[selectedLessonIndex] && lessonTemplate(lessonsData.lessons[selectedLessonIndex])}
            </div>
          ) : (
            <div className={styles.emptyState}>Уроки пока не добавлены</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;