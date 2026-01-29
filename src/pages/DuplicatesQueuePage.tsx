import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { DuplicateCandidate, Supporter } from '../types';
import { getConfidenceLabel, getConfidenceTone } from '../utils';
import { trackEvent } from '../analytics';

const statusOptions: DuplicateCandidate['status'][] = [
  'Suggested',
  'Reviewed',
  'Merged',
  'Dismissed',
  'Blocked'
];

const DuplicatesQueuePage = () => {
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DuplicateCandidate['status'] | 'All'>('All');
  const [confidence, setConfidence] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [riskFlag, setRiskFlag] = useState('All');
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getDuplicateCandidates().then((data) => setCandidates(data));
    mockApi.getSupporters().then((data) => setSupporters(data));
  }, []);

  useEffect(() => {
    trackEvent('duplicates_queue_viewed', { source: 'duplicates_queue' });
  }, []);

  const riskFlags = useMemo(() => {
    const flags = new Set<string>();
    candidates.forEach((candidate) => candidate.riskFlags.forEach((flag) => flags.add(flag)));
    return ['All', ...Array.from(flags)];
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (status !== 'All' && candidate.status !== status) return false;
      const confidenceLabel = getConfidenceLabel(candidate.confidenceScore);
      if (confidence !== 'All' && confidenceLabel !== confidence) return false;
      if (riskFlag !== 'All' && !candidate.riskFlags.includes(riskFlag)) return false;

      if (!lowered) return true;
      const supporterA = supporters.find((item) => item.id === candidate.supporterAId);
      const supporterB = supporters.find((item) => item.id === candidate.supporterBId);
      return [
        candidate.id,
        supporterA?.firstName,
        supporterA?.lastName,
        supporterA?.email,
        supporterB?.firstName,
        supporterB?.lastName,
        supporterB?.email,
        supporterA?.id,
        supporterB?.id
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(lowered));
    });
  }, [candidates, confidence, riskFlag, search, status, supporters]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allSelected = selected.length > 0 && selected.length === filteredCandidates.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
      return;
    }
    setSelected(filteredCandidates.map((candidate) => candidate.id));
  };

  const handleBulkDismiss = async () => {
    await mockApi.bulkDismiss(selected);
    trackEvent('merge_dismissed', { candidateIds: selected });
    setSelected([]);
    const updated = await mockApi.getDuplicateCandidates();
    setCandidates(updated);
  };

  const handleBulkReview = () => {
    if (selected.length === 0) return;
    localStorage.setItem('gfp-bulk-review', JSON.stringify(selected));
    navigate(`/supporters/merge/${selected[0]}?bulk=1`);
  };

  const getSupporter = (id: string) => supporters.find((item) => item.id === id);

  return (
    <div>
      <div className="page-title">Supporter duplicates</div>
      <div className="page-subtitle">Review merge suggestions at scale and resolve edge cases.</div>

      <div className="card">
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
          <input
            className="input"
            placeholder="Search by supporter name, email, or ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="select" value={confidence} onChange={(e) => setConfidence(e.target.value as 'All' | 'High' | 'Medium' | 'Low')}>
            <option value="All">All confidence</option>
            <option value="High">High (85+)</option>
            <option value="Medium">Medium (60-84)</option>
            <option value="Low">Low (&lt;60)</option>
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as DuplicateCandidate['status'] | 'All')}>
            <option value="All">All status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select className="select" value={riskFlag} onChange={(e) => setRiskFlag(e.target.value)}>
            {riskFlags.map((flag) => (
              <option key={flag} value={flag}>
                {flag === 'All' ? 'All risk flags' : flag}
              </option>
            ))}
          </select>
        </div>
        <div className="divider" />
        <div className="inline-list">
          <button className="button secondary" onClick={handleBulkReview} disabled={selected.length === 0}>
            Bulk review
          </button>
          <button className="button outline" onClick={handleBulkDismiss} disabled={selected.length === 0}>
            Bulk dismiss
          </button>
          <span className="muted">{selected.length} selected</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" className="checkbox" checked={allSelected} onChange={toggleAll} />
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
            {filteredCandidates.map((candidate) => {
              const supporterA = getSupporter(candidate.supporterAId);
              const supporterB = getSupporter(candidate.supporterBId);
              const confidenceTone = getConfidenceTone(candidate.confidenceScore);
              return (
                <tr key={candidate.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selected.includes(candidate.id)}
                      onChange={() => toggleSelect(candidate.id)}
                    />
                  </td>
                  <td>
                    <span className={`badge ${confidenceTone}`}>
                      {getConfidenceLabel(candidate.confidenceScore)} ({candidate.confidenceScore}%)
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
                    <div className="inline-list">
                      {candidate.matchReasons.map((reason) => (
                        <span key={reason} className="tag">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="inline-list">
                      {candidate.riskFlags.length === 0 ? (
                        <span className="tag">None</span>
                      ) : (
                        candidate.riskFlags.map((flag) => (
                          <span key={flag} className="badge warning">
                            {flag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="status-pill">{candidate.status}</span>
                  </td>
                  <td>
                    <div className="inline-list">
                      <Link className="pill-button" to={`/supporters/merge/${candidate.id}`}>
                        Review
                      </Link>
                      <button
                        className="button outline"
                        onClick={async () => {
                          await mockApi.updateCandidate({ ...candidate, status: 'Dismissed' });
                          trackEvent('merge_dismissed', { candidateId: candidate.id });
                          const updated = await mockApi.getDuplicateCandidates();
                          setCandidates(updated);
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
        {filteredCandidates.length === 0 && <p className="muted">No candidates match the filters.</p>}
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <div className="card-title">Exception report</div>
        <p className="muted">
          Candidates that are blocked or require manual review can be exported for cross-org
          resolution.
        </p>
        <button
          className="button outline"
          onClick={() => {
            const rows = candidates
              .filter((item) => item.riskFlags.includes('Multi-org'))
              .map((item) => `${item.id},${item.supporterAId},${item.supporterBId},Multi-org`)
              .join('\n');
            const csv = `candidateId,supporterAId,supporterBId,reason\n${rows}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'duplicate-exceptions.csv';
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download exception CSV
        </button>
      </div>
    </div>
  );
};

export default DuplicatesQueuePage;
