import { useMemo, useState } from 'react';
import { mockApi } from '../data/mockApi';
import { MergeAudit } from '../types';

const MergeHistory = () => {
  const [supporterId, setSupporterId] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<MergeAudit | null>(null);

  const audits = useMemo(() => mockApi.listMergeAudits({ supporterId }), [supporterId]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Merge history</h1>
          <p className="muted">Review completed merges and audit details.</p>
        </div>
        <input
          className="input"
          placeholder="Filter by supporter ID"
          value={supporterId}
          onChange={(event) => setSupporterId(event.target.value)}
        />
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
              <th>Audit</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td>{audit.primaryId}</td>
                <td>{audit.secondaryId}</td>
                <td>
                  {audit.movedCounts.transactions} transactions / {audit.movedCounts.recurringPlans} recurring /{' '}
                  {audit.movedCounts.fundraisingPages} pages
                </td>
                <td>{audit.mergedBy}</td>
                <td>{new Date(audit.mergedAt).toLocaleString()}</td>
                <td>
                  <button className="button ghost" onClick={() => setSelectedAudit(audit)}>
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAudit && (
        <div className="modal-backdrop" onClick={() => setSelectedAudit(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Audit detail</h3>
            <p className="muted">Audit ID: {selectedAudit.id}</p>
            <div className="divider" />
            <h4>Field resolutions</h4>
            <ul>
              {Object.entries(selectedAudit.fieldResolutions).map(([field, value]) => (
                <li key={field}>
                  {field}: {value}
                </li>
              ))}
            </ul>
            <h4>Warnings shown</h4>
            {selectedAudit.warningsShown.length === 0 ? (
              <p className="muted">None</p>
            ) : (
              <ul>
                {selectedAudit.warningsShown.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            <h4>Dry run summary</h4>
            <p>{selectedAudit.dryRunSummary}</p>
            <button className="button" onClick={() => setSelectedAudit(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeHistory;
