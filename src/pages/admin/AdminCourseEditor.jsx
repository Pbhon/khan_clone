import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import UnitEditor from '../../components/admin/UnitEditor';
import ConfirmDialog from '../../components/ConfirmDialog';
import { createCourseTemplate, createUnitTemplate, createQuizTemplate } from '../../data/templates';

const SUBJECTS = ['Math', 'Science', 'Computer Science', 'History', 'Language Arts', 'General'];

export default function AdminCourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, saveCourse, saveQuiz, removeCourse } = useData();
  const isEditMode = Boolean(courseId);

  const [course, setCourse] = useState(null);
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      setCourse(createCourseTemplate());
      return;
    }
    const existing = courses.find((c) => c.id === courseId);
    if (existing) {
      setCourse((prev) => prev ?? existing); // don't clobber in-progress edits on unrelated re-renders
    } else if (courses.length > 0) {
      // Data has loaded and this id genuinely doesn't exist — bail out.
      navigate('/admin', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, courses]);

  if (!course) {
    return (
      <div className="page container-narrow">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  function updateField(field, value) {
    setCourse((c) => ({ ...c, [field]: value }));
  }

  function addUnit() {
    setCourse((c) => ({ ...c, units: [...c.units, createUnitTemplate()] }));
  }

  function updateUnit(unitId, updatedUnit) {
    setCourse((c) => ({ ...c, units: c.units.map((u) => (u.id === unitId ? updatedUnit : u)) }));
  }

  function removeUnit(unitId) {
    setCourse((c) => ({ ...c, units: c.units.filter((u) => u.id !== unitId) }));
  }

  function findAndUpdateLesson(courseObj, lessonId, updates) {
    return {
      ...courseObj,
      units: courseObj.units.map((unit) => ({
        ...unit,
        lessons: unit.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
      })),
    };
  }

  function handleManageQuiz(lesson) {
    if (!course.id) {
      setNotice('Save the course first — then you can add a quiz to any lesson.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (lesson.quizId) {
      navigate(`/admin/quizzes/${lesson.quizId}`);
      return;
    }
    // Create the quiz, link it to this lesson, and persist immediately —
    // that way the link survives even if the admin never returns to click
    // the main Save button after editing the quiz.
    const newQuiz = saveQuiz(createQuizTemplate({ lessonId: lesson.id, courseId: course.id }));
    const updatedCourse = findAndUpdateLesson(course, lesson.id, { quizId: newQuiz.id });
    setCourse(updatedCourse);
    saveCourse(updatedCourse);
    navigate(`/admin/quizzes/${newQuiz.id}`);
  }

  function validate() {
    if (!course.title.trim()) return 'Give the course a title before saving.';
    if (course.units.length === 0) return 'Add at least one unit.';
    if (course.units.some((u) => !u.title.trim())) return 'Every unit needs a title.';
    return null;
  }

  function handleSave() {
    const error = validate();
    if (error) {
      setNotice(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const saved = saveCourse(course);
    setCourse(saved);
    setNotice('Course saved.');
    if (!isEditMode) {
      navigate(`/admin/courses/${saved.id}/edit`, { replace: true });
    }
  }

  function handleDeleteConfirmed() {
    removeCourse(course.id);
    navigate('/admin');
  }

  return (
    <div className="page container-narrow">
      <button type="button" className="link-muted back-link" onClick={() => navigate('/admin')}>
        ← Back to Admin Dashboard
      </button>

      <div className="page-header">
        <h1 className="page-title">{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
      </div>

      {notice && <div className="alert alert-info">{notice}</div>}

      <div className="card editor-section">
        <div className="form-group">
          <label className="form-label" htmlFor="course-title">
            Course Title
          </label>
          <input
            id="course-title"
            type="text"
            className="form-input"
            value={course.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Algebra Foundations"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="course-description">
            Description
          </label>
          <textarea
            id="course-description"
            className="form-textarea"
            rows={3}
            value={course.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="What will students learn in this course?"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="course-subject">
              Subject
            </label>
            <select
              id="course-subject"
              className="form-select"
              value={course.subject}
              onChange={(e) => updateField('subject', e.target.value)}
            >
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="course-status">
              Visibility
            </label>
            <select
              id="course-status"
              className="form-select"
              value={course.status}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value="draft">Draft — hidden from students</option>
              <option value="published">Published — visible to students</option>
            </select>
          </div>
        </div>
      </div>

      <div className="editor-section">
        <h2 className="section-title">Units &amp; Lessons</h2>
        {course.units.map((unit) => (
          <UnitEditor
            key={unit.id}
            unit={unit}
            onChange={(updated) => updateUnit(unit.id, updated)}
            onDelete={() => removeUnit(unit.id)}
            onManageQuiz={handleManageQuiz}
          />
        ))}
        <button type="button" className="btn btn-outline" onClick={addUnit}>
          + Add Unit
        </button>
      </div>

      <div className="editor-footer flex-between">
        <div>
          {isEditMode && (
            <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => setConfirmDelete(true)}>
              Delete Course
            </button>
          )}
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin')}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save Course
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this course?"
        message="This permanently deletes the course, its lessons, and any linked quizzes. This can't be undone."
        confirmLabel="Delete Course"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
