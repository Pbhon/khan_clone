import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { getTotalLessonsCount } from '../utils/progressUtils';

/**
 * Renders differently depending on whether the student is enrolled:
 * enrolled → progress bar + "Continue" (jumps to their next lesson)
 * not enrolled → description + "Enroll" button
 */
export default function CourseCard({ course, progress, onEnroll, continueLink }) {
  const isEnrolled = Boolean(progress);
  const lessonCount = getTotalLessonsCount(course);

  return (
    <div className="card course-card">
      <div className="course-card-top">
        <span className="pill pill-muted">{course.subject}</span>
        {isEnrolled && progress.status === 'completed' && <span className="pill pill-success">Completed</span>}
      </div>
      <h3 className="course-card-title">{course.title}</h3>
      <p className="course-card-description">{course.description}</p>
      <div className="course-card-meta">
        {course.units.length} unit{course.units.length !== 1 ? 's' : ''} · {lessonCount} lesson
        {lessonCount !== 1 ? 's' : ''}
      </div>

      {isEnrolled ? (
        <div className="course-card-progress">
          <ProgressBar percent={progress.percentComplete} />
          <Link to={continueLink} className="btn btn-primary btn-block">
            {progress.status === 'completed' ? 'Review Course' : 'Continue'}
          </Link>
        </div>
      ) : (
        <button type="button" className="btn btn-primary btn-block" onClick={() => onEnroll(course.id)}>
          Enroll
        </button>
      )}
    </div>
  );
}
