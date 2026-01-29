import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { DuplicateCandidate, MergeAudit, Supporter } from '../types';
import { formatCurrency, formatDate, getConfidenceLabel } from '../utils';

const SupporterDetailPage = () => {
  const { id } = useParams();
  const [supporter, setSupporter] = useState<Supporter | undefined>();
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [audits, setAudits] = useState<MergeAudit[]>([]);
  const [related, setRelated] = useState({
    transactions: [],
    recurringPlans: [],
    fundraisingPages: []
  } as Awaited<ReturnType<typeof mockApi.getSupporterRelated>>);
  const [metrics, setMetrics] = useState({
    transactionsCount: 0,
    recurringPlansCount: 0,
    fundraisingPagesCount: 0,
    transactionsTotal: 0,
    recurringTotal: 0,
    fundraisingTotal: 0
  });

  useEffect(() => {
    if (!id) return;
    mockApi.getSupporter(id).then((data) => setSupporter(data));
    mockApi.getSupporterRelated(id).then((data) => setRelated(data));
    mockApi.getMetricsForSupporter(id).then((data) => setMetrics(data));
    mockApi.getDuplicateCandidates().then((data) => setCandidates(data));
    mockApi.getMergeAudits().then((data) => setAudits(data));
  }, [id]);

  const possibleDuplicates = useMemo(() => {
    if (!supporter) return [];
    return candidates
      .filter(
        (item) =>
          item.status === 'Suggested' &&
          (item.supporterAId === supporter.id || item.supporterBId === supporter.id)
      )
      .slice(0, 3);
  }, [candidates, supporter]);

  const mergeHistory = useMemo(() => {
    if (!supporter) return [];
    return audits.filter(
      (audit) => audit.primaryId === supporter.id || audit.secondaryId === supporter.id
    );
  }, [audits, supporter]);

  if (!supporter) {
    return <div className="card">Loading supporter...</div>;
  }

  return (
    <div>
      <div className="page-title">
        {supporter.firstName} {supporter.lastName}
      </div>
      <div className="page-subtitle">Supporter ID {supporter.id}</div>

      {supporter.mergedIntoId && (
        <div className="notice warning" style={{ marginBottom: '16px' }}>
          This supporter was merged into{' '}
          <Link className="link" to={`/supporters/${supporter.mergedIntoId}`}>
            {supporter.mergedIntoId}
          </Link>
          . The profile is now read-only.
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: '20px' }}>
        <div className="card kpi">
          <div className="kpi-label">Transactions</div>
          <div className="kpi-value">{metrics.transactionsCount}</div>
          <div className="muted">{formatCurrency(metrics.transactionsTotal)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Recurring Plans</div>
          <div className="kpi-value">{metrics.recurringPlansCount}</div>
          <div className="muted">{formatCurrency(metrics.recurringTotal)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Fundraising Pages</div>
          <div className="kpi-value">{metrics.fundraisingPagesCount}</div>
          <div className="muted">{formatCurrency(metrics.fundraisingTotal)}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-label">Communication Opt-In</div>
          <div className="kpi-value">{supporter.communicationPrefs.optIn ? 'Yes' : 'No'}</div>
          <div className="muted">Updated {formatDate(supporter.updatedAt)}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Overview</div>
              <button className="button outline">Edit</button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div className="muted">Name</div>
                <strong>
                  {supporter.firstName} {supporter.lastName}
                </strong>
              </div>
              <div>
                <div className="muted">Email Address</div>
                <strong>{supporter.email}</strong>
              </div>
              <div>
                <div className="muted">Phone Number</div>
                <strong>{supporter.phone}</strong>
              </div>
              <div>
                <div className="muted">Address</div>
                <strong>{supporter.address}</strong>
              </div>
            </div>
            <div className="divider" />
            <div>
              <div className="muted">Consent Preferences</div>
              <p>
                {supporter.communicationPrefs.optIn
                  ? 'This supporter has opted in to communications.'
                  : 'This supporter has opted out of communications.'}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Transactions</div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {related.transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.campaignName}</td>
                    <td>
                      <span className={`badge ${item.status === 'Successful' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-title">Recurring Giving Plans</div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Total Donated</th>
                </tr>
              </thead>
              <tbody>
                {related.recurringPlans.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <span className="badge success">{item.status}</span>
                    </td>
                    <td>
                      {formatCurrency(item.amount)} / {item.frequency}
                    </td>
                    <td>{formatCurrency(item.totalDonated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-title">Fundraising Pages</div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Total Raised</th>
                </tr>
              </thead>
              <tbody>
                {related.fundraisingPages.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                      <span className="badge success">{item.status}</span>
                    </td>
                    <td>{formatCurrency(item.totalRaised)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid" style={{ gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Possible duplicates</div>
              <Link className="pill-button" to="/supporters/duplicates">
                Review queue
              </Link>
            </div>
            {possibleDuplicates.length === 0 ? (
              <p className="muted">No suggested duplicates for this supporter.</p>
            ) : (
              <div className="grid" style={{ gap: '12px' }}>
                {possibleDuplicates.map((candidate) => (
                  <div key={candidate.id} className="card" style={{ padding: '12px' }}>
                    <div className="muted">Confidence: {getConfidenceLabel(candidate.confidenceScore)}</div>
                    <div>
                      {candidate.supporterAId === supporter.id
                        ? candidate.supporterBId
                        : candidate.supporterAId}
                    </div>
                    <div className="inline-list">
                      {candidate.matchReasons.slice(0, 2).map((reason) => (
                        <span key={reason} className="tag">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <Link className="pill-button" to={`/supporters/merge/${candidate.id}`}>
                      Review merge
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Merge history</div>
              <Link className="pill-button" to="/supporters/merge-history">
                View audits
              </Link>
            </div>
            {mergeHistory.length === 0 ? (
              <p className="muted">No merges yet for this supporter.</p>
            ) : (
              mergeHistory.map((audit) => (
                <div key={audit.id} className="card" style={{ padding: '12px', marginBottom: '8px' }}>
                  <div>
                    {audit.primaryId === supporter.id
                      ? `Merged from ${audit.secondaryId}`
                      : `Merged into ${audit.primaryId}`}
                  </div>
                  <div className="muted">{formatDate(audit.mergedAt)}</div>
                  <Link className="link" to="/supporters/merge-history">
                    View audit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupporterDetailPage;
