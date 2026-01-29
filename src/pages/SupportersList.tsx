import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { mockApi } from '../mock/mockApi';
import { Supporter } from '../mock/types';
import { useMemo, useState } from 'react';

const kpiLabels = [
  { label: 'Donors', value: 1467 },
  { label: 'Fundraisers', value: 239 },
  { label: 'Recurring Donors', value: 538 },
  { label: 'Supporters', value: 2295 },
  { label: 'Contact Opt-In Rate', value: '12%' },
];

const matchesQuery = (supporter: Supporter, query: string) => {
  const normalized = query.toLowerCase();
  return (
    supporter.id.toLowerCase().includes(normalized) ||
    supporter.firstName.toLowerCase().includes(normalized) ||
    supporter.lastName.toLowerCase().includes(normalized) ||
    supporter.email.toLowerCase().includes(normalized)
  );
};

export const SupportersList = () => {
  const [query, setQuery] = useState('');
  const supporters = mockApi
    .getSupporters()
    .filter((supporter) => supporter.status === 'Active');
  const duplicateCount = mockApi
    .getDuplicateCandidates()
    .filter((candidate) => candidate.status === 'Suggested').length;

  const filtered = useMemo(
    () => supporters.filter((supporter) => matchesQuery(supporter, query)),
    [supporters, query],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Supporters</h1>
          <p className="muted">Search and manage supporter records.</p>
        </div>
        <div className="pill-group">
          <Link className="pill" to="/supporters">
            All Supporters ({supporters.length})
          </Link>
          <Link className="pill pill-highlight" to="/supporters/duplicates">
            Duplicates ({duplicateCount})
          </Link>
        </div>
      </div>

      <Card className="search-card">
        <div className="search-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for an ID, supporter name, or email"
          />
          <button className="btn-outline">Advanced</button>
        </div>
      </Card>

      <div className="kpi-grid">
        {kpiLabels.map((kpi) => (
          <Card key={kpi.label} className="kpi-card">
            <p className="muted">{kpi.label}</p>
            <h3>{kpi.value}</h3>
            <div className="sparkline" />
          </Card>
        ))}
      </div>

      <Card>
        <table>
          <thead>
            <tr>
              <th>Supporter ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Transactions</th>
              <th>Recurring</th>
              <th>Fundraising Pages</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((supporter) => (
              <tr key={supporter.id}>
                <td>
                  <Link to={`/supporters/${supporter.id}`}>{supporter.id}</Link>
                </td>
                <td>{supporter.firstName}</td>
                <td>{supporter.lastName}</td>
                <td>{supporter.email}</td>
                <td>{supporter.phone}</td>
                <td>{supporter.transactionsCount}</td>
                <td>{supporter.recurringPlansCount}</td>
                <td>{supporter.fundraisingPagesCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
