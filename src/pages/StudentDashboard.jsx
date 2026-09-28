import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import CourseCard from '../components/CourseCard';
import AwardBadge from '../components/AwardBadge';
import { findNextIncompleteLesson } from '../utils/progressUtils';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const { courses, progress, userAwards, awardsCatalog, newAwardNotice, clearAwardNotice, dataLoading, dataError } = useData();

  const enrolledCourses = progress
    .map((p) => ({ progress: p, course: courses.find((c) => c.id === p.courseId) }))
    .filter((item) => Boolean(item.course));

  function getContinueLink(course, progressRecord) {
    const nextLesson = findNextIncompleteLesson(course, progressRecord.lessonCompletion);
    return nextLesson ? `/courses/${course.id}/lessons/${nextLesson.id}` : `/courses/${course.id}`;
  }

  const recentAwards = [...userAwards]
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 4)
    .map((ua) => ({ ...ua, award: awardsCatalog.find((a) => a.id === ua.awardId) }))
    .filter((ua) => Boolean(ua.award));

  return (
    <div className="page">
      {newAwardNotice && (
        <div className="toast toast-award">
          <span className="award-icon">{newAwardNotice.icon}</span>
          <div className="toast-body">
            <strong>Award unlocked: {newAwardNotice.name}</strong>
            <div className="text-sm text-muted">{newAwardNotice.description}</div>
          </div>
          <button type="button" className="toast-dismiss" onClick={clearAwardNotice} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {currentUser.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Here&rsquo;s where you left off.</p>
        </div>
      </div>

      {dataError && <div className="alert alert-error">{dataError}</div>}

      {dataLoading ? (
        <div className="empty-state"><p>Loading your courses…</p></div>
      ) : enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <h3>You haven&rsquo;t enrolled in anything yet</h3>
          <p>Browse the catalog and pick a course to get started.</p>
          <Link to="/courses" className="btn btn-primary">
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {enrolledCourses.map(({ course, progress: p }) => (
            <CourseCard key={course.id} course={course} progress={p} continueLink={getContinueLink(course, p)} />
          ))}
        </div>
      )}

      <div className="dashboard-section">
        <div className="flex-between">
          <h2 className="section-title">Your Awards</h2>
          <Link to="/awards" className="link-muted">
            View all →
          </Link>
        </div>
        {recentAwards.length === 0 ? (
          <p className="text-muted">Complete a lesson or quiz to start earning awards.</p>
        ) : (
          <div className="award-strip">
            {recentAwards.map((ua) => (
              <AwardBadge key={ua.awardId} award={ua.award} earned earnedAt={ua.earnedAt} compact />
            ))}
          </div>
        )}
      </div>

      {enrolledCourses.length > 0 && (
        <div className="dashboard-section">
          <Link to="/courses" className="btn btn-outline">
            Browse more courses
          </Link>
        </div>
      )}
    </div>
  );
}
