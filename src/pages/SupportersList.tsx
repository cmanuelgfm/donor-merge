import { Link } from 'react-router-dom';
import { mockApi } from '../data/mockApi';
import { useMemo, useState } from 'react';

const SupportersList = () => {
  const [search, setSearch] = useState('');
  const supporters = useMemo(() => mockApi.listSupporters(search), [search]);
  const duplicateCount = mockApi.listDuplicateCandidates({ status: 'Suggested' }).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Supporters</h1>
          <p className="muted">Manage donors, fundraisers, and supporter communication preferences.</p>
        </div>
        <div className="tabs">
          <span className="tab active">All supporters</span>
          <Link className="tab" to="/supporters/duplicates">
            Duplicates ({duplicateCount})
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            className="input"
            placeholder="Search for an ID, supporter name, or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="kpi-grid">
          <div className="kpi">
            <span>Donors</span>
            <strong>1,467</strong>
          </div>
          <div className="kpi">
            <span>Fundraisers</span>
            <strong>239</strong>
          </div>
          <div className="kpi">
            <span>Recurring Donors</span>
            <strong>538</strong>
          </div>
          <div className="kpi">
            <span>Supporters</span>
            <strong>2,295</strong>
          </div>
          <div className="kpi">
            <span>Contact Opt-In Rate</span>
            <strong>12%</strong>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Supporter ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
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
