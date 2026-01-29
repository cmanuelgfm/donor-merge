import { Link } from 'react-router-dom';
import { mockApi } from '../mockApi';

const Dashboard = () => {
  const duplicateCount = mockApi
    .getDuplicateCandidates({ status: 'Suggested' })
    .length;

  return (
    <div>
      <div className="supporter-header">
        <div>
          <h1 className="page-title">Hello, Colin 👋</h1>
          <p className="page-subtitle">
            Time & dates displayed in America/Los_Angeles
          </p>
        </div>
        <div className="table-actions">
          <button className="button">Add offline donation</button>
          <button className="button primary">Launch a campaign</button>
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity</div>
            <div className="badge">Today</div>
          </div>
          <div className="notice">
            Org Admin purchased a free ticket for the Ticketed Summit tmp 041125
            campaign
          </div>
          <div className="divider" />
          <div className="notice">4 recurring commerce items made a recurring $11.10 donation.</div>
          <div className="divider" />
          <div className="notice">Test 174488875538-RDP-New made a recurring $22.11 donation.</div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Performance</div>
            <div className="badge">Weekly</div>
          </div>
          <div className="section-grid">
            <div>
              <div className="kpi-label">Donations</div>
              <div className="kpi-value">44</div>
            </div>
            <div>
              <div className="kpi-label">New Supporters</div>
              <div className="kpi-value">2</div>
            </div>
            <div>
              <div className="kpi-label">Raised Online</div>
              <div className="kpi-value">$1,607</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">We found {duplicateCount} potential duplicate supporters</div>
            <div className="page-subtitle">Review suggested merges before the next campaign push.</div>
          </div>
          <Link className="button primary" to="/supporters/duplicates">
            Review duplicates
          </Link>
        </div>
        <div className="notice">
          Your data quality assistant flagged new matches based on email, phone, and address similarity.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
