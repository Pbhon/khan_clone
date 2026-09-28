import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ProgressBar from '../components/ProgressBar';

export default function CourseDetail() {
  const { courseId } = useParams();
  const { courses, dataLoading, getCourseProgress, enroll } = useData();
  const course = courses.find((c) => c.id === courseId);

  if (dataLoading) {
    return <div className="page container-narrow"><p className="text-muted">Loading course…</p></div>;
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const progress = getCourseProgress(courseId);
  const isEnrolled = Boolean(progress);

  async function handleEnroll() {
    await enroll(courseId);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="pill pill-muted">{course.subject}</span>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-subtitle">{course.description}</p>
        </div>
      </div>

      {isEnrolled ? (
        <div className="card course-progress-summary">
          <ProgressBar percent={progress.percentComplete} label="Your progress" />
          {progress.status === 'completed' && (
            <div className="alert alert-success">You&rsquo;ve completed this course. 🎉</div>
          )}
        </div>
      ) : (
        <div className="card course-progress-summary flex-between">
          <p className="text-muted">Enroll to start tracking your progress through this course.</p>
          <button type="button" className="btn btn-primary" onClick={handleEnroll}>
            Enroll
          </button>
        </div>
      )}

      <div className="unit-list">
        {course.units.map((unit, unitIndex) => (
          <div className="card unit-display-card" key={unit.id}>
            <h3 className="unit-display-title">
              Unit {unitIndex + 1}: {unit.title}
            </h3>
            {unit.description && <p className="text-muted">{unit.description}</p>}
            <ul className="lesson-display-list">
              {unit.lessons.map((lesson) => {
                const isComplete = isEnrolled && Boolean(progress.lessonCompletion[lesson.id]);
                const content = (
                  <>
                    <span className="lesson-check">{isComplete ? '✓' : '○'}</span>
                    <span>{lesson.title}</span>
                    {lesson.quizId && <span className="pill pill-muted lesson-quiz-tag">Quiz</span>}
                  </>
                );
                return (
                  <li key={lesson.id}>
                    {isEnrolled ? (
                      <Link
                        to={`/courses/${courseId}/lessons/${lesson.id}`}
                        className={`lesson-row ${isComplete ? 'complete' : ''}`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="lesson-row disabled">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
