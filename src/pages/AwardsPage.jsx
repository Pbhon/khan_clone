import { useData } from '../context/DataContext';
import AwardBadge from '../components/AwardBadge';

export default function AwardsPage() {
  const { awardsCatalog, userAwards } = useData();
  const earnedMap = new Map(userAwards.map((ua) => [ua.awardId, ua.earnedAt]));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Awards</h1>
          <p className="page-subtitle">
            {userAwards.length} of {awardsCatalog.length} earned
          </p>
        </div>
      </div>

      <div className="award-grid">
        {awardsCatalog.map((award) => (
          <AwardBadge
            key={award.id}
            award={award}
            earned={earnedMap.has(award.id)}
            earnedAt={earnedMap.get(award.id)}
          />
        ))}
      </div>
    </div>
  );
}
