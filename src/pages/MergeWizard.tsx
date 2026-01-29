import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../mockApi';
import { logEvent } from '../utils/analytics';
import { Supporter } from '../types';

const steps = [
  'Compare records',
  'Resolve fields',
  'Preview what moves',
  'Validation & guardrails',
  'Confirm merge'
];

const fieldLabels: Record<string, string> = {
  name: 'Name',
  email: 'Email address',
  phone: 'Phone number',
  address: 'Address',
  optIn: 'Comms opt-in'
};

const MergeWizard = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queue = (location.state as { queue?: string[] } | undefined)?.queue ?? [];
  const currentIndex = queue.findIndex((id) => id === candidateId);
  const nextCandidate = currentIndex >= 0 ? queue[currentIndex + 1] : undefined;

  const candidate = candidateId ? mockApi.getDuplicateCandidate(candidateId) : undefined;

  const supporterA = candidate ? mockApi.getSupporter(candidate.supporterAId) : undefined;
  const supporterB = candidate ? mockApi.getSupporter(candidate.supporterBId) : undefined;

  const [step, setStep] = useState(1);
  const [primaryId, setPrimaryId] = useState(candidate?.recommendedPrimaryId ?? '');
  const [fieldSelections, setFieldSelections] = useState<Record<string, string>>({});
  const [lowConfidenceAck, setLowConfidenceAck] = useState(false);
  const [typedConfirm, setTypedConfirm] = useState('');
  const [mergedAuditId, setMergedAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (candidate?.status === 'Suggested') {
      mockApi.setCandidateStatus(candidate.id, 'Reviewed');
    }
  }, [candidate]);

  useEffect(() => {
    if (!candidate || !supporterA || !supporterB) return;
    if (supporterA.flags.isDoNotMerge || supporterB.flags.isDoNotMerge) {
      mockApi.setCandidateStatus(candidate.id, 'Blocked');
    }
    if (supporterA.flags.isMultiOrg || supporterB.flags.isMultiOrg) {
      mockApi.setCandidateStatus(candidate.id, 'Blocked');
    }
  }, [candidate, supporterA, supporterB]);

  useEffect(() => {
    if (candidateId) {
      logEvent('duplicate_review_opened', { candidateId });
    }
  }, [candidateId]);

  useEffect(() => {
    if (candidate && supporterA && supporterB) {
      setPrimaryId(candidate.recommendedPrimaryId);
      setFieldSelections({
        name: candidate.recommendedPrimaryId,
        email: candidate.recommendedPrimaryId,
        phone: candidate.recommendedPrimaryId,
        address: candidate.recommendedPrimaryId,
        optIn: candidate.recommendedPrimaryId
      });
    }
  }, [candidate, supporterA, supporterB]);

  if (!candidate || !supporterA || !supporterB) {
    return (
      <div className="card">
        <div className="card-title">Merge candidate not found</div>
        <Link className="button" to="/supporters/duplicates">
          Back to duplicates
        </Link>
      </div>
    );
  }

  const primary = primaryId === supporterA.id ? supporterA : supporterB;
  const secondary = primaryId === supporterA.id ? supporterB : supporterA;

  const blockedReasons: string[] = [];
  if (supporterA.flags.isDoNotMerge || supporterB.flags.isDoNotMerge) {
    blockedReasons.push('This supporter is marked as Do Not Merge.');
  }
  if (supporterA.flags.isMultiOrg || supporterB.flags.isMultiOrg) {
    blockedReasons.push('Records span multiple orgs and must be handled by Support.');
  }

  const isBlocked = blockedReasons.length > 0;
  const isLowConfidence = candidate.confidenceScore < 60;
  const isHighValue = supporterA.flags.isHighValue || supporterB.flags.isHighValue;

  const movedCounts = useMemo(() => {
    return {
      transactions: mockApi.getSupporterTransactions(secondary.id).length,
      recurringPlans: mockApi.getSupporterRecurringPlans(secondary.id).length,
      fundraisingPages: mockApi.getSupporterFundraisingPages(secondary.id).length
    };
  }, [secondary.id]);

  const dryRunSummary = `${movedCounts.transactions} transactions, ${movedCounts.recurringPlans} recurring plans, and ${movedCounts.fundraisingPages} fundraising pages will be moved.`;

  const handleFieldSelect = (field: string, supporterId: string) => {
    setFieldSelections((prev) => ({ ...prev, [field]: supporterId }));
  };

  const getFieldValue = (supporter: Supporter, field: string) => {
    if (field === 'name') return `${supporter.firstName} ${supporter.lastName}`;
    if (field === 'email') return supporter.email;
    if (field === 'phone') return supporter.phone;
    if (field === 'address') return supporter.address;
    if (field === 'optIn') return supporter.communicationPrefs.optIn ? 'Opted In' : 'Opted Out';
    return '';
  };

  const confirmMerge = () => {
    const warnings: string[] = [];
    if (fieldSelections.email === secondary.id) {
      warnings.push('Secondary email selected. Ensure the supporter can still log in.');
    }
    if (isLowConfidence) {
      warnings.push('Low confidence match confirmation required.');
    }

    const audit = mockApi.mergeCandidate({
      candidateId: candidate.id,
      primaryId: primary.id,
      secondaryId: secondary.id,
      fieldResolutions: fieldSelections,
      warningsShown: warnings,
      dryRunSummary
    });

    if (audit) {
      logEvent('merge_confirmed', { candidateId: candidate.id });
      setMergedAuditId(audit.id);
      setStep(6);
    }
  };

  const downloadExceptions = () => {
    const csv = `candidateId,reason\n${candidate.id},${blockedReasons.join(' | ')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exceptions-${candidate.id}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  if (step === 6 && mergedAuditId) {
    return (
      <div className="card">
        <div className="card-title">Merge complete</div>
        <p className="page-subtitle">Supporter records have been combined successfully.</p>
        <div className="notice success">{dryRunSummary}</div>
        <div className="form-row" style={{ marginTop: 16 }}>
          <Link className="button primary" to={`/supporters/${primary.id}`}>
            View primary supporter
          </Link>
          <Link className="button" to="/supporters/merge-history">
            View merge audit
          </Link>
          {nextCandidate ? (
            <button
              className="button"
              onClick={() => navigate(`/supporters/merge/${nextCandidate}`, { state: { queue } })}
            >
              Review next candidate
            </button>
          ) : (
            <button className="button" onClick={() => navigate('/supporters/duplicates')}>
              Merge another candidate
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="supporter-header">
        <div>
          <h1 className="page-title">Merge review</h1>
          <p className="page-subtitle">Candidate {candidate.id}</p>
        </div>
        <Link className="button" to="/supporters/duplicates">
          Back to queue
        </Link>
      </div>

      <div className="stepper">
        {steps.map((label, index) => (
          <div key={label} className={`step ${step === index + 1 ? 'active' : ''}`}>
            {index + 1}. {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Step 1: Compare and choose primary</div>
            <span className="badge">Recommended: {candidate.recommendedPrimaryId}</span>
          </div>
          <div className="grid-two">
            {[supporterA, supporterB].map((supporter) => (
              <div key={supporter.id} className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">
                      {supporter.firstName} {supporter.lastName}
                    </div>
                    <div className="kpi-label">ID {supporter.id}</div>
                  </div>
                  <label>
                    <input
                      type="radio"
                      name="primary"
                      checked={primaryId === supporter.id}
                      onChange={() => setPrimaryId(supporter.id)}
                    />{' '}
                    Primary record
                  </label>
                </div>
                <div className="section-grid">
                  <div>Email: {supporter.email}</div>
                  <div>Phone: {supporter.phone}</div>
                  <div>Address: {supporter.address}</div>
                  <div>Transactions: {supporter.transactionsCount}</div>
                  <div>Recurring plans: {supporter.recurringPlansCount}</div>
                  <div>Fundraising pages: {supporter.fundraisingPagesCount}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="notice" style={{ marginTop: 12 }}>
            Primary keeps the Supporter ID. Secondary is merged into primary with a redirect.
          </div>
          <div className="form-row" style={{ marginTop: 16 }}>
            <button className="button primary" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-title">Step 2: Resolve conflicting fields</div>
          <div className="section-grid" style={{ marginTop: 16 }}>
            {Object.keys(fieldLabels).map((field) => (
              <div key={field} className="card">
                <div className="card-header">
                  <div className="card-title">{fieldLabels[field]}</div>
                </div>
                <div className="grid-two">
                  {[supporterA, supporterB].map((supporter) => (
                    <label key={supporter.id} className="notice">
                      <input
                        type="radio"
                        name={`field-${field}`}
                        checked={fieldSelections[field] === supporter.id}
                        onChange={() => handleFieldSelect(field, supporter.id)}
                      />{' '}
                      {getFieldValue(supporter, field)}
                    </label>
                  ))}
                </div>
                {field === 'email' && supporterA.email !== supporterB.email && (
                  <div className="notice warning" style={{ marginTop: 8 }}>
                    Choosing a different email may affect login expectations. Confirm with the supporter.
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="form-row" style={{ marginTop: 16 }}>
            <button className="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="button primary"
              onClick={() => {
                logEvent('merge_dry_run_viewed', { candidateId: candidate.id });
                setStep(3);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-title">Step 3: Preview what moves</div>
          <div className="notice" style={{ marginTop: 12 }}>
            This will move data from <strong>{secondary.id}</strong> into{' '}
            <strong>{primary.id}</strong>.
          </div>
          <div className="section-grid" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="card-title">This will move</div>
              <ul>
                <li>{movedCounts.transactions} transactions</li>
                <li>{movedCounts.recurringPlans} recurring plans</li>
                <li>{movedCounts.fundraisingPages} fundraising pages</li>
              </ul>
              <div className="notice">No data will be deleted. Secondary will be deactivated/redirected.</div>
            </div>
            <div className="card">
              <div className="card-title">Integrations update</div>
              <div className="notice">Event emitted: supporter.merge.completed</div>
              <div className="notice">Event emitted: supporter.redirect.created</div>
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 16 }}>
            <button className="button" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="button primary" onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <div className="card-title">Step 4: Validation & guardrails</div>
          {isBlocked ? (
            <div className="notice error" style={{ marginTop: 16 }}>
              <strong>Merge blocked.</strong> {blockedReasons.join(' ')}
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 16 }}>
              Confirm guardrails before running the merge.
            </div>
          )}

          {isBlocked && (
            <div className="form-row" style={{ marginTop: 16 }}>
              <button className="button" onClick={downloadExceptions}>
                Download exception report
              </button>
              <button
                className="button"
                onClick={() => {
                  logEvent('merge_blocked', { candidateId: candidate.id });
                  navigate('/supporters/duplicates');
                }}
              >
                Return to queue
              </button>
            </div>
          )}

          {!isBlocked && (
            <div className="section-grid" style={{ marginTop: 16 }}>
              {isLowConfidence && (
                <label className="notice warning">
                  <input
                    type="checkbox"
                    checked={lowConfidenceAck}
                    onChange={(event) => setLowConfidenceAck(event.target.checked)}
                  />{' '}
                  Confidence is below 60%. I confirm I reviewed the records.
                </label>
              )}
              {isHighValue && (
                <div className="notice warning">
                  High-value donor detected. Type <strong>MERGE</strong> to confirm.
                  <div>
                    <input
                      className="input"
                      value={typedConfirm}
                      onChange={(event) => setTypedConfirm(event.target.value)}
                      placeholder="Type MERGE"
                    />
                  </div>
                </div>
              )}
              <div className="notice">
                This action cannot be undone. Audit history will be recorded automatically.
              </div>
              <div className="form-row">
                <button className="button" onClick={() => setStep(3)}>
                  Back
                </button>
                <button
                  className="button primary"
                  onClick={() => setStep(5)}
                  disabled={(isLowConfidence && !lowConfidenceAck) || (isHighValue && typedConfirm !== 'MERGE')}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <div className="card-title">Step 5: Confirm and merge</div>
          <div className="notice" style={{ marginTop: 12 }}>
            Primary: <strong>{primary.id}</strong> · Secondary: <strong>{secondary.id}</strong>
          </div>
          <div className="section-grid" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="card-title">Field resolutions</div>
              <ul>
                {Object.keys(fieldLabels).map((field) => (
                  <li key={field}>
                    {fieldLabels[field]} → {fieldSelections[field]}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <div className="card-title">Dry run summary</div>
              <div className="notice">{dryRunSummary}</div>
            </div>
          </div>
          <div className="notice warning" style={{ marginTop: 16 }}>
            This action cannot be undone.
          </div>
          <div className="form-row" style={{ marginTop: 16 }}>
            <button className="button" onClick={() => setStep(4)}>
              Back
            </button>
            <button className="button warning" onClick={confirmMerge}>
              Run merge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeWizard;
