import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { logEvent } from '../utils/analytics';

const confidenceBadge = (score: number) => {
  if (score >= 85) return { label: 'High', className: 'green' };
  if (score >= 60) return { label: 'Medium', className: 'yellow' };
  return { label: 'Low', className: 'red' };
};

const DuplicatesQueue = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Suggested');
  const [confidence, setConfidence] = useState('all');
  const [riskFlag, setRiskFlag] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    logEvent('duplicates_queue_viewed');
  }, []);

  const candidates = useMemo(
    () =>
      mockApi.getDuplicateCandidates({
        search,
        status: status === 'all' ? 'all' : status,
        confidence,
        riskFlags: riskFlag ? [riskFlag] : []
      }),
    [search, status, confidence, riskFlag]
  );

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const bulkDismiss = () => {
    selected.forEach((id) => mockApi.dismissCandidate(id));
    setSelected([]);
    logEvent('merge_dismissed', { count: selected.length, context: 'bulk' });
  };

  const bulkReview = () => {
    const [first] = selected;
    if (first) {
      logEvent('duplicate_review_opened', { candidateId: first, context: 'bulk' });
      navigate(`/supporters/merge/${first}`, { state: { queue: selected } });
    }
  };

  const allSelected = selected.length > 0 && selected.length === candidates.length;

  return (
    <div>
      <div className="supporter-header">
        <div>
          <h1 className="page-title">Duplicate supporters</h1>
          <p className="page-subtitle">Review suggested merges at scale without exporting data.</p>
        </div>
        <Link className="button" to="/supporters">
          Back to supporters
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row">
          <input
            className="input search-input"
            placeholder="Search by supporter name, email, or ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="select" value={confidence} onChange={(event) => setConfidence(event.target.value)}>
            <option value="all">All confidence</option>
            <option value="high">High (85+)</option>
            <option value="medium">Medium (60-84)</option>
            <option value="low">Low (&lt;60)</option>
          </select>
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Suggested">Suggested</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Merged">Merged</option>
            <option value="Dismissed">Dismissed</option>
            <option value="Blocked">Blocked</option>
            <option value="all">All statuses</option>
          </select>
          <select className="select" value={riskFlag} onChange={(event) => setRiskFlag(event.target.value)}>
            <option value="">All risk flags</option>
            <option value="High value donor">High value donor</option>
            <option value="Both have active recurring plans">Both have active recurring plans</option>
            <option value="Multi-org">Multi-org</option>
            <option value="Conflicting emails">Conflicting emails</option>
            <option value="Do not merge">Do not merge</option>
          </select>
        </div>
        <div className="divider" />
        <div className="form-row">
          <button className="button" disabled={selected.length === 0} onClick={bulkDismiss}>
            Bulk Dismiss ({selected.length})
          </button>
          <button className="button primary" disabled={selected.length === 0} onClick={bulkReview}>
            Bulk Review
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? [] : candidates.map((candidate) => candidate.id))
                  }
                />
              </th>
              <th>Confidence</th>
              <th>Supporter A</th>
              <th>Supporter B</th>
              <th>Match reasons</th>
              <th>Risk flags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const supporterA = mockApi.getSupporter(candidate.supporterAId);
              const supporterB = mockApi.getSupporter(candidate.supporterBId);
              if (!supporterA || !supporterB) return null;
              const badge = confidenceBadge(candidate.confidenceScore);

              return (
                <tr key={candidate.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selected.includes(candidate.id)}
                      onChange={() => toggleSelection(candidate.id)}
                    />
                  </td>
                  <td>
                    <span className={`badge ${badge.className}`}>{badge.label}</span>
                    <div className="kpi-label">{candidate.confidenceScore}%</div>
                  </td>
                  <td>
                    <div>
                      <strong>
                        {supporterA.firstName} {supporterA.lastName}
                      </strong>
                    </div>
                    <div className="kpi-label">{supporterA.email}</div>
                    <div className="kpi-label">ID {supporterA.id}</div>
                    <div className="kpi-label">
                      {supporterA.transactionsCount} tx · {supporterA.recurringPlansCount} recurring ·{' '}
                      {supporterA.fundraisingPagesCount} pages
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>
                        {supporterB.firstName} {supporterB.lastName}
                      </strong>
                    </div>
                    <div className="kpi-label">{supporterB.email}</div>
                    <div className="kpi-label">ID {supporterB.id}</div>
                    <div className="kpi-label">
                      {supporterB.transactionsCount} tx · {supporterB.recurringPlansCount} recurring ·{' '}
                      {supporterB.fundraisingPagesCount} pages
                    </div>
                  </td>
                  <td>
                    <div className="tag-group">
                      {candidate.matchReasons.map((reason) => (
                        <span key={reason} className="badge blue">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="tag-group">
                      {candidate.riskFlags.length === 0 ? (
                        <span className="badge">None</span>
                      ) : (
                        candidate.riskFlags.map((flag) => (
                          <span key={flag} className="badge red">
                            {flag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>{candidate.status}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="button primary"
                        to={`/supporters/merge/${candidate.id}`}
                        onClick={() => logEvent('duplicate_review_opened', { candidateId: candidate.id })}
                      >
                        Review
                      </Link>
                      <button
                        className="button"
                        onClick={() => {
                          mockApi.dismissCandidate(candidate.id);
                          logEvent('merge_dismissed', { candidateId: candidate.id });
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DuplicatesQueue;
