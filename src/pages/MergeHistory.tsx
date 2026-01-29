import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { mockApi } from '../mock/mockApi';
import { MergeAudit } from '../mock/types';

export const MergeHistory = () => {
  const audits = mockApi.getMergeAudits();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeAudit, setActiveAudit] = useState<MergeAudit | null>(null);

  const filtered = useMemo(() => {
    return audits.filter((audit) => {
      const matchesQuery =
        query.length === 0 ||
        audit.primaryId.toLowerCase().includes(query.toLowerCase()) ||
        audit.secondaryId.toLowerCase().includes(query.toLowerCase());
      const mergedDate = new Date(audit.mergedAt).getTime();
      const matchesStart = startDate ? mergedDate >= new Date(startDate).getTime() : true;
      const matchesEnd = endDate ? mergedDate <= new Date(endDate).getTime() : true;
      return matchesQuery && matchesStart && matchesEnd;
    });
  }, [audits, query, startDate, endDate]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Merge History</h1>
          <p className="muted">Audit completed supporter merges.</p>
        </div>
      </div>

      <Card className="filters-card">
        <div className="filters-grid">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by supporter ID"
          />
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      </Card>

      <Card>
        <table>
          <thead>
            <tr>
              <th>Primary</th>
              <th>Secondary</th>
              <th>Moved Counts</th>
              <th>Merged By</th>
              <th>Merged At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((audit) => (
              <tr key={audit.id}>
                <td>{audit.primaryId}</td>
                <td>{audit.secondaryId}</td>
                <td>
                  {audit.movedCounts.transactions} tx · {audit.movedCounts.recurringPlans} rec ·{' '}
                  {audit.movedCounts.fundraisingPages} pages
                </td>
                <td>{audit.mergedBy}</td>
                <td>{new Date(audit.mergedAt).toLocaleString()}</td>
                <td>
                  <button className="btn-text" onClick={() => setActiveAudit(audit)}>
                    Audit detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {activeAudit && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Merge Audit {activeAudit.id}</h3>
              <button className="btn-text" onClick={() => setActiveAudit(null)}>
                Close
              </button>
            </div>
            <p className="muted">Dry run summary</p>
            <p>{activeAudit.dryRunSummary}</p>
            <p className="muted">Field resolutions</p>
            <ul>
              {Object.entries(activeAudit.fieldResolutions).map(([field, value]) => (
                <li key={field}>
                  {field}: {value}
                </li>
              ))}
            </ul>
            <p className="muted">Warnings shown</p>
            <ul>
              {activeAudit.warningsShown.length === 0
                ? 'None'
                : activeAudit.warningsShown.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
