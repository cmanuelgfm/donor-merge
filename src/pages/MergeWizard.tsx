import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../data/mockApi';
import { Supporter } from '../types';
import { logEvent } from '../utils/analytics';

const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'communicationPrefs.optIn'] as const;

type FieldKey = (typeof fields)[number];

const getFieldValue = (supporter: Supporter, field: FieldKey) => {
  if (field === 'communicationPrefs.optIn') {
    return String(supporter.communicationPrefs.optIn);
  }
  return String(supporter[field]);
};

const MergeWizard = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const candidate = candidateId ? mockApi.getDuplicateCandidate(candidateId) : undefined;

  const [step, setStep] = useState(1);
  const [primaryId, setPrimaryId] = useState(candidate?.recommendedPrimaryId ?? '');
  const [fieldResolutions, setFieldResolutions] = useState<Record<string, string>>({});
  const [confirmLowConfidence, setConfirmLowConfidence] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [auditId, setAuditId] = useState<string | null>(null);

  if (!candidate) {
    return <div className="card">Merge candidate not found.</div>;
  }

  const supporterA = mockApi.getSupporter(candidate.supporterAId) as Supporter;
  const supporterB = mockApi.getSupporter(candidate.supporterBId) as Supporter;
  const secondaryId = primaryId === supporterA.id ? supporterB.id : supporterA.id;
  const primary = primaryId === supporterA.id ? supporterA : supporterB;
  const secondary = secondaryId === supporterA.id ? supporterA : supporterB;

  const blockedReason = useMemo(() => {
    if (supporterA.flags.isDoNotMerge || supporterB.flags.isDoNotMerge) {
      return 'This supporter is marked as Do Not Merge.';
    }
    if (supporterA.flags.isMultiOrg || supporterB.flags.isMultiOrg || candidate.riskFlags.includes('Multi-org')) {
      return 'Cannot self-serve merge because records span multiple orgs.';
    }
    return '';
  }, [candidate.riskFlags, supporterA.flags.isDoNotMerge, supporterA.flags.isMultiOrg, supporterB.flags.isDoNotMerge, supporterB.flags.isMultiOrg]);

  const hasHighValue = supporterA.flags.isHighValue || supporterB.flags.isHighValue || candidate.riskFlags.includes('High value donor');
  const lowConfidence = candidate.confidenceScore < 60;

  const startFieldResolutions = () => {
    const resolutions: Record<string, string> = {};
    fields.forEach((field) => {
      const valueA = getFieldValue(supporterA, field);
      const valueB = getFieldValue(supporterB, field);
      if (valueA !== valueB) {
        resolutions[field] = primaryId === supporterA.id ? valueA : valueB;
      } else {
        resolutions[field] = valueA;
      }
    });
    setFieldResolutions(resolutions);
  };

  const goNext = () => {
    if (step === 1) {
      startFieldResolutions();
    }
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const downloadExceptions = () => {
    const csv = `candidateId,reason\n${candidate.id},${blockedReason}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `duplicate-exceptions-${candidate.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const confirmMerge = () => {
    const warnings: string[] = [];
    if (lowConfidence) warnings.push('Low confidence confirmation');
    if (hasHighValue) warnings.push('High value donor confirmation');
    const audit = mockApi.runMerge({
      candidateId: candidate.id,
      primaryId: primary.id,
      secondaryId: secondary.id,
      fieldResolutions,
      warningsShown: warnings
    });
    if (audit) {
      setAuditId(audit.id);
      setStep(6);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Review merge</h1>
          <p className="muted">Candidate {candidate.id}</p>
        </div>
        <Link className="button secondary" to="/supporters/duplicates">
          Back to queue
        </Link>
      </div>

      <div className="stepper">
        {[1, 2, 3, 4, 5].map((item) => (
          <span key={item} className={`step ${step === item ? 'active' : ''}`}>
            Step {item}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <h3>Step 1: Compare and choose primary</h3>
          <p className="muted">Primary keeps the Supporter ID. Secondary is merged into Primary.</p>
          <div className="grid-2">
            {[supporterA, supporterB].map((supporter) => (
              <div key={supporter.id} className={`panel ${primaryId === supporter.id ? 'selected' : ''}`}>
                <div className="filters">
                  <input
                    type="radio"
                    name="primary"
                    checked={primaryId === supporter.id}
                    onChange={() => setPrimaryId(supporter.id)}
                  />
                  <strong>
                    {supporter.firstName} {supporter.lastName}
                  </strong>
                </div>
                <p className="muted">{supporter.email}</p>
                <p className="muted">{supporter.phone}</p>
                <div className="divider" />
                <p>
                  <strong>{supporter.transactionsCount}</strong> transactions (${supporter.transactionsTotal})
                </p>
                <p>
                  <strong>{supporter.recurringPlansCount}</strong> recurring plans (${supporter.recurringTotal})
                </p>
                <p>
                  <strong>{supporter.fundraisingPagesCount}</strong> fundraising pages (${supporter.fundraisingTotal})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h3>Step 2: Resolve conflicting fields</h3>
          <p className="muted">Select which value should be kept for each field.</p>
          <div className="divider" />
          {fields.map((field) => {
            const label = field === 'communicationPrefs.optIn' ? 'Comms opt-in' : field;
            const valueA = getFieldValue(supporterA, field);
            const valueB = getFieldValue(supporterB, field);
            const isDifferent = valueA !== valueB;
            return (
              <div key={field} className="panel" style={{ marginBottom: '12px' }}>
                <strong>{label}</strong>
                {isDifferent ? (
                  <div className="filters">
                    <label className="checkbox">
                      <input
                        type="radio"
                        name={field}
                        checked={fieldResolutions[field] === valueA}
                        onChange={() => setFieldResolutions({ ...fieldResolutions, [field]: valueA })}
                      />
                      {supporterA.id}: {valueA}
                    </label>
                    <label className="checkbox">
                      <input
                        type="radio"
                        name={field}
                        checked={fieldResolutions[field] === valueB}
                        onChange={() => setFieldResolutions({ ...fieldResolutions, [field]: valueB })}
                      />
                      {supporterB.id}: {valueB}
                    </label>
                  </div>
                ) : (
                  <p className="muted">No conflict. Value: {valueA}</p>
                )}
                {field === 'email' && isDifferent && (
                  <p className="badge warn">Choosing an email can impact login expectations.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h3>Step 3: Preview what moves</h3>
          <p className="muted">This is a dry run summary of what will change.</p>
          <div className="panel">
            <p>
              Transactions: <strong>{secondary.transactionsCount}</strong> items moved
            </p>
            <p>
              Recurring plans: <strong>{secondary.recurringPlansCount}</strong> moved
            </p>
            <p>
              Fundraising pages: <strong>{secondary.fundraisingPagesCount}</strong> moved
            </p>
            <p className="muted">No data will be deleted. Secondary supporter will be deactivated and redirected.</p>
            <p className="muted">Integrations update events emitted: merge.initiated, merge.completed</p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <h3>Step 4: Validation and guardrails</h3>
          {blockedReason ? (
            <div className="panel">
              <span className="badge warn">Blocked</span>
              <p>{blockedReason}</p>
              <p className="muted">Resolve this in the exception report or contact your org admin.</p>
              <button className="button secondary" onClick={downloadExceptions}>
                Download exception report
              </button>
            </div>
          ) : (
            <div>
              {lowConfidence && (
                <label className="checkbox" style={{ marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={confirmLowConfidence}
                    onChange={(event) => setConfirmLowConfidence(event.target.checked)}
                  />
                  I understand this is a low-confidence match and want to proceed.
                </label>
              )}
              {hasHighValue && (
                <div className="panel" style={{ marginBottom: '12px' }}>
                  <p className="muted">High value donor detected. Type MERGE to confirm.</p>
                  <input
                    className="input"
                    value={confirmPhrase}
                    onChange={(event) => setConfirmPhrase(event.target.value)}
                    placeholder="Type MERGE"
                  />
                </div>
              )}
              <div className="panel">
                <p className="muted">All validation checks passed.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <h3>Step 5: Confirm and merge</h3>
          <p className="muted">This action cannot be undone.</p>
          <div className="panel">
            <p>
              Primary record: <strong>{primary.id}</strong>
            </p>
            <p>
              Secondary record: <strong>{secondary.id}</strong>
            </p>
            <p>
              Fields resolved: <strong>{Object.keys(fieldResolutions).length}</strong>
            </p>
          </div>
          <button
            className="button"
            onClick={confirmMerge}
            disabled={blockedReason !== '' || (lowConfidence && !confirmLowConfidence) || (hasHighValue && confirmPhrase !== 'MERGE')}
          >
            Run merge
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="card">
          <h3>Merge completed</h3>
          <p className="muted">Supporter records have been merged successfully.</p>
          <div className="filters">
            <button className="button" onClick={() => navigate(`/supporters/${primary.id}`)}>
              View primary supporter
            </button>
            <button className="button secondary" onClick={() => navigate('/supporters/merge-history')}>
              View merge audit
            </button>
            <button className="button secondary" onClick={() => navigate('/supporters/duplicates')}>
              Merge another candidate
            </button>
          </div>
          {auditId && <p className="muted">Audit ID: {auditId}</p>}
        </div>
      )}

      {step < 6 && (
        <div className="filters" style={{ marginTop: '16px' }}>
          <button className="button secondary" onClick={goBack} disabled={step === 1}>
            Back
          </button>
          <button
            className="button"
            onClick={() => {
              if (step === 3) logEvent('merge_dry_run_viewed', { candidateId: candidate.id });
              if (step === 4 && blockedReason) logEvent('merge_blocked', { candidateId: candidate.id, reason: blockedReason });
              goNext();
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default MergeWizard;
