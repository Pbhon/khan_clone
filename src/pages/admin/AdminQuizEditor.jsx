import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import { createQuestionTemplate } from '../../data/templates';

export default function AdminQuizEditor() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { getQuizById, saveQuiz, removeQuiz } = useData();

  const [quiz, setQuiz] = useState(null);
  const [notice, setNotice] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState(null);
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getQuizById(quizId)
      .then((existing) => {
        if (cancelled) return;
        if (existing) setQuiz(existing);
        else navigate('/admin', { replace: true });
      })
      .catch((error) => {
        if (!cancelled) setNotice(error.message || 'Could not load this quiz.');
      });
    return () => {
      cancelled = true;
    };
  }, [getQuizById, navigate, quizId]);

  if (!quiz) {
    return (
      <div className="page container-narrow">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  const backLink = quiz.courseId ? `/admin/courses/${quiz.courseId}/edit` : '/admin';

  function updateField(field, value) {
    setQuiz((q) => ({ ...q, [field]: value }));
  }

  function addQuestion() {
    const newQuestion = createQuestionTemplate();
    setQuiz((q) => ({ ...q, questions: [...q.questions, newQuestion] }));
    setEditingQuestionId(newQuestion.id);
  }

  function updateQuestion(questionId, updates) {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question
      ),
    }));
  }

  function updateChoice(questionId, choiceIndex, value) {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id !== questionId) return question;
        const choices = question.choices.map((c, i) => (i === choiceIndex ? value : c));
        return { ...question, choices };
      }),
    }));
  }

  function removeQuestion(questionId) {
    setQuiz((q) => ({ ...q, questions: q.questions.filter((question) => question.id !== questionId) }));
    setConfirmDeleteQuestionId(null);
  }

  function validate() {
    if (!quiz.title.trim()) return 'Give the quiz a title.';
    if (quiz.questions.length === 0) return 'Add at least one question before saving.';
    for (const question of quiz.questions) {
      if (!question.prompt.trim()) return 'Every question needs a prompt.';
      if (question.choices.some((c) => !c.trim())) {
        return 'Every choice needs text — remove empty choices or fill them in.';
      }
      if (!question.explanation.trim()) return 'Every question needs an explanation for the correct answer.';
    }
    if (quiz.questionsPerAttempt > quiz.questions.length) {
      return `Questions per attempt (${quiz.questionsPerAttempt}) can't be more than the number of questions in the bank (${quiz.questions.length}).`;
    }
    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      setNotice(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      const saved = await saveQuiz(quiz);
      setQuiz(saved);
      setNotice('Quiz saved.');
    } catch (error) {
      setNotice(error.message || 'Could not save the quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuiz() {
    setSaving(true);
    try {
      await removeQuiz(quiz.id);
      navigate(backLink);
    } catch (error) {
      setConfirmDeleteQuiz(false);
      setNotice(error.message || 'Could not delete the quiz.');
      setSaving(false);
    }
  }

  const bankWarning = quiz.questionsPerAttempt > quiz.questions.length;

  return (
    <div className="page container-narrow">
      <button type="button" className="link-muted back-link" onClick={() => navigate(backLink)}>
        ← Back to Course
      </button>

      <div className="page-header">
        <h1 className="page-title">Edit Quiz</h1>
      </div>

      {notice && <div className="alert alert-info">{notice}</div>}

      <div className="card editor-section">
        <div className="form-group">
          <label className="form-label" htmlFor="quiz-title">
            Quiz Title
          </label>
          <input
            id="quiz-title"
            type="text"
            className="form-input"
            value={quiz.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. What Is a Variable? — Quiz"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="quiz-per-attempt">
              Questions per attempt
            </label>
            <input
              id="quiz-per-attempt"
              type="number"
              min={1}
              className="form-input"
              value={quiz.questionsPerAttempt}
              onChange={(e) => updateField('questionsPerAttempt', Number(e.target.value) || 1)}
            />
            <div className="form-hint">Randomly sampled from the bank below on every attempt, including retakes.</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="quiz-passing">
              Passing score (%)
            </label>
            <input
              id="quiz-passing"
              type="number"
              min={0}
              max={100}
              className="form-input"
              value={quiz.passingScorePercent}
              onChange={(e) => updateField('passingScorePercent', Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className={`bank-status ${bankWarning ? 'warning' : ''}`}>
          {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} in the bank · using{' '}
          {quiz.questionsPerAttempt} per attempt
          {bankWarning && ' — add more questions or lower this number.'}
        </div>
      </div>

      <div className="editor-section">
        <h2 className="section-title">Question Bank</h2>
        {quiz.questions.map((question, index) => (
          <div className="question-card" key={question.id}>
            {editingQuestionId === question.id ? (
              <QuestionForm
                question={question}
                onChange={(updates) => updateQuestion(question.id, updates)}
                onChoiceChange={(choiceIndex, value) => updateChoice(question.id, choiceIndex, value)}
                onDone={() => setEditingQuestionId(null)}
              />
            ) : (
              <div className="question-summary">
                <div className="question-summary-text">
                  <span className="question-number">Q{index + 1}</span>
                  {question.prompt || <span className="text-muted">(no prompt yet)</span>}
                </div>
                <div className="list-item-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditingQuestionId(question.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger-text"
                    onClick={() => setConfirmDeleteQuestionId(question.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={addQuestion}>
          + Add Question
        </button>
      </div>

      <div className="editor-footer flex-between">
        <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => setConfirmDeleteQuiz(true)}>
          Delete Quiz
        </button>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(backLink)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteQuestionId)}
        title="Delete this question?"
        message="This removes it from the bank. This can't be undone."
        confirmLabel="Delete Question"
        onConfirm={() => removeQuestion(confirmDeleteQuestionId)}
        onCancel={() => setConfirmDeleteQuestionId(null)}
      />

      <ConfirmDialog
        open={confirmDeleteQuiz}
        title="Delete this quiz?"
        message="This removes the entire quiz and its question bank from the lesson. This can't be undone."
        confirmLabel="Delete Quiz"
        onConfirm={handleDeleteQuiz}
        onCancel={() => setConfirmDeleteQuiz(false)}
      />
    </div>
  );
}

function QuestionForm({ question, onChange, onChoiceChange, onDone }) {
  return (
    <div className="question-form">
      <div className="form-group">
        <label className="form-label">Prompt</label>
        <textarea
          className="form-textarea"
          rows={2}
          value={question.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="What question should students answer?"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Choices — select the correct one</label>
        {question.choices.map((choice, index) => (
          <div className="choice-input-row" key={index}>
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={question.correctIndex === index}
              onChange={() => onChange({ correctIndex: index })}
              aria-label={`Mark choice ${index + 1} as correct`}
            />
            <input
              type="text"
              className="form-input"
              value={choice}
              onChange={(e) => onChoiceChange(index, e.target.value)}
              placeholder={`Choice ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="form-group">
        <label className="form-label">Explanation</label>
        <textarea
          className="form-textarea"
          rows={2}
          value={question.explanation}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Why is the correct answer correct?"
        />
      </div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onDone}>
        Done Editing
      </button>
    </div>
  );
}
