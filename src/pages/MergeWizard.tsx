import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { mockApi } from '../mock/mockApi';
import { DuplicateCandidate, Supporter } from '../mock/types';
import { analytics } from '../utils/analytics';

const steps = [
  'Compare records',
  'Resolve conflicts',
  'Preview changes',
  'Validation',
  'Confirm merge',
];

const fieldLabels: Record<string, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  communicationPrefs: 'Comms opt-in',
};

const getFieldValue = (supporter: Supporter, field: string) => {
  if (field === 'communicationPrefs') {
    return supporter.communicationPrefs.optIn ? 'true' : 'false';
  }
  return (supporter as Record<string, string>)[field];
};

export const MergeWizard = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const candidate = candidateId
    ? mockApi.getDuplicateCandidates().find((item) => item.id === candidateId)
    : undefined;

  const supporterA = candidate ? mockApi.getSupporter(candidate.supporterAId) : undefined;
  const supporterB = candidate ? mockApi.getSupporter(candidate.supporterBId) : undefined;
  const [stepIndex, setStepIndex] = useState(0);
  const [primaryId, setPrimaryId] = useState(candidate?.recommendedPrimaryId || '');
  const [fieldResolutions, setFieldResolutions] = useState<Record<string, string>>({});
  const [confirmLowConfidence, setConfirmLowConfidence] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [mergeComplete, setMergeComplete] = useState(false);

  useEffect(() => {
    analytics.logEvent('duplicate_review_opened', { candidateId });
    if (candidate?.status === 'Suggested') {
      mockApi.updateCandidateStatus(candidate.id, 'Reviewed');
    }
  }, [candidateId, candidate]);

  useEffect(() => {
    if (stepIndex === 2) {
      analytics.logEvent('merge_dry_run_viewed', { candidateId });
    }
  }, [stepIndex, candidateId]);

  useEffect(() => {
    if (stepIndex === 3 && blockedReason) {
      mockApi.updateCandidateStatus(candidate.id, 'Blocked');
      analytics.logEvent('merge_blocked', { candidateId: candidate.id });
    }
  }, [stepIndex, blockedReason, candidate.id]);

  if (!candidate || !supporterA || !supporterB) {
    return (
      <div className="page">
        <Card>
          <h2>Merge candidate not found</h2>
          <Link className="btn-outline" to="/supporters/duplicates">
            Back to duplicates
          </Link>
        </Card>
      </div>
    );
  }

  const primary = primaryId === supporterA.id ? supporterA : supporterB;
  const secondary = primaryId === supporterA.id ? supporterB : supporterA;

  const conflictFields = Object.keys(fieldLabels).filter((field) => {
    const aValue = getFieldValue(supporterA, field);
    const bValue = getFieldValue(supporterB, field);
    return aValue !== bValue;
  });

  const movedTransactions = mockApi.getTransactions(secondary.id).length;
  const movedRecurring = mockApi.getRecurringPlans(secondary.id).length;
  const movedPages = mockApi.getFundraisingPages(secondary.id).length;

  const hasDoNotMerge = supporterA.flags.isDoNotMerge || supporterB.flags.isDoNotMerge;
  const isMultiOrg = supporterA.flags.isMultiOrg || supporterB.flags.isMultiOrg;
  const isHighValue = supporterA.flags.isHighValue || supporterB.flags.isHighValue;
  const isLowConfidence = candidate.confidenceScore < 60;

  const blockedReason = hasDoNotMerge
    ? 'One of these supporters is marked as Do Not Merge.'
    : isMultiOrg
      ? 'Cannot self-serve merge because records span multiple orgs.'
      : '';

  const canProceedValidation = !blockedReason;

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const applyFieldResolution = (field: string, value: string) => {
    setFieldResolutions((prev) => ({ ...prev, [field]: value }));
  };

  const handleMerge = () => {
    const warnings: string[] = [];
    if (isLowConfidence) {
      warnings.push('Low confidence merge confirmation required.');
    }
    if (isHighValue) {
      warnings.push('High value supporter confirmed by admin.');
    }
    if (fieldResolutions.email && fieldResolutions.email !== primary.email) {
      warnings.push('Primary email overwritten.');
    }

    const audit = mockApi.mergeCandidate(
      candidate.id,
      primary.id,
      secondary.id,
      fieldResolutions,
      warnings,
    );
    analytics.logEvent('merge_confirmed', { candidateId: candidate.id, auditId: audit.id });
    setMergeComplete(true);
  };

  const goToNextInBulk = () => {
    const rawQueue = localStorage.getItem('bulkReviewQueue');
    if (!rawQueue) return;
    const queue = JSON.parse(rawQueue) as string[];
    const remaining = queue.filter((id) => id !== candidate.id);
    if (remaining.length === 0) {
      localStorage.removeItem('bulkReviewQueue');
      navigate('/supporters/duplicates');
    } else {
      localStorage.setItem('bulkReviewQueue', JSON.stringify(remaining));
      navigate(`/supporters/merge/${remaining[0]}`);
    }
  };

  if (mergeComplete) {
    return (
      <div className="page">
        <Card>
          <h2>Merge complete</h2>
          <p className="muted">
            {secondary.firstName} {secondary.lastName} has been merged into {primary.firstName}{' '}
            {primary.lastName}.
          </p>
          <div className="button-row">
            <Link className="btn-primary" to={`/supporters/${primary.id}`}>
              View primary supporter
            </Link>
            <Link className="btn-outline" to="/supporters/merge-history">
              View merge audit
            </Link>
            <button className="btn-outline" onClick={goToNextInBulk}>
              Merge another candidate
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Merge review</h1>
          <p className="muted">
            Candidate {candidate.id} · Confidence {candidate.confidenceScore}%
          </p>
        </div>
        <Link className="btn-outline" to="/supporters/duplicates">
          Back to queue
        </Link>
      </div>

      <Card className="steps-card">
        {steps.map((step, index) => (
          <div key={step} className={`step ${index === stepIndex ? 'active' : ''}`}>
            <span>{index + 1}</span>
            <div>
              <strong>{step}</strong>
              <p className="muted">{index === stepIndex ? 'In progress' : 'Complete later'}</p>
            </div>
          </div>
        ))}
      </Card>

      {stepIndex === 0 && (
        <Card>
          <h2>Step 1: Compare and choose primary</h2>
          <p className="muted">
            The primary record keeps the Supporter ID. The secondary record is merged into the
            primary.
          </p>
          <div className="compare-grid">
            {[supporterA, supporterB].map((supporter) => (
              <div key={supporter.id} className="compare-card">
                <div className="compare-header">
                  <input
                    type="radio"
                    checked={primaryId === supporter.id}
                    onChange={() => setPrimaryId(supporter.id)}
                  />
                  <div>
                    <strong>
                      {supporter.firstName} {supporter.lastName}
                    </strong>
                    <p className="muted">{supporter.id}</p>
                  </div>
                  {supporter.id === candidate.recommendedPrimaryId && (
                    <Badge variant="info">Recommended primary</Badge>
                  )}
                </div>
                <div className="compare-body">
                  <p>Email: {supporter.email}</p>
                  <p>Phone: {supporter.phone}</p>
                  <p>Address: {supporter.address}</p>
                  <p>{supporter.transactionsCount} transactions</p>
                  <p>{supporter.recurringPlansCount} recurring plans</p>
                  <p>{supporter.fundraisingPagesCount} fundraising pages</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stepIndex === 1 && (
        <Card>
          <h2>Step 2: Resolve conflicting fields</h2>
          <p className="muted">Choose which value should be kept on the primary record.</p>
          <div className="stack">
            {conflictFields.map((field) => (
              <div key={field} className="field-row">
                <div>
                  <strong>{fieldLabels[field]}</strong>
                  {field === 'email' && (
                    <p className="warning-text">
                      Choosing a different email may change login expectations.
                    </p>
                  )}
                </div>
                <div className="field-options">
                  {[supporterA, supporterB].map((supporter) => (
                    <label key={supporter.id} className="radio-option">
                      <input
                        type="radio"
                        checked={
                          (fieldResolutions[field] || getFieldValue(primary, field)) ===
                          getFieldValue(supporter, field)
                        }
                        onChange={() => applyFieldResolution(field, getFieldValue(supporter, field))}
                      />
                      <span>
                        {supporter.firstName} {supporter.lastName} ·{' '}
                        {field === 'communicationPrefs'
                          ? supporter.communicationPrefs.optIn
                            ? 'Opted in'
                            : 'Opted out'
                          : getFieldValue(supporter, field)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stepIndex === 2 && (
        <Card>
          <h2>Step 3: Preview what moves</h2>
          <p className="muted">No data will be deleted. Secondary supporter will redirect.</p>
          <div className="preview-grid">
            <div>
              <strong>Transactions</strong>
              <p>{movedTransactions} items moved</p>
            </div>
            <div>
              <strong>Recurring plans</strong>
              <p>{movedRecurring} moved</p>
            </div>
            <div>
              <strong>Fundraising pages</strong>
              <p>{movedPages} moved</p>
            </div>
          </div>
          <Card className="info-card">
            <h3>Integrations updated</h3>
            <ul>
              <li>merge.completed</li>
              <li>supporter.primary.updated</li>
              <li>supporter.secondary.redirected</li>
            </ul>
          </Card>
        </Card>
      )}

      {stepIndex === 3 && (
        <Card>
          <h2>Step 4: Validation and guardrails</h2>
          {blockedReason ? (
            <div className="blocked">
              <Badge variant="danger">Blocked</Badge>
              <h3>{blockedReason}</h3>
              <p className="muted">
                Download the exception report and route to Support for resolution.
              </p>
              <button
                className="btn-outline"
                onClick={() => {
                  mockApi.downloadExceptionCsv(candidate.id, blockedReason);
                  analytics.logEvent('merge_blocked', { candidateId: candidate.id });
                }}
              >
                Download exceptions CSV
              </button>
            </div>
          ) : (
            <div className="stack">
              {isLowConfidence && (
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={confirmLowConfidence}
                    onChange={(event) => setConfirmLowConfidence(event.target.checked)}
                  />
                  <span>
                    This is a low-confidence match. I confirm I have reviewed the records.
                  </span>
                </label>
              )}
              {isHighValue && (
                <label className="stack">
                  <span className="warning-text">
                    High value supporter detected. Type MERGE to confirm.
                  </span>
                  <input
                    value={confirmPhrase}
                    onChange={(event) => setConfirmPhrase(event.target.value)}
                    placeholder="Type MERGE"
                  />
                </label>
              )}
              <p className="muted">This action cannot be undone.</p>
            </div>
          )}
        </Card>
      )}

      {stepIndex === 4 && (
        <Card>
          <h2>Step 5: Confirm and merge</h2>
          <p className="muted">Review your selections before running the merge.</p>
          <div className="summary-card">
            <p>
              <strong>Primary:</strong> {primary.firstName} {primary.lastName} ({primary.id})
            </p>
            <p>
              <strong>Secondary:</strong> {secondary.firstName} {secondary.lastName} ({secondary.id})
            </p>
            <p>
              <strong>Moves:</strong> {movedTransactions} transactions, {movedRecurring} recurring
              plans, {movedPages} fundraising pages
            </p>
          </div>
          <button
            className="btn-primary"
            disabled={
              !canProceedValidation ||
              (isLowConfidence && !confirmLowConfidence) ||
              (isHighValue && confirmPhrase !== 'MERGE')
            }
            onClick={handleMerge}
          >
            Run merge
          </button>
        </Card>
      )}

      <div className="wizard-actions">
        <button className="btn-outline" onClick={handleBack} disabled={stepIndex === 0}>
          Back
        </button>
        {stepIndex < steps.length - 1 && (
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={stepIndex === 3 && !canProceedValidation}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};
