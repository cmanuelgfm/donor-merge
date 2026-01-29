import { Link, useParams } from 'react-router-dom';
import { mockApi } from '../data/mockApi';

const SupporterDetail = () => {
  const { id } = useParams();
  const supporter = id ? mockApi.getSupporter(id) : undefined;

  if (!supporter) {
    return <div className="card">Supporter not found.</div>;
  }

  const transactions = mockApi.listTransactionsBySupporter(supporter.id);
  const recurringPlans = mockApi.listRecurringPlansBySupporter(supporter.id);
  const fundraisingPages = mockApi.listFundraisingPagesBySupporter(supporter.id);
  const duplicateCandidates = mockApi
    .listDuplicateCandidates({ status: 'Suggested' })
    .filter((candidate) => candidate.supporterAId === supporter.id || candidate.supporterBId === supporter.id)
    .slice(0, 3);
  const mergeAudits = mockApi.listMergeAudits({ supporterId: supporter.id });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>
            {supporter.firstName} {supporter.lastName}
          </h1>
          <p className="muted">Supporter ID {supporter.id}</p>
        </div>
        <div className="filters">
          <button className="button secondary">Send password reset</button>
          <button className="button">Edit</button>
        </div>
      </div>

      <div className="card">
        <div className="kpi-grid">
          <div className="kpi">
            <span>All transactions</span>
            <strong>${supporter.transactionsTotal.toLocaleString()}</strong>
          </div>
          <div className="kpi">
            <span>Recurring Giving Plans</span>
            <strong>${supporter.recurringTotal.toLocaleString()}</strong>
          </div>
          <div className="kpi">
            <span>Fundraising Pages</span>
            <strong>${supporter.fundraisingTotal.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Overview</h3>
          </div>
          <div className="divider" />
          <div className="grid-2">
            <div>
              <p className="muted">Contact Information</p>
              <p>
                <strong>Name:</strong> {supporter.firstName} {supporter.lastName}
              </p>
              <p>
                <strong>Email:</strong> {supporter.email}
              </p>
              <p>
                <strong>Phone:</strong> {supporter.phone || 'Not provided'}
              </p>
              <p>
                <strong>Address:</strong> {supporter.address}
              </p>
            </div>
            <div>
              <p className="muted">Consent Preferences</p>
              <p>
                {supporter.communicationPrefs.optIn
                  ? 'This supporter has opted in to communications.'
                  : 'This supporter has opted out of communications.'}
              </p>
              {supporter.status === 'Merged' && supporter.mergedIntoId && (
                <p className="badge warn">Merged into {supporter.mergedIntoId}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Possible duplicates</h3>
          </div>
          {duplicateCandidates.length === 0 ? (
            <p className="muted">No suggested duplicates for this supporter.</p>
          ) : (
            <div>
              {duplicateCandidates.map((candidate) => {
                const counterpartId = candidate.supporterAId === supporter.id ? candidate.supporterBId : candidate.supporterAId;
                const counterpart = mockApi.getSupporter(counterpartId);
                return (
                  <div key={candidate.id} className="panel" style={{ marginBottom: '12px' }}>
                    <strong>
                      {counterpart?.firstName} {counterpart?.lastName}
                    </strong>
                    <p className="muted">{counterpart?.email}</p>
                    <div className="filters">
                      <span className="badge info">{candidate.confidenceScore}% confidence</span>
                      <Link className="button secondary" to={`/supporters/merge/${candidate.id}`}>
                        Review merge
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>Transactions</h3>
          <span className="muted">{transactions.length} records</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.campaignName}</td>
                <td>
                  <span className={`badge ${transaction.status === 'Successful' ? 'high' : 'medium'}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>{transaction.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3>Recurring Giving Plans</h3>
            <span className="muted">{recurringPlans.length} plans</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Total Donated</th>
              </tr>
            </thead>
            <tbody>
              {recurringPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.id}</td>
                  <td>${plan.amount.toFixed(2)}</td>
                  <td>{plan.frequency}</td>
                  <td>
                    <span className="badge info">{plan.status}</span>
                  </td>
                  <td>${plan.totalDonated.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Fundraising Pages</h3>
            <span className="muted">{fundraisingPages.length} pages</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Campaign/Team</th>
                <th>Status</th>
                <th>Total Raised</th>
              </tr>
            </thead>
            <tbody>
              {fundraisingPages.map((page) => (
                <tr key={page.id}>
                  <td>{page.name}</td>
                  <td>{page.campaignTeam}</td>
                  <td>
                    <span className="badge high">{page.status}</span>
                  </td>
                  <td>${page.totalRaised.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3>Merge history</h3>
        </div>
        {mergeAudits.length === 0 ? (
          <p className="muted">No merge activity for this supporter.</p>
        ) : (
          <ul>
            {mergeAudits.map((audit) => (
              <li key={audit.id}>
                {audit.primaryId === supporter.id ? (
                  <span>
                    Merged from {audit.secondaryId} on {new Date(audit.mergedAt).toLocaleDateString()}.{' '}
                    <Link className="link" to="/supporters/merge-history">
                      View audit
                    </Link>
                  </span>
                ) : (
                  <span>
                    Merged into {audit.primaryId} on {new Date(audit.mergedAt).toLocaleDateString()}.{' '}
                    <Link className="link" to="/supporters/merge-history">
                      View audit
                    </Link>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SupporterDetail;
