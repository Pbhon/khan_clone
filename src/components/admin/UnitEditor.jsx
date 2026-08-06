import LessonEditor from './LessonEditor';
import { createLessonTemplate } from '../../data/templates';

export default function UnitEditor({ unit, onChange, onDelete, onManageQuiz }) {
  function updateField(field, value) {
    onChange({ ...unit, [field]: value });
  }

  function addLesson() {
    onChange({ ...unit, lessons: [...unit.lessons, createLessonTemplate()] });
  }

  function updateLesson(lessonId, updatedLesson) {
    onChange({ ...unit, lessons: unit.lessons.map((l) => (l.id === lessonId ? updatedLesson : l)) });
  }

  function removeLesson(lessonId) {
    onChange({ ...unit, lessons: unit.lessons.filter((l) => l.id !== lessonId) });
  }

  return (
    <div className="unit-card">
      <div className="list-item-header">
        <input
          type="text"
          className="form-input unit-title-input"
          placeholder="Unit title"
          value={unit.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete}>
          Remove unit
        </button>
      </div>
      <textarea
        className="form-textarea"
        placeholder="Unit description"
        rows={2}
        value={unit.description}
        onChange={(e) => updateField('description', e.target.value)}
      />

      <div className="lesson-list">
        {unit.lessons.map((lesson) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            onChange={(updated) => updateLesson(lesson.id, updated)}
            onDelete={() => removeLesson(lesson.id)}
            onManageQuiz={onManageQuiz}
          />
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={addLesson}>
          + Add Lesson
        </button>
      </div>
    </div>
  );
}
