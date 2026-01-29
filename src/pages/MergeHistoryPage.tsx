import { useEffect, useMemo, useState } from 'react';
import { mockApi } from '../mockApi';
import { MergeAudit, Supporter } from '../types';
import { formatDate } from '../utils';

const MergeHistoryPage = () => {
  const [audits, setAudits] = useState<MergeAudit[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [filterId, setFilterId] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<MergeAudit | null>(null);

  useEffect(() => {
    mockApi.getMergeAudits().then((data) => setAudits(data));
    mockApi.getSupporters().then((data) => setSupporters(data));
  }, []);

  const filteredAudits = useMemo(() => {
    const lowered = filterId.trim().toLowerCase();
    if (!lowered) return audits;
    return audits.filter(
      (audit) =>
        audit.primaryId.toLowerCase().includes(lowered) ||
        audit.secondaryId.toLowerCase().includes(lowered)
    );
  }, [audits, filterId]);

  const getSupporterName = (id: string) => {
    const supporter = supporters.find((item) => item.id === id);
    return supporter ? `${supporter.firstName} ${supporter.lastName}` : id;
  };

  return (
    <div>
      <div className="page-title">Merge history</div>
      <div className="page-subtitle">Audit completed merges and review what changed.</div>

      <div className="card">
        <input
          className="input"
          placeholder="Filter by supporter ID"
          value={filterId}
          onChange={(event) => setFilterId(event.target.value)}
        />
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Primary</th>
              <th>Secondary</th>
              <th>Moved counts</th>
              <th>Merged by</th>
              <th>Merged at</th>
              <th>Audit</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map((audit) => (
              <tr key={audit.id}>
                <td>
                  <strong>{getSupporterName(audit.primaryId)}</strong>
                  <div className="muted">{audit.primaryId}</div>
                </td>
                <td>
                  <strong>{getSupporterName(audit.secondaryId)}</strong>
                  <div className="muted">{audit.secondaryId}</div>
                </td>
                <td>
                  {audit.movedCounts.transactions} transactions, {audit.movedCounts.recurringPlans} plans,
                  {audit.movedCounts.fundraisingPages} pages
                </td>
                <td>{audit.mergedBy}</td>
                <td>{formatDate(audit.mergedAt)}</td>
                <td>
                  <button className="button outline" onClick={() => setSelectedAudit(audit)}>
                    Audit detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAudits.length === 0 && <p className="muted">No merges yet.</p>}
      </div>

      {selectedAudit && (
        <div className="modal-backdrop" onClick={() => setSelectedAudit(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="card-title">Merge audit detail</div>
            <p className="muted">{selectedAudit.id}</p>
            <div className="divider" />
            <div>
              <strong>Field resolutions</strong>
              <div className="inline-list" style={{ marginTop: '8px' }}>
                {Object.entries(selectedAudit.fieldResolutions).map(([field, value]) => (
                  <span key={field} className="tag">
                    {field}: {value}
                  </span>
                ))}
              </div>
            </div>
            <div className="divider" />
            <div>
              <strong>Warnings shown</strong>
              <ul>
                {selectedAudit.warningsShown.length === 0 ? (
                  <li className="muted">No warnings shown.</li>
                ) : (
                  selectedAudit.warningsShown.map((warning) => <li key={warning}>{warning}</li>)
                )}
              </ul>
            </div>
            <div className="divider" />
            <div>
              <strong>Dry run summary</strong>
              <p>{selectedAudit.dryRunSummary}</p>
            </div>
            <div className="divider" />
            <button className="button secondary" onClick={() => setSelectedAudit(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeHistoryPage;
