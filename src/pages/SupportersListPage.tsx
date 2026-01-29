import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { DuplicateCandidate, Supporter } from '../types';

const SupportersListPage = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    mockApi.getSupporters().then((data) => setSupporters(data));
    mockApi.getDuplicateCandidates().then((data) => setCandidates(data));
  }, []);

  const filteredSupporters = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return supporters.filter((supporter) => {
      if (supporter.mergedIntoId) return false;
      if (!lowered) return true;
      return (
        supporter.id.toLowerCase().includes(lowered) ||
        supporter.firstName.toLowerCase().includes(lowered) ||
        supporter.lastName.toLowerCase().includes(lowered) ||
        supporter.email.toLowerCase().includes(lowered)
      );
    });
  }, [supporters, query]);

  const duplicatesCount = candidates.filter((item) => item.status === 'Suggested').length;

  return (
    <div>
      <div className="page-title">Supporters</div>
      <div className="page-subtitle">Search and manage supporters across your organization.</div>

      <div className="card">
        <div className="card-header">
          <input
            className="input"
            placeholder="Search for an ID, supporter name, or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Link to="/supporters/duplicates" className="pill-button">
            Duplicates ({duplicatesCount})
          </Link>
        </div>
        <div className="grid grid-5" style={{ marginTop: '16px' }}>
          <div className="card kpi">
            <div className="kpi-label">Donors</div>
            <div className="kpi-value">1,467</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Fundraisers</div>
            <div className="kpi-value">239</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Recurring Donors</div>
            <div className="kpi-value">538</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Supporters</div>
            <div className="kpi-value">2,295</div>
          </div>
          <div className="card kpi">
            <div className="kpi-label">Contact Opt-In Rate</div>
            <div className="kpi-value">12%</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <div className="card-header">
          <div className="card-title">Supporter directory</div>
          <Link to="/supporters/merge-history" className="pill-button">
            View merge history
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Supporter ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Org</th>
            </tr>
          </thead>
          <tbody>
            {filteredSupporters.map((supporter) => (
              <tr key={supporter.id}>
                <td>
                  <Link className="link" to={`/supporters/${supporter.id}`}>
                    {supporter.id}
                  </Link>
                </td>
                <td>{supporter.firstName}</td>
                <td>{supporter.lastName}</td>
                <td>{supporter.email}</td>
                <td>{supporter.phone}</td>
                <td>{supporter.orgId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportersListPage;
