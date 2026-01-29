import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { Badge } from '../components/Badge';
import { mockApi } from '../mock/mockApi';
import { analytics } from '../utils/analytics';

export const SupporterDetail = () => {
  const { id } = useParams();
  const supporter = id ? mockApi.getSupporter(id) : undefined;

  if (!supporter) {
    return (
      <div className="page">
        <Card>
          <h2>Supporter not found</h2>
          <Link to="/supporters" className="btn-outline">
            Back to supporters
          </Link>
        </Card>
      </div>
    );
  }

  const transactions = mockApi.getTransactions(supporter.id);
  const recurringPlans = mockApi.getRecurringPlans(supporter.id);
  const fundraisingPages = mockApi.getFundraisingPages(supporter.id);
  const candidates = mockApi
    .getDuplicateCandidates()
    .filter(
      (candidate) =>
        candidate.status === 'Suggested' &&
        (candidate.supporterAId === supporter.id || candidate.supporterBId === supporter.id),
    )
    .slice(0, 3);

  const mergeAudits = mockApi
    .getMergeAudits()
    .filter((audit) => audit.primaryId === supporter.id || audit.secondaryId === supporter.id);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Supporter ID {supporter.id}</p>
          <h1>
            {supporter.firstName} {supporter.lastName}
          </h1>
        </div>
        <div className="header-actions">
          <button className="btn-outline">Send password reset</button>
          <button className="btn-outline">Edit</button>
        </div>
      </div>

      {supporter.status === 'Merged' && supporter.mergedIntoId && (
        <Card className="notification-card">
          <div>
            <h3>Supporter merged</h3>
            <p className="muted">
              This supporter has been merged into {supporter.mergedIntoId}. Updates will redirect
              to the primary record.
            </p>
          </div>
          <Link className="btn-outline" to={`/supporters/${supporter.mergedIntoId}`}>
            View primary supporter
          </Link>
        </Card>
      )}

      <Card className="stats-card">
        <div className="stat-block">
          <p className="muted">All transactions</p>
          <h3>{transactions.length}</h3>
          <span className="muted">${transactions.reduce((sum, t) => sum + t.amount, 0)}</span>
        </div>
        <div className="stat-block">
          <p className="muted">Recurring Giving Plans</p>
          <h3>{recurringPlans.length}</h3>
          <span className="muted">
            ${recurringPlans.reduce((sum, p) => sum + p.totalDonated, 0)} total
          </span>
        </div>
        <div className="stat-block">
          <p className="muted">Fundraising Pages</p>
          <h3>{fundraisingPages.length}</h3>
          <span className="muted">
            ${fundraisingPages.reduce((sum, f) => sum + f.totalRaised, 0)} total raised
          </span>
        </div>
      </Card>

      <div className="grid-2">
        <Card>
          <SectionHeader>Possible duplicates</SectionHeader>
          {candidates.length === 0 ? (
            <p className="muted">No suggested matches for this supporter.</p>
          ) : (
            <div className="stack">
              {candidates.map((candidate) => {
                const otherId =
                  candidate.supporterAId === supporter.id
                    ? candidate.supporterBId
                    : candidate.supporterAId;
                const other = mockApi.getSupporter(otherId);
                return (
                  <div key={candidate.id} className="candidate-row">
                    <div>
                      <strong>
                        {other?.firstName} {other?.lastName}
                      </strong>
                      <p className="muted">{other?.email}</p>
                      <p className="muted">Confidence {candidate.confidenceScore}%</p>
                    </div>
                    <Link
                      to={`/supporters/merge/${candidate.id}`}
                      className="btn-primary"
                      onClick={() => analytics.logEvent('duplicate_review_opened')}
                    >
                      Review merge
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader>Merge history</SectionHeader>
          {mergeAudits.length === 0 ? (
            <p className="muted">No merges involving this supporter yet.</p>
          ) : (
            <div className="stack">
              {mergeAudits.map((audit) => (
                <div key={audit.id} className="merge-history-row">
                  <div>
                    <strong>
                      {audit.secondaryId === supporter.id
                        ? `Merged into ${audit.primaryId}`
                        : `Merged from ${audit.secondaryId}`}
                    </strong>
                    <p className="muted">{new Date(audit.mergedAt).toLocaleString()}</p>
                  </div>
                  <Link to="/supporters/merge-history" className="btn-outline">
                    View audit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <SectionHeader>Overview</SectionHeader>
        <div className="overview-grid">
          <div>
            <p className="muted">Contact Information</p>
            <p>
              <strong>Name</strong>
              <br />
              {supporter.firstName} {supporter.lastName}
            </p>
            <p>
              <strong>Email Address</strong>
              <br />
              {supporter.email}
            </p>
            <p>
              <strong>Phone Number</strong>
              <br />
              {supporter.phone}
            </p>
            <p>
              <strong>Address</strong>
              <br />
              {supporter.address}
            </p>
          </div>
          <div>
            <p className="muted">Consent Preferences</p>
            <p>
              {supporter.communicationPrefs.optIn
                ? 'This supporter has opted into communications.'
                : 'This supporter has opted out of communications.'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader>Transactions</SectionHeader>
        <table>
          <thead>
            <tr>
              <th>Confirmation ID</th>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Total Gross Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.campaignName}</td>
                <td>
                  <Badge variant={transaction.status === 'Successful' ? 'success' : 'warning'}>
                    {transaction.status}
                  </Badge>
                </td>
                <td>${transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionHeader>Recurring Giving Plans</SectionHeader>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Total Donated</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recurringPlans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.id}</td>
                <td>{plan.frequency}</td>
                <td>
                  <Badge variant={plan.status === 'Active' ? 'success' : 'warning'}>
                    {plan.status}
                  </Badge>
                </td>
                <td>${plan.totalDonated}</td>
                <td>${plan.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <SectionHeader>Fundraising Pages</SectionHeader>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fundraising Page Name</th>
              <th>Campaign/Team</th>
              <th>Status</th>
              <th>Total Raised</th>
            </tr>
          </thead>
          <tbody>
            {fundraisingPages.map((page) => (
              <tr key={page.id}>
                <td>{page.id}</td>
                <td>{page.name}</td>
                <td>{page.campaignTeam}</td>
                <td>
                  <Badge variant={page.status === 'Active' ? 'success' : 'warning'}>
                    {page.status}
                  </Badge>
                </td>
                <td>${page.totalRaised}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
