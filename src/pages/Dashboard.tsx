import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { mockApi } from '../mock/mockApi';

export const Dashboard = () => {
  const candidates = mockApi
    .getDuplicateCandidates()
    .filter((candidate) => candidate.status === 'Suggested');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Home</p>
          <h1>Hello, Colin 👋</h1>
        </div>
        <div className="header-actions">
          <button className="btn-outline">Add offline donation</button>
          <button className="btn-primary">Launch a campaign</button>
        </div>
      </div>

      <div className="grid-2">
        <Card>
          <h2>Activity</h2>
          <div className="activity-item">
            <div className="avatar">OA</div>
            <div>
              <p className="activity-title">
                Org Admin purchased a Free ticket for the Ticketed Summit tmp 041125
                campaign
              </p>
              <span className="muted">14:18 AM</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="avatar">41</div>
            <div>
              <p className="activity-title">
                4 recurring commerce items made a recurring $11.10 Donation to the NPC
                commerce cart campaign
              </p>
              <span className="muted">11:19 PM</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2>Performance</h2>
          <div className="stack">
            <div className="stat-row">
              <span>Donations</span>
              <strong>44</strong>
            </div>
            <div className="stat-row">
              <span>New Supporters</span>
              <strong>2</strong>
            </div>
            <div className="stat-row">
              <span>Raised Online</span>
              <strong>$1,607</strong>
            </div>
          </div>
        </Card>
      </div>

      <Card className="notification-card">
        <div>
          <h3>We found {candidates.length} potential duplicate supporters</h3>
          <p className="muted">
            Review suggested merges directly in-product. No CSV exports needed.
          </p>
        </div>
        <Link className="btn-primary" to="/supporters/duplicates">
          Review duplicates
        </Link>
      </Card>
    </div>
  );
};
