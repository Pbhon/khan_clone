import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CourseCard from '../components/CourseCard';
import { findNextIncompleteLesson } from '../utils/progressUtils';

export default function CourseCatalog() {
  const { publishedCourses, progress, enroll, dataLoading, dataError } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const subjects = useMemo(() => {
    const set = new Set(publishedCourses.map((c) => c.subject));
    return ['All', ...Array.from(set)];
  }, [publishedCourses]);

  const filtered = publishedCourses.filter((course) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query || course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query);
    const matchesSubject = subjectFilter === 'All' || course.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  function getProgressFor(courseId) {
    return progress.find((p) => p.courseId === courseId) || null;
  }

  function getContinueLink(course, progressRecord) {
    const nextLesson = findNextIncompleteLesson(course, progressRecord.lessonCompletion);
    return nextLesson ? `/courses/${course.id}/lessons/${nextLesson.id}` : `/courses/${course.id}`;
  }

  async function handleEnroll(courseId) {
    await enroll(courseId);
    navigate(`/courses/${courseId}`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Courses</h1>
          <p className="page-subtitle">
            {publishedCourses.length} course{publishedCourses.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {dataError && <div className="alert alert-error">{dataError}</div>}

      <div className="catalog-filters">
        <input
          type="text"
          className="form-input"
          aria-label="Search courses"
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by subject" className="form-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {dataLoading ? (
        <div className="empty-state"><p>Loading courses…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No courses match your search</h3>
          <p>Try a different keyword or subject.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((course) => {
            const courseProgress = getProgressFor(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={courseProgress}
                onEnroll={handleEnroll}
                continueLink={courseProgress ? getContinueLink(course, courseProgress) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
