import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { DuplicateCandidate, MergeAudit, Supporter } from '../types';
import { formatCurrency, formatDate, getConfidenceLabel } from '../utils';
import { trackEvent } from '../analytics';

const steps = [
  'Compare',
  'Resolve fields',
  'Preview moves',
  'Validate',
  'Confirm'
];

const MergeWizardPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState<DuplicateCandidate | null>(null);
  const [supporterA, setSupporterA] = useState<Supporter | null>(null);
  const [supporterB, setSupporterB] = useState<Supporter | null>(null);
  const [metricsA, setMetricsA] = useState({
    transactionsCount: 0,
    recurringPlansCount: 0,
    fundraisingPagesCount: 0,
    transactionsTotal: 0,
    recurringTotal: 0,
    fundraisingTotal: 0
  });
  const [metricsB, setMetricsB] = useState({
    transactionsCount: 0,
    recurringPlansCount: 0,
    fundraisingPagesCount: 0,
    transactionsTotal: 0,
    recurringTotal: 0,
    fundraisingTotal: 0
  });
  const [step, setStep] = useState(0);
  const [primaryId, setPrimaryId] = useState('');
  const [fieldSelections, setFieldSelections] = useState<Record<string, 'A' | 'B'>>({});
  const [confirmLowConfidence, setConfirmLowConfidence] = useState(false);
  const [confirmMergeText, setConfirmMergeText] = useState('');
  const [mergeAudit, setMergeAudit] = useState<MergeAudit | null>(null);
  const [bulkQueue, setBulkQueue] = useState<string[]>([]);

  useEffect(() => {
    if (!candidateId) return;
    const params = new URLSearchParams(location.search);
    if (params.get('bulk') === '1') {
      const stored = localStorage.getItem('gfp-bulk-review');
      if (stored) {
        setBulkQueue(JSON.parse(stored) as string[]);
      }
    }
    mockApi.getDuplicateCandidates().then((data) => {
      const found = data.find((item) => item.id === candidateId) || null;
      setCandidate(found);
      if (found?.status === 'Suggested') {
        mockApi.updateCandidate({ ...found, status: 'Reviewed' }).then(async () => {
          const updated = await mockApi.getDuplicateCandidates();
          const updatedCandidate = updated.find((item) => item.id === candidateId) || null;
          setCandidate(updatedCandidate);
        });
      }
    });
  }, [candidateId, location.search]);

  useEffect(() => {
    if (!candidate) return;
    trackEvent('duplicate_review_opened', { candidateId: candidate.id });
    mockApi.getSupporter(candidate.supporterAId).then((data) => setSupporterA(data ?? null));
    mockApi.getSupporter(candidate.supporterBId).then((data) => setSupporterB(data ?? null));
    mockApi.getMetricsForSupporter(candidate.supporterAId).then((data) => setMetricsA(data));
    mockApi.getMetricsForSupporter(candidate.supporterBId).then((data) => setMetricsB(data));
    setPrimaryId(candidate.recommendedPrimaryId);
  }, [candidate]);

  useEffect(() => {
    if (step === 2) {
      trackEvent('merge_dry_run_viewed', { candidateId });
    }
  }, [step, candidateId]);

  useEffect(() => {
    if (step === 3 && isBlocked) {
      trackEvent('merge_blocked', { candidateId });
    }
  }, [isBlocked, step, candidateId]);

  const isBlocked = useMemo(() => {
    if (!candidate || !supporterA || !supporterB) return false;
    return (
      supporterA.flags.isDoNotMerge ||
      supporterB.flags.isDoNotMerge ||
      supporterA.flags.isMultiOrg ||
      supporterB.flags.isMultiOrg ||
      candidate.riskFlags.includes('Multi-org')
    );
  }, [candidate, supporterA, supporterB]);

  const lowConfidence = candidate ? candidate.confidenceScore < 60 : false;
  const highValue = supporterA?.flags.isHighValue || supporterB?.flags.isHighValue;

  const secondaryId = useMemo(() => {
    if (!candidate) return '';
    return primaryId === candidate.supporterAId ? candidate.supporterBId : candidate.supporterAId;
  }, [candidate, primaryId]);

  const handleFieldSelection = (field: string, choice: 'A' | 'B') => {
    setFieldSelections((prev) => ({ ...prev, [field]: choice }));
  };

  const fieldRows = useMemo(() => {
    if (!supporterA || !supporterB) return [];
    return [
      { key: 'firstName', label: 'First name', a: supporterA.firstName, b: supporterB.firstName },
      { key: 'lastName', label: 'Last name', a: supporterA.lastName, b: supporterB.lastName },
      { key: 'email', label: 'Email', a: supporterA.email, b: supporterB.email },
      { key: 'phone', label: 'Phone', a: supporterA.phone, b: supporterB.phone },
      { key: 'address', label: 'Address', a: supporterA.address, b: supporterB.address },
      {
        key: 'optIn',
        label: 'Comms opt-in',
        a: supporterA.communicationPrefs.optIn ? 'Opted in' : 'Opted out',
        b: supporterB.communicationPrefs.optIn ? 'Opted in' : 'Opted out'
      }
    ];
  }, [supporterA, supporterB]);

  if (!candidate || !supporterA || !supporterB) {
    return <div className="card">Loading merge candidate...</div>;
  }

  if (candidate.status === 'Merged') {
    return (
      <div className="card">
        <div className="card-title">Candidate already merged</div>
        <p className="muted">This duplicate has already been merged. Review the audit history instead.</p>
        <Link className="pill-button" to="/supporters/merge-history">
          View merge history
        </Link>
      </div>
    );
  }

  const primarySupporter = primaryId === supporterA.id ? supporterA : supporterB;
  const secondarySupporter = secondaryId === supporterA.id ? supporterA : supporterB;

  const movedCounts =
    primaryId === supporterA.id
      ? {
          transactions: metricsB.transactionsCount,
          recurringPlans: metricsB.recurringPlansCount,
          fundraisingPages: metricsB.fundraisingPagesCount
        }
      : {
          transactions: metricsA.transactionsCount,
          recurringPlans: metricsA.recurringPlansCount,
          fundraisingPages: metricsA.fundraisingPagesCount
        };

  const dryRunSummary = `Move ${movedCounts.transactions} transactions, ${movedCounts.recurringPlans} recurring plans, and ${movedCounts.fundraisingPages} fundraising pages.`;

  const validationBlocked = (lowConfidence && !confirmLowConfidence) || (highValue && confirmMergeText !== 'MERGE');

  const handleMerge = async () => {
    const warnings: string[] = [];
    if (lowConfidence) warnings.push('Low confidence match required manual confirmation.');
    if (highValue) warnings.push('High value donor confirmation was required.');

    const audit = await mockApi.mergeSupporters({
      candidateId: candidate.id,
      primaryId,
      secondaryId,
      fieldResolutions: Object.fromEntries(
        fieldRows.map((row) => [row.label, fieldSelections[row.key] === 'B' ? row.b : row.a])
      ),
      warnings,
      dryRunSummary,
      mergedBy: 'Colin Manuel'
    });

    trackEvent('merge_confirmed', { candidateId: candidate.id, primaryId, secondaryId });
    setMergeAudit(audit);
    setStep(4);

    if (bulkQueue.length > 0) {
      const remaining = bulkQueue.filter((id) => id !== candidate.id);
      setBulkQueue(remaining);
      localStorage.setItem('gfp-bulk-review', JSON.stringify(remaining));
    }
  };

  const nextBulkCandidate = bulkQueue.find((id) => id !== candidate.id);

  const blockedContent = isBlocked ? (
    <div className="notice danger" style={{ marginBottom: '16px' }}>
      This merge is blocked due to account restrictions. Records that span multiple organizations or
      are marked “Do not merge” must be handled by Support.
    </div>
  ) : null;

  return (
    <div>
      <div className="page-title">Review merge</div>
      <div className="page-subtitle">
        Candidate {candidate.id} • Confidence {getConfidenceLabel(candidate.confidenceScore)}
      </div>

      <div className="stepper">
        {steps.map((label, index) => (
          <div key={label} className={`step ${step === index ? 'active' : ''}`}>
            {index + 1}. {label}
          </div>
        ))}
      </div>

      {mergeAudit && step === 4 ? (
        <div className="card">
          <div className="card-title">Merge complete</div>
          <p>
            {secondaryId} was merged into {primaryId}. This action cannot be undone.
          </p>
          <div className="inline-list">
            <Link className="pill-button" to={`/supporters/${primaryId}`}>
              View primary profile
            </Link>
            <Link className="pill-button" to="/supporters/merge-history">
              View merge audit
            </Link>
            <Link className="pill-button" to="/supporters/duplicates">
              Merge another candidate
            </Link>
            {nextBulkCandidate && (
              <Link className="pill-button" to={`/supporters/merge/${nextBulkCandidate}?bulk=1`}>
                Review next selected
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          {step === 0 && (
            <div>
              <div className="card-title">Step 1: Compare and choose primary</div>
              <p className="muted">
                The primary record keeps the supporter ID. The secondary record is merged into the
                primary.
              </p>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Supporter A', supporter: supporterA, metrics: metricsA },
                  { label: 'Supporter B', supporter: supporterB, metrics: metricsB }
                ].map((item) => (
                  <div key={item.supporter.id} className="card" style={{ padding: '16px' }}>
                    <div className="inline-list" style={{ justifyContent: 'space-between' }}>
                      <strong>{item.label}</strong>
                      <label className="inline-list">
                        <input
                          type="radio"
                          name="primary"
                          checked={primaryId === item.supporter.id}
                          onChange={() => setPrimaryId(item.supporter.id)}
                        />
                        Primary record
                      </label>
                    </div>
                    <div className="divider" />
                    <div>
                      <div>
                        <strong>
                          {item.supporter.firstName} {item.supporter.lastName}
                        </strong>
                      </div>
                      <div className="muted">{item.supporter.email}</div>
                      <div className="muted">{item.supporter.phone}</div>
                      <div className="muted">{item.supporter.address}</div>
                    </div>
                    <div className="divider" />
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <div className="muted">Transactions</div>
                        <strong>{item.metrics.transactionsCount}</strong>
                        <div className="muted">{formatCurrency(item.metrics.transactionsTotal)}</div>
                      </div>
                      <div>
                        <div className="muted">Recurring plans</div>
                        <strong>{item.metrics.recurringPlansCount}</strong>
                        <div className="muted">{formatCurrency(item.metrics.recurringTotal)}</div>
                      </div>
                      <div>
                        <div className="muted">Fundraising pages</div>
                        <strong>{item.metrics.fundraisingPagesCount}</strong>
                        <div className="muted">{formatCurrency(item.metrics.fundraisingTotal)}</div>
                      </div>
                      <div>
                        <div className="muted">Updated</div>
                        <strong>{formatDate(item.supporter.updatedAt)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="card-title">Step 2: Resolve conflicting fields</div>
              <p className="muted">Choose which values to keep for the merged supporter.</p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Supporter A</th>
                    <th>Supporter B</th>
                    <th>Keep</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldRows.map((row) => {
                    const defaultChoice =
                      fieldSelections[row.key] ?? (primaryId === supporterA.id ? 'A' : 'B');
                    return (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>{row.a}</td>
                        <td>{row.b}</td>
                        <td>
                          <div className="inline-list">
                            <label>
                              <input
                                type="radio"
                                name={row.key}
                                checked={defaultChoice === 'A'}
                                onChange={() => handleFieldSelection(row.key, 'A')}
                              />{' '}
                              A
                            </label>
                            <label>
                              <input
                                type="radio"
                                name={row.key}
                                checked={defaultChoice === 'B'}
                                onChange={() => handleFieldSelection(row.key, 'B')}
                              />{' '}
                              B
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="notice warning" style={{ marginTop: '16px' }}>
                Choosing a new email may affect login expectations. Confirm with your CRM team if
                needed.
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="card-title">Step 3: Preview what moves</div>
              <p className="muted">No data will be deleted. The secondary supporter is deactivated.</p>
              <div className="grid grid-3">
                <div className="card">
                  <div className="kpi-label">Transactions moved</div>
                  <div className="kpi-value">{movedCounts.transactions}</div>
                </div>
                <div className="card">
                  <div className="kpi-label">Recurring plans moved</div>
                  <div className="kpi-value">{movedCounts.recurringPlans}</div>
                </div>
                <div className="card">
                  <div className="kpi-label">Fundraising pages moved</div>
                  <div className="kpi-value">{movedCounts.fundraisingPages}</div>
                </div>
              </div>
              <div className="divider" />
              <p>
                Integrations updated: CRM sync, Email marketing, Data warehouse. Events emitted:
                supporter.merged, supporter.updated, donations.reassigned.
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="card-title">Step 4: Validation & guardrails</div>
              {blockedContent}
              {isBlocked ? (
                <div>
                  <p>
                    This merge cannot be completed in-product. Download the exception report to send
                    to Support.
                  </p>
                  <button
                    className="button outline"
                    onClick={() => {
                      trackEvent('merge_blocked', { candidateId: candidate.id });
                      const csv = `candidateId,reason\n${candidate.id},Blocked: multi-org or do-not-merge`;
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'merge-exceptions.csv';
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download exception report
                  </button>
                </div>
              ) : (
                <div>
                  {lowConfidence && (
                    <label className="notice warning" style={{ display: 'block', marginBottom: '12px' }}>
                      <input
                        type="checkbox"
                        checked={confirmLowConfidence}
                        onChange={(event) => setConfirmLowConfidence(event.target.checked)}
                      />{' '}
                      This match is below 60% confidence. I confirm that these supporters are the same
                      person.
                    </label>
                  )}
                  {highValue && (
                    <div className="notice warning" style={{ marginBottom: '12px' }}>
                      High-value donors require additional confirmation. Type MERGE to continue.
                      <input
                        className="input"
                        value={confirmMergeText}
                        onChange={(event) => setConfirmMergeText(event.target.value)}
                        placeholder="Type MERGE"
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                  )}
                  <div className="notice">
                    Primary record: <strong>{primarySupporter.id}</strong>. Secondary record:{' '}
                    <strong>{secondarySupporter.id}</strong>. This action cannot be undone.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="card-title">Step 5: Confirm and merge</div>
              <p>
                You are about to merge <strong>{secondarySupporter.id}</strong> into{' '}
                <strong>{primarySupporter.id}</strong>. Review the summary below.
              </p>
              <div className="divider" />
              <div className="grid grid-3">
                <div>
                  <div className="muted">Transactions moved</div>
                  <strong>{movedCounts.transactions}</strong>
                </div>
                <div>
                  <div className="muted">Recurring plans moved</div>
                  <strong>{movedCounts.recurringPlans}</strong>
                </div>
                <div>
                  <div className="muted">Fundraising pages moved</div>
                  <strong>{movedCounts.fundraisingPages}</strong>
                </div>
              </div>
              <div className="divider" />
              <button
                className="button primary"
                onClick={handleMerge}
                disabled={validationBlocked}
              >
                Run merge
              </button>
            </div>
          )}

          <div className="divider" />
          <div className="inline-list" style={{ justifyContent: 'space-between' }}>
            <button className="button secondary" onClick={() => navigate(-1)}>
              Back
            </button>
            <div className="inline-list">
              {step > 0 && step < 4 && (
                <button className="button outline" onClick={() => setStep(step - 1)}>
                  Previous
                </button>
              )}
              {step < 4 && !isBlocked && (
                <button
                  className="button primary"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 3 && validationBlocked}
                >
                  Continue
                </button>
              )}
              {step < 4 && isBlocked && (
                <Link className="pill-button" to="/supporters/duplicates">
                  Return to queue
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeWizardPage;
