import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { DuplicateCandidate } from '../types';
import { trackEvent } from '../analytics';

const DashboardPage = () => {
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);

  useEffect(() => {
    mockApi.getDuplicateCandidates().then((data) => setCandidates(data));
  }, []);

  const suggestedCount = candidates.filter((item) => item.status === 'Suggested').length;

  useEffect(() => {
    trackEvent('duplicates_queue_viewed', { source: 'dashboard_card' });
  }, []);

  return (
    <div>
      <div className="page-title">Hello, Colin 👋</div>
      <div className="page-subtitle">Here’s a snapshot of supporter activity across your org.</div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity</div>
            <div className="inline-list">
              <span className="tag">Date</span>
              <span className="tag">Filters (0)</span>
            </div>
          </div>
          <div className="divider" />
          <div className="grid" style={{ gap: '16px' }}>
            <div>
              <strong>Today</strong>
              <p className="muted">Org Admin purchased a free ticket for the Ticketed Summit campaign.</p>
            </div>
            <div>
              <strong>Yesterday</strong>
              <p className="muted">4 recurring commerce items made a recurring $11.10 donation.</p>
            </div>
            <div>
              <strong>Earlier this week</strong>
              <p className="muted">Marcos Ramirez made a recurring $25.25 donation to Philadelphia Zoo 2025.</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Performance</div>
          <div className="divider" />
          <div className="grid" style={{ gap: '16px' }}>
            <div>
              <div className="muted">Donations</div>
              <div className="kpi-value">44</div>
            </div>
            <div>
              <div className="muted">New Supporters</div>
              <div className="kpi-value">2</div>
            </div>
            <div>
              <div className="muted">Raised Online</div>
              <div className="kpi-value">$1,607</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <div className="card-title">Potential duplicate supporters</div>
          <Link to="/supporters/duplicates" className="pill-button">
            Review duplicates
          </Link>
        </div>
        <p>
          We found <strong>{suggestedCount}</strong> potential duplicate supporters that could be merged.
        </p>
        <p className="muted">
          Reviewing suggested merges keeps donation history aligned and prevents double counting in
          reports.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
