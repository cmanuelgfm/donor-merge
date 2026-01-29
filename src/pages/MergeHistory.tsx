import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { MergeAudit } from '../types';

const MergeHistory = () => {
  const [supporterSearch, setSupporterSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<MergeAudit | null>(null);

  const audits = useMemo(() => {
    return mockApi.getMergeAudits().filter((audit) => {
      const matchesSupporter = supporterSearch
        ? audit.primaryId.toLowerCase().includes(supporterSearch.toLowerCase()) ||
          audit.secondaryId.toLowerCase().includes(supporterSearch.toLowerCase())
        : true;

      const auditDate = new Date(audit.mergedAt);
      const fromMatch = fromDate ? auditDate >= new Date(fromDate) : true;
      const toMatch = toDate ? auditDate <= new Date(toDate) : true;

      return matchesSupporter && fromMatch && toMatch;
    });
  }, [supporterSearch, fromDate, toDate]);

  return (
    <div>
      <div className="supporter-header">
        <div>
          <h1 className="page-title">Merge history</h1>
          <p className="page-subtitle">Audit trail for completed supporter merges.</p>
        </div>
        <Link className="button" to="/supporters/duplicates">
          Back to duplicates
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row">
          <input
            className="input"
            placeholder="Filter by supporter ID"
            value={supporterSearch}
            onChange={(event) => setSupporterSearch(event.target.value)}
          />
          <input
            type="date"
            className="input"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
          <input
            type="date"
            className="input"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Primary</th>
              <th>Secondary</th>
              <th>Moved counts</th>
              <th>Merged by</th>
              <th>Merged at</th>
              <th>Audit detail</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td>
                  <Link className="link" to={`/supporters/${audit.primaryId}`}>
                    {audit.primaryId}
                  </Link>
                </td>
                <td>
                  <Link className="link" to={`/supporters/${audit.secondaryId}`}>
                    {audit.secondaryId}
                  </Link>
                </td>
                <td>
                  {audit.movedCounts.transactions} tx · {audit.movedCounts.recurringPlans} recurring ·{' '}
                  {audit.movedCounts.fundraisingPages} pages
                </td>
                <td>{audit.mergedBy}</td>
                <td>{audit.mergedAt}</td>
                <td>
                  <button className="button" onClick={() => setSelectedAudit(audit)}>
                    View detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAudit && (
        <div className="modal" onClick={() => setSelectedAudit(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="card-title">Audit detail {selectedAudit.id}</div>
            <p className="page-subtitle">
              Primary {selectedAudit.primaryId} · Secondary {selectedAudit.secondaryId}
            </p>
            <div className="section-grid">
              <div>
                <strong>Field resolutions</strong>
                <ul>
                  {Object.entries(selectedAudit.fieldResolutions).map(([field, value]) => (
                    <li key={field}>
                      {field}: {value}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Warnings shown</strong>
                <ul>
                  {selectedAudit.warningsShown.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Dry run summary</strong>
                <p>{selectedAudit.dryRunSummary}</p>
              </div>
            </div>
            <div className="form-row" style={{ marginTop: 16 }}>
              <button className="button primary" onClick={() => setSelectedAudit(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeHistory;
