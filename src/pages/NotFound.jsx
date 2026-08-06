import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page container-narrow">
      <div className="empty-state">
        <h1 className="page-title">404</h1>
        <p>That page doesn&rsquo;t exist.</p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    </div>
  );
}
