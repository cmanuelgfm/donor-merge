import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { mockApi } from '../mock/mockApi';
import { DuplicateCandidate } from '../mock/types';
import { analytics } from '../utils/analytics';

const confidenceLabel = (score: number) => {
  if (score >= 85) return { label: 'High', variant: 'success' as const };
  if (score >= 60) return { label: 'Medium', variant: 'warning' as const };
  return { label: 'Low', variant: 'danger' as const };
};

const matchesQuery = (candidate: DuplicateCandidate, query: string) => {
  const store = mockApi.getStore();
  const normalized = query.toLowerCase();
  const supporterA = store.supporters.find((s) => s.id === candidate.supporterAId);
  const supporterB = store.supporters.find((s) => s.id === candidate.supporterBId);
  return (
    supporterA?.id.toLowerCase().includes(normalized) ||
    supporterB?.id.toLowerCase().includes(normalized) ||
    supporterA?.email.toLowerCase().includes(normalized) ||
    supporterB?.email.toLowerCase().includes(normalized) ||
    supporterA?.firstName.toLowerCase().includes(normalized) ||
    supporterB?.firstName.toLowerCase().includes(normalized) ||
    supporterA?.lastName.toLowerCase().includes(normalized) ||
    supporterB?.lastName.toLowerCase().includes(normalized)
  );
};

const statusOptions: DuplicateCandidate['status'][] = [
  'Suggested',
  'Reviewed',
  'Merged',
  'Dismissed',
  'Blocked',
];

export const DuplicatesQueue = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [confidence, setConfidence] = useState('all');
  const [status, setStatus] = useState<DuplicateCandidate['status'] | 'all'>('Suggested');
  const [risk, setRisk] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    analytics.logEvent('duplicates_queue_viewed');
  }, []);

  const candidates = mockApi.getDuplicateCandidates();
  const store = mockApi.getStore();

  const filtered = useMemo(() => {
    return candidates.filter((candidate) => {
      const confidenceMatch =
        confidence === 'all' ||
        (confidence === 'high' && candidate.confidenceScore >= 85) ||
        (confidence === 'medium' && candidate.confidenceScore >= 60 && candidate.confidenceScore < 85) ||
        (confidence === 'low' && candidate.confidenceScore < 60);
      const statusMatch = status === 'all' || candidate.status === status;
      const riskMatch =
        risk === 'all' || candidate.riskFlags.some((flag) => flag.toLowerCase().includes(risk));
      const queryMatch = query ? matchesQuery(candidate, query) : true;
      return confidenceMatch && statusMatch && riskMatch && queryMatch;
    });
  }, [candidates, confidence, status, risk, query]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((candidate) => candidate.id));
    }
  };

  const dismissSelected = () => {
    selectedIds.forEach((id) => {
      mockApi.updateCandidateStatus(id, 'Dismissed');
      analytics.logEvent('merge_dismissed', { candidateId: id });
    });
    setSelectedIds([]);
  };

  const reviewSelected = () => {
    if (selectedIds.length === 0) return;
    localStorage.setItem('bulkReviewQueue', JSON.stringify(selectedIds));
    navigate(`/supporters/merge/${selectedIds[0]}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Duplicate Supporters</h1>
          <p className="muted">Review suggested merges at scale in-product.</p>
        </div>
        <div className="header-actions">
          <Link className="btn-outline" to="/supporters/merge-history">
            View merge history
          </Link>
          <button className="btn-primary" onClick={reviewSelected}>
            Bulk review
          </button>
        </div>
      </div>

      <Card className="filters-card">
        <div className="filters-grid">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by supporter name, email, or ID"
          />
          <select value={confidence} onChange={(event) => setConfidence(event.target.value)}>
            <option value="all">All confidence</option>
            <option value="high">High (85+)</option>
            <option value="medium">Medium (60-84)</option>
            <option value="low">Low (&lt;60)</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={risk} onChange={(event) => setRisk(event.target.value)}>
            <option value="all">All risk flags</option>
            <option value="high value donor">High value donor</option>
            <option value="recurring">Active recurring plans</option>
            <option value="multi-org">Multi-org</option>
            <option value="do not merge">Do not merge</option>
          </select>
        </div>
        <div className="bulk-actions">
          <button className="btn-outline" onClick={dismissSelected}>
            Bulk dismiss
          </button>
          <span className="muted">{selectedIds.length} selected</span>
        </div>
      </Card>

      <Card>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Confidence</th>
              <th>Supporter A</th>
              <th>Supporter B</th>
              <th>Match Reasons</th>
              <th>Risk Flags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((candidate) => {
              const supporterA = store.supporters.find((s) => s.id === candidate.supporterAId);
              const supporterB = store.supporters.find((s) => s.id === candidate.supporterBId);
              const confidenceMeta = confidenceLabel(candidate.confidenceScore);

              return (
                <tr key={candidate.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => toggleSelection(candidate.id)}
                    />
                  </td>
                  <td>
                    <Badge variant={confidenceMeta.variant}>{confidenceMeta.label}</Badge>
                    <div className="muted">{candidate.confidenceScore}%</div>
                  </td>
                  <td>
                    <strong>
                      {supporterA?.firstName} {supporterA?.lastName}
                    </strong>
                    <div className="muted">{supporterA?.email}</div>
                    <div className="muted">{supporterA?.id}</div>
                    <div className="muted">
                      {supporterA?.transactionsCount} tx · {supporterA?.recurringPlansCount} rec
                    </div>
                  </td>
                  <td>
                    <strong>
                      {supporterB?.firstName} {supporterB?.lastName}
                    </strong>
                    <div className="muted">{supporterB?.email}</div>
                    <div className="muted">{supporterB?.id}</div>
                    <div className="muted">
                      {supporterB?.transactionsCount} tx · {supporterB?.recurringPlansCount} rec
                    </div>
                  </td>
                  <td>
                    <span className="link" title={candidate.matchReasons.join(', ')}>
                      View
                    </span>
                  </td>
                  <td>
                    <div className="badge-group">
                      {candidate.riskFlags.length === 0 ? (
                        <Badge variant="neutral">None</Badge>
                      ) : (
                        candidate.riskFlags.map((flag) => (
                          <Badge key={flag} variant="danger">
                            {flag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td>{candidate.status}</td>
                  <td>
                    <Link className="btn-outline" to={`/supporters/merge/${candidate.id}`}>
                      Review
                    </Link>
                    <button
                      className="btn-text"
                      onClick={() => {
                        mockApi.updateCandidateStatus(candidate.id, 'Dismissed');
                        analytics.logEvent('merge_dismissed', { candidateId: candidate.id });
                      }}
                    >
                      Dismiss
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
