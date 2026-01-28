import { Link } from 'react-router-dom';
import { mockApi } from '../data/mockApi';
import { useEffect } from 'react';
import { logEvent } from '../utils/analytics';

const Dashboard = () => {
  const summary = mockApi.getDashboardSummary();

  useEffect(() => {
    logEvent('duplicates_queue_viewed', { entry: 'dashboard' });
  }, []);

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <h2>Activity</h2>
          <span className="muted">Today</span>
        </div>
        <p className="muted">
          Welcome back! Review the latest supporter activity and quickly address data hygiene tasks.
        </p>
        <div className="divider" />
        <div className="panel">
          <strong>We found {summary.duplicatesCount} potential duplicate supporters</strong>
          <p className="muted">Suggested merges are ready for review.</p>
          <Link className="button" to="/supporters/duplicates">
            Review duplicates
          </Link>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h2>Performance</h2>
          <span className="muted">Weekly snapshot</span>
        </div>
        <div className="kpi-grid">
          <div className="kpi">
            <span>Donations</span>
            <strong>44</strong>
          </div>
          <div className="kpi">
            <span>New Supporters</span>
            <strong>12</strong>
          </div>
          <div className="kpi">
            <span>Raised Online</span>
            <strong>$1,607</strong>
          </div>
        </div>
        <div className="panel">
          <strong>Data quality score: 92%</strong>
          <p className="muted">Duplicates are the #1 blocker to accurate fundraising attribution.</p>
          <button className="button secondary">View report</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
