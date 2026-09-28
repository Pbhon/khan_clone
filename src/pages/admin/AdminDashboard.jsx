import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { getAllStudentCount } from '../../services/authService';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getTotalLessonsCount } from '../../utils/progressUtils';

export default function AdminDashboard() {
  const { courses, dataLoading, dataError, removeCourse, seedStarterContent, setCourseStatus } = useData();
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [seeding, setSeeding] = useState(false);

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const draftCount = courses.length - publishedCount;

  // getAllStudentCount is async under Firebase (it's a Firestore query) —
  // was a synchronous array filter in the mock version.
  useEffect(() => {
    let cancelled = false;
    getAllStudentCount()
      .then((count) => {
        if (!cancelled) setStudentCount(count);
      })
      .catch(() => {
        if (!cancelled) setStudentCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleTogglePublish(course) {
    await setCourseStatus(course.id, course.status === 'published' ? 'draft' : 'published');
  }

  async function handleDeleteConfirmed() {
    await removeCourse(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  async function handleSeedStarterContent() {
    setSeeding(true);
    try {
      await seedStarterContent();
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage courses, lessons, and quiz banks.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/courses/new')}>
          + Create New Course
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{publishedCount}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{draftCount}</div>
          <div className="stat-label">Draft</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{studentCount ?? '—'}</div>
          <div className="stat-label">Students</div>
        </div>
      </div>

      {dataError && <div className="alert alert-error">{dataError}</div>}

      {dataLoading ? (
        <div className="empty-state"><p>Loading courses…</p></div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>Create your first course to get started.</p>
          <div className="empty-state-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/courses/new')}>
              + Create New Course
            </button>
            <button type="button" className="btn btn-outline" onClick={handleSeedStarterContent} disabled={seeding}>
              {seeding ? 'Adding…' : 'Add Starter Courses'}
            </button>
          </div>
        </div>
      ) : (
        <div className="table-scroll"><table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Content</th>
              <th>Last Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>
                  <Link to={`/admin/courses/${course.id}/edit`} className="admin-table-title-link">
                    {course.title || 'Untitled Course'}
                  </Link>
                </td>
                <td>{course.subject}</td>
                <td>
                  <span className={`pill ${course.status === 'published' ? 'pill-published' : 'pill-draft'}`}>
                    {course.status}
                  </span>
                </td>
                <td>
                  {course.units.length} unit{course.units.length !== 1 ? 's' : ''} · {getTotalLessonsCount(course)}{' '}
                  lesson{getTotalLessonsCount(course) !== 1 ? 's' : ''}
                </td>
                <td>{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : '—'}</td>
                <td>
                  <div className="admin-table-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleTogglePublish(course)}>
                      {course.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link to={`/admin/courses/${course.id}/edit`} className="btn btn-outline btn-sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-danger-text"
                      onClick={() => setConfirmDeleteId(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this course?"
        message="This permanently deletes the course, its lessons, and any linked quizzes. Students already enrolled will lose access to it. This can't be undone."
        confirmLabel="Delete Course"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
