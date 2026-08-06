import { createSectionTemplate } from '../../data/templates';

/**
 * Edits one lesson: title, its teaching sections, and the link to its quiz.
 * Bubbles every change up to the parent (UnitEditor) via onChange rather
 * than holding its own copy of the lesson — keeps the whole course tree as
 * a single source of truth up in AdminCourseEditor.
 */
export default function LessonEditor({ lesson, onChange, onDelete, onManageQuiz }) {
  function updateField(field, value) {
    onChange({ ...lesson, [field]: value });
  }

  function updateSection(index, field, value) {
    const sections = lesson.sections.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange({ ...lesson, sections });
  }

  function addSection() {
    onChange({ ...lesson, sections: [...lesson.sections, createSectionTemplate()] });
  }

  function removeSection(index) {
    onChange({ ...lesson, sections: lesson.sections.filter((_, i) => i !== index) });
  }

  return (
    <div className="lesson-card">
      <div className="list-item-header">
        <input
          type="text"
          className="form-input"
          placeholder="Lesson title"
          value={lesson.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
          Remove lesson
        </button>
      </div>

      <div className="section-editor-list">
        <div className="form-hint">Teaching sections</div>
        {lesson.sections.map((section, index) => (
          <div className="section-row" key={index}>
            <input
              type="text"
              className="form-input"
              placeholder="Section heading (e.g. Introduction)"
              value={section.heading}
              onChange={(e) => updateSection(index, 'heading', e.target.value)}
            />
            <textarea
              className="form-textarea"
              placeholder="Section content"
              rows={3}
              value={section.body}
              onChange={(e) => updateSection(index, 'body', e.target.value)}
            />
            {lesson.sections.length > 1 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSection(index)}>
                Remove section
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addSection}>
          + Add section
        </button>
      </div>

      <div className="lesson-quiz-row">
        {lesson.quizId ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onManageQuiz(lesson)}>
            📝 Edit Quiz
          </button>
        ) : (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onManageQuiz(lesson)}>
            + Add Quiz to This Lesson
          </button>
        )}
      </div>
    </div>
  );
}
