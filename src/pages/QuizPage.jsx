import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import * as quizService from '../services/quizService';
import { calculateScore } from '../utils/quizUtils';
import { getAllLessons } from '../utils/progressUtils';

// A student gets this many tries at a single question before the correct
// answer is revealed. Change this one number to adjust that behavior
// app-wide.
const MAX_ATTEMPTS_PER_QUESTION = 2;

export default function QuizPage() {
  const { courseId, lessonId } = useParams();
  const { courses, submitQuizAttempt } = useData();
  const course = courses.find((c) => c.id === courseId);
  const lesson = course ? getAllLessons(course).find((l) => l.id === lessonId) : null;
  const quiz = lesson?.quizId ? quizService.getQuizById(lesson.quizId) : null;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [resolved, setResolved] = useState(false); // question is "done": correct, or missed twice
  const [wasCorrect, setWasCorrect] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('active'); // 'active' | 'finished'
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    startAttempt();
    // Only re-sample when we're looking at a genuinely different quiz —
    // startAttempt itself is intentionally left out of the deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  function startAttempt() {
    if (!quiz) return;
    setQuestions(quizService.generateAttemptQuestions(quiz));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAttemptsOnCurrent(0);
    setResolved(false);
    setWasCorrect(null);
    setResults([]);
    setFinalScore(null);
    setPhase('active');
  }

  if (!course || !lesson || !quiz) {
    return <Navigate to={courseId ? `/courses/${courseId}` : '/dashboard'} replace />;
  }

  if (questions.length === 0 && phase === 'active') {
    return (
      <div className="page container-narrow">
        <div className="empty-state">
          <h3>This quiz doesn&rsquo;t have any questions yet</h3>
          <p>Check back after an admin adds some to the question bank.</p>
          <Link to={`/courses/${courseId}/lessons/${lessonId}`} className="btn btn-primary">
            Back to lesson
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  function handleChoose(index) {
    if (resolved) return;
    setSelectedChoice(index);
  }

  function handleSubmitAnswer() {
    if (selectedChoice === null || resolved) return;
    const isCorrect = selectedChoice === currentQuestion.correctIndex;

    if (isCorrect) {
      setWasCorrect(true);
      setResolved(true);
      setResults((prev) => [
        ...prev,
        { questionId: currentQuestion.id, correctOnFirstTry: attemptsOnCurrent === 0 },
      ]);
      return;
    }

    const attemptsSoFar = attemptsOnCurrent + 1;
    setWasCorrect(false);

    if (attemptsSoFar < MAX_ATTEMPTS_PER_QUESTION) {
      // Wrong, but they still have another try — let them pick again.
      setAttemptsOnCurrent(attemptsSoFar);
      setSelectedChoice(null);
    } else {
      // Out of attempts — reveal the correct answer and explanation.
      setAttemptsOnCurrent(attemptsSoFar);
      setResolved(true);
      setResults((prev) => [...prev, { questionId: currentQuestion.id, correctOnFirstTry: false }]);
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoice(null);
      setAttemptsOnCurrent(0);
      setResolved(false);
      setWasCorrect(null);
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const score = calculateScore(results);
    const passed = score.percent >= (quiz.passingScorePercent ?? 70);
    setFinalScore({ ...score, passed });
    submitQuizAttempt(courseId, quiz.id, lesson.id, {
      correct: score.correct,
      total: score.total,
      percent: score.percent,
      passed,
    });
    setPhase('finished');
  }

  if (phase === 'finished' && finalScore) {
    return (
      <div className="page container-narrow">
        <div className="card quiz-results">
          <div className={`quiz-results-badge ${finalScore.passed ? 'pass' : 'fail'}`}>
            {finalScore.passed ? 'Passed' : 'Not Passed Yet'}
          </div>
          <div className="quiz-score-display">{finalScore.percent}%</div>
          <p className="text-muted">
            {finalScore.correct} of {finalScore.total} correct on the first try
          </p>
          {!finalScore.passed && (
            <p className="text-muted">
              You need {quiz.passingScorePercent}% to pass. Retake it — the questions are pulled fresh from the
              bank each time.
            </p>
          )}
          <div className="form-actions">
            <Link to={`/courses/${courseId}/lessons/${lesson.id}`} className="btn btn-ghost">
              Back to Lesson
            </Link>
            <button type="button" className="btn btn-primary" onClick={startAttempt}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page container-narrow">
      <div className="quiz-progress">
        Question {currentIndex + 1} of {questions.length}
      </div>

      <div className="card quiz-question-card">
        <p className="quiz-prompt">{currentQuestion.prompt}</p>

        <div className="quiz-choices">
          {currentQuestion.choices.map((choice, index) => {
            let stateClass = '';
            if (resolved) {
              if (index === currentQuestion.correctIndex) stateClass = 'correct';
              else if (index === selectedChoice) stateClass = 'incorrect';
            } else if (index === selectedChoice) {
              stateClass = 'selected';
            }
            return (
              <button
                key={index}
                type="button"
                className={`quiz-choice ${stateClass}`}
                onClick={() => handleChoose(index)}
                disabled={resolved}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {wasCorrect === false && !resolved && (
          <div className="quiz-feedback incorrect">Not quite — give it one more try.</div>
        )}

        {resolved && (
          <div className={`quiz-feedback ${wasCorrect ? 'correct' : 'incorrect'}`}>
            <strong>{wasCorrect ? 'Correct!' : 'Here\u2019s the correct answer:'}</strong>
            <p className="quiz-explanation">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="form-actions">
          {!resolved ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitAnswer}
              disabled={selectedChoice === null}
            >
              Submit Answer
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              {currentIndex + 1 < questions.length ? 'Next Question' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
