import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { currentUser, isAdmin } = useAuth();

  if (currentUser) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="landing">
      <div className="landing-hero">
        <span className="landing-eyebrow">Free, self-paced learning</span>
        <h1 className="landing-title">
          Learn at your own pace.
          <br />
          Never lose your place.
        </h1>
        <p className="landing-subtitle">
          Work through courses built from short lessons and practice quizzes. Your progress is saved automatically,
          and every quiz draws from a larger question bank — so a retake is never just the same test twice.
        </p>
        <div className="landing-actions">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Create a free account
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Log in
          </Link>
        </div>
      </div>

      <div className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-mark">01</div>
          <h3>Pick up right where you left off</h3>
          <p>Your dashboard tracks completion lesson by lesson, so nothing gets lost between visits.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">02</div>
          <h3>Quizzes that adapt to retakes</h3>
          <p>Miss a question and you get a second try, then a clear explanation of the right answer — every time.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-mark">03</div>
          <h3>Awards that track real progress</h3>
          <p>Badges unlock for finishing lessons, passing quizzes cleanly, and improving on retakes.</p>
        </div>
      </div>
    </div>
  );
}
