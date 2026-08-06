import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getAllLessons } from '../utils/progressUtils';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const { courses, getCourseProgress, completeLesson } = useData();
  const course = courses.find((c) => c.id === courseId);

  if (!course) return <Navigate to="/courses" replace />;

  const allLessons = getAllLessons(course);
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = allLessons[lessonIndex];

  if (!lesson) return <Navigate to={`/courses/${courseId}`} replace />;

  const progress = getCourseProgress(courseId);
  if (!progress) return <Navigate to={`/courses/${courseId}`} replace />;

  const isComplete = Boolean(progress.lessonCompletion[lesson.id]);
  const prevLesson = allLessons[lessonIndex - 1];
  const nextLesson = allLessons[lessonIndex + 1];
  const attempts = (lesson.quizId && progress.quizAttempts[lesson.quizId]) || [];
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null;

  return (
    <div className="page container-narrow">
      <Link to={`/courses/${courseId}`} className="link-muted back-link">
        ← Back to {course.title}
      </Link>

      <div className="page-header">
        <h1 className="page-title">{lesson.title}</h1>
        {isComplete && <span className="pill pill-success">Completed</span>}
      </div>

      <div className="lesson-content">
        {lesson.sections.map((section, index) => (
          <div className="lesson-section" key={index}>
            {section.heading && <h3>{section.heading}</h3>}
            <p className="lesson-section-body">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="card lesson-action-card">
        {lesson.quizId ? (
          <div className="flex-between">
            <div>
              <strong>{isComplete ? 'Quiz passed ✓' : 'Practice Quiz'}</strong>
              {bestScore !== null && <div className="text-sm text-muted">Best score so far: {bestScore}%</div>}
            </div>
            <Link to={`/courses/${courseId}/lessons/${lesson.id}/quiz`} className="btn btn-primary">
              {attempts.length > 0 ? 'Retake Quiz' : 'Take Quiz'}
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => completeLesson(courseId, lesson.id)}
            disabled={isComplete}
          >
            {isComplete ? 'Completed ✓' : 'Mark as Complete'}
          </button>
        )}
      </div>

      <div className="lesson-nav flex-between">
        {prevLesson ? (
          <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`} className="btn btn-ghost">
            ← {prevLesson.title}
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`} className="btn btn-ghost">
            {nextLesson.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
