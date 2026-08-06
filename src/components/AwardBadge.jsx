export default function AwardBadge({ award, earned, earnedAt, compact = false }) {
  return (
    <div className={`award-badge ${earned ? 'earned' : 'locked'} ${compact ? 'compact' : ''}`}>
      <div className="award-icon">{award.icon}</div>
      <div className="award-info">
        <div className="award-name">{award.name}</div>
        {!compact && <div className="award-description">{award.description}</div>}
        {earned && earnedAt && !compact && (
          <div className="award-earned-date">Earned {new Date(earnedAt).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}
