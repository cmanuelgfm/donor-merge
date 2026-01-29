import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../mockApi';

const SupportersList = () => {
  const [search, setSearch] = useState('');
  const supporters = useMemo(() => mockApi.getSupporters(search), [search]);
  const duplicatesCount = mockApi.getDuplicateCandidates({ status: 'Suggested' }).length;

  const donorsCount = supporters.filter((supporter) => supporter.transactionsCount > 0).length;
  const fundraisersCount = supporters.filter((supporter) => supporter.fundraisingPagesCount > 0).length;
  const recurringCount = supporters.filter((supporter) => supporter.recurringPlansCount > 0).length;
  const optInRate = Math.round(
    (supporters.filter((supporter) => supporter.communicationPrefs.optIn).length / supporters.length) * 100
  );

  return (
    <div>
      <div className="supporter-header">
        <div>
          <h1 className="page-title">Supporters</h1>
          <p className="page-subtitle">Search for an ID, supporter name, or email</p>
        </div>
        <Link className="pill-link" to="/supporters/duplicates">
          Duplicates ({duplicatesCount})
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row">
          <input
            className="input search-input"
            placeholder="Search for an ID, supporter name, or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="button">Columns (9)</button>
          <button className="button">Save to my reports</button>
        </div>
        <div className="card-grid kpi-grid" style={{ marginTop: 16 }}>
          <div className="kpi-card">
            <div className="kpi-label">Donors</div>
            <div className="kpi-value">{donorsCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Fundraisers</div>
            <div className="kpi-value">{fundraisersCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Recurring Donors</div>
            <div className="kpi-value">{recurringCount}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Supporters</div>
            <div className="kpi-value">{supporters.length}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Contact Opt-In Rate</div>
            <div className="kpi-value">{Number.isFinite(optInRate) ? `${optInRate}%` : '0%'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Supporter ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Transactions</th>
              <th>Recurring Plans</th>
              <th>Fundraising Pages</th>
            </tr>
          </thead>
          <tbody>
            {supporters.map((supporter) => (
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
                <td>{supporter.transactionsCount}</td>
                <td>{supporter.recurringPlansCount}</td>
                <td>{supporter.fundraisingPagesCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportersList;
