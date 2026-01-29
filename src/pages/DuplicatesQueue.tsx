import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../data/mockApi';
import { DuplicateCandidate } from '../types';
import { logEvent } from '../utils/analytics';

const confidenceLabel = (score: number) => {
  if (score >= 85) return { label: 'High', className: 'high' };
  if (score >= 60) return { label: 'Medium', className: 'medium' };
  return { label: 'Low', className: 'low' };
};

const DuplicatesQueue = () => {
  const navigate = useNavigate();
  const [confidence, setConfidence] = useState('');
  const [status, setStatus] = useState('Suggested');
  const [riskFlag, setRiskFlag] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [reasonModal, setReasonModal] = useState<DuplicateCandidate | null>(null);

  useEffect(() => {
    logEvent('duplicates_queue_viewed', { entry: 'queue' });
  }, []);

  const candidates = useMemo(() => {
    return mockApi.listDuplicateCandidates({
      confidence: confidence || undefined,
      status: status || undefined,
      riskFlag: riskFlag || undefined,
      search: search || undefined
    });
  }, [confidence, riskFlag, search, status]);

  const supporters = mockApi.loadData().supporters;

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const bulkDismiss = () => {
    if (selected.length === 0) return;
    mockApi.bulkDismiss(selected);
    setSelected([]);
  };

  const bulkReview = () => {
    if (selected.length === 0) return;
    const first = mockApi.bulkReview(selected);
    if (first) {
      navigate(`/supporters/merge/${first}`);
    }
  };

  const dismiss = (id: string) => {
    mockApi.updateCandidateStatus(id, 'Dismissed');
    logEvent('merge_dismissed', { id });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Duplicate Supporters</h1>
          <p className="muted">Review, merge, or dismiss suggested duplicate supporter pairs.</p>
        </div>
        <div className="filters">
          <button className="button secondary" onClick={bulkDismiss}>
            Bulk Dismiss
          </button>
          <button className="button" onClick={bulkReview}>
            Bulk Review
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filters" style={{ marginBottom: '12px' }}>
          <input
            className="input"
            placeholder="Search by supporter name, email, or ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="input" value={confidence} onChange={(event) => setConfidence(event.target.value)}>
            <option value="">Confidence</option>
            <option value="high">High (85+)</option>
            <option value="medium">Medium (60-84)</option>
            <option value="low">Low (&lt;60)</option>
          </select>
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Status</option>
            <option value="Suggested">Suggested</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Merged">Merged</option>
            <option value="Dismissed">Dismissed</option>
            <option value="Blocked">Blocked</option>
          </select>
          <select className="input" value={riskFlag} onChange={(event) => setRiskFlag(event.target.value)}>
            <option value="">Risk flags</option>
            <option value="High value donor">High value donor</option>
            <option value="Multi-org">Multi-org</option>
            <option value="Do not merge">Do not merge</option>
            <option value="Both have fundraising pages">Both have fundraising pages</option>
          </select>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th />
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
              const supporterA = supporters.find((supporter) => supporter.id === candidate.supporterAId);
              const supporterB = supporters.find((supporter) => supporter.id === candidate.supporterBId);
              const confidenceBadge = confidenceLabel(candidate.confidenceScore);
              return (
                <tr key={candidate.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(candidate.id)}
                      onChange={() => toggleSelect(candidate.id)}
                    />
                  </td>
                  <td>
                    <span className={`badge ${confidenceBadge.className}`}>
                      {confidenceBadge.label} ({candidate.confidenceScore}%)
                    </span>
                  </td>
                  <td>
                    <strong>
                      {supporterA?.firstName} {supporterA?.lastName}
                    </strong>
                    <div className="muted">{supporterA?.email}</div>
                    <div className="muted">{supporterA?.id}</div>
                  </td>
                  <td>
                    <strong>
                      {supporterB?.firstName} {supporterB?.lastName}
                    </strong>
                    <div className="muted">{supporterB?.email}</div>
                    <div className="muted">{supporterB?.id}</div>
                  </td>
                  <td>
                    <button className="button ghost" onClick={() => setReasonModal(candidate)}>
                      View
                    </button>
                  </td>
                  <td>
                    {candidate.riskFlags.length === 0
                      ? '—'
                      : candidate.riskFlags.map((flag) => (
                          <span key={flag} className="badge warn" style={{ marginRight: '6px' }}>
                            {flag}
                          </span>
                        ))}
                  </td>
                  <td>{candidate.status}</td>
                  <td>
                    <div className="filters">
                      <Link className="button secondary" to={`/supporters/merge/${candidate.id}`}>
                        Review
                      </Link>
                      <button className="button ghost" onClick={() => dismiss(candidate.id)}>
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

      {reasonModal && (
        <div className="modal-backdrop" onClick={() => setReasonModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Match reasons</h3>
            <ul>
              {reasonModal.matchReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <div className="divider" />
            <button className="button" onClick={() => setReasonModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicatesQueue;
