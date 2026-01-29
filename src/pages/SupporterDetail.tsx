import { Link, useParams } from 'react-router-dom';
import { mockApi } from '../mockApi';

const SupporterDetail = () => {
  const { id } = useParams();
  const supporter = id ? mockApi.getSupporter(id) : undefined;

  if (!supporter) {
    return (
      <div className="card">
        <div className="card-title">Supporter not found</div>
        <p className="page-subtitle">Try searching from the supporters list.</p>
        <Link className="button" to="/supporters">
          Back to supporters
        </Link>
      </div>
    );
  }

  const transactions = mockApi.getSupporterTransactions(supporter.id);
  const recurringPlans = mockApi.getSupporterRecurringPlans(supporter.id);
  const fundraisingPages = mockApi.getSupporterFundraisingPages(supporter.id);
  const possibleDuplicates = mockApi.getPossibleDuplicatesForSupporter(supporter.id).slice(0, 3);
  const mergeHistory = mockApi.getSupporterMergeHistory(supporter.id);

  return (
    <div>
      <div className="card">
        <div className="supporter-header">
          <div className="supporter-info">
            <div className="supporter-avatar">
              {supporter.firstName[0]}
              {supporter.lastName[0]}
            </div>
            <div>
              <div className="page-title">
                {supporter.firstName} {supporter.lastName}
              </div>
              <div className="page-subtitle">Supporter ID {supporter.id}</div>
            </div>
          </div>
          <div className="table-actions">
            <button className="button">Send password reset</button>
            <button className="button">Edit</button>
          </div>
        </div>

        {supporter.status === 'Merged' && (
          <div className="notice warning" style={{ marginTop: 12 }}>
            This supporter has been merged into {supporter.mergedIntoId}. It remains as a redirect
            for historical reporting.
          </div>
        )}

        <div className="card-grid kpi-grid" style={{ marginTop: 16 }}>
          <div className="kpi-card">
            <div className="kpi-label">All transactions</div>
            <div className="kpi-value">${supporter.transactionsTotal.toFixed(2)}</div>
            <div className="kpi-label">{supporter.transactionsCount} total transactions</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Recurring Giving Plans</div>
            <div className="kpi-value">${supporter.recurringPlansTotal.toFixed(2)}</div>
            <div className="kpi-label">{supporter.recurringPlansCount} plans</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Fundraising Pages</div>
            <div className="kpi-value">${supporter.fundraisingPagesTotal.toFixed(2)}</div>
            <div className="kpi-label">{supporter.fundraisingPagesCount} pages</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Contact Opt-In</div>
            <div className="kpi-value">{supporter.communicationPrefs.optIn ? 'Opted In' : 'Opted Out'}</div>
            <div className="kpi-label">Last updated {supporter.updatedAt}</div>
          </div>
        </div>
      </div>

      <div className="grid-two" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Possible duplicates</div>
            <Link className="button" to="/supporters/duplicates">
              View queue
            </Link>
          </div>
          {possibleDuplicates.length === 0 ? (
            <div className="notice">No suggested matches yet.</div>
          ) : (
            <div className="section-grid">
              {possibleDuplicates.map((candidate) => (
                <div key={candidate.id} className="notice">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      Match confidence: <strong>{candidate.confidenceScore}%</strong>
                      <div className="kpi-label">{candidate.matchReasons.join(', ')}</div>
                    </div>
                    <Link className="button primary" to={`/supporters/merge/${candidate.id}`}>
                      Review merge
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Merge history</div>
            <Link className="button" to="/supporters/merge-history">
              View audit log
            </Link>
          </div>
          {mergeHistory.length === 0 ? (
            <div className="notice">No merges recorded for this supporter.</div>
          ) : (
            <div className="section-grid">
              {mergeHistory.map((audit) => (
                <div key={audit.id} className="notice">
                  {audit.primaryId === supporter.id ? (
                    <div>
                      Merged from <strong>{audit.secondaryId}</strong> · {audit.mergedAt}
                    </div>
                  ) : (
                    <div>
                      Merged into <strong>{audit.primaryId}</strong> · {audit.mergedAt}
                    </div>
                  )}
                  <Link className="link" to="/supporters/merge-history">
                    View audit entry
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Overview</div>
        <div className="divider" />
        <div className="grid-two">
          <div>
            <div className="kpi-label">Contact Information</div>
            <div>{supporter.firstName} {supporter.lastName}</div>
            <div>{supporter.email}</div>
            <div>{supporter.phone}</div>
          </div>
          <div>
            <div className="kpi-label">Address</div>
            <div>{supporter.address}</div>
            <div className="kpi-label" style={{ marginTop: 12 }}>Consent Preferences</div>
            <div>
              {supporter.communicationPrefs.optIn
                ? 'This supporter has opted in to communications.'
                : 'This supporter has opted out of communications.'}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Transactions</div>
        <table className="table">
          <thead>
            <tr>
              <th>Confirmation ID</th>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Transaction Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.campaignName}</td>
                <td>
                  <span className={`badge ${tx.status === 'Successful' ? 'green' : 'yellow'}`}>
                    {tx.status}
                  </span>
                </td>
                <td>{tx.createdAt}</td>
                <td>${tx.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Recurring Giving Plans</div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Total Donated</th>
              <th>Amount / Frequency</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {recurringPlans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.id}</td>
                <td>
                  <span className="badge green">{plan.status}</span>
                </td>
                <td>${plan.totalDonated.toFixed(2)}</td>
                <td>
                  ${plan.amount.toFixed(2)} / {plan.frequency}
                </td>
                <td>{plan.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Fundraising Pages</div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Page Name</th>
              <th>Campaign / Team</th>
              <th>Status</th>
              <th>Total Raised</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {fundraisingPages.map((page) => (
              <tr key={page.id}>
                <td>{page.id}</td>
                <td>{page.name}</td>
                <td>{page.campaignTeam}</td>
                <td>
                  <span className="badge green">{page.status}</span>
                </td>
                <td>${page.totalRaised.toFixed(2)}</td>
                <td>{page.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupporterDetail;
