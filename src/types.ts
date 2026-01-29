export type CommunicationPrefs = {
  optIn: boolean;
};

export type SupporterFlags = {
  isHighValue?: boolean;
  isDoNotMerge?: boolean;
  isMultiOrg?: boolean;
};

export type Supporter = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  communicationPrefs: CommunicationPrefs;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  flags: SupporterFlags;
  mergedIntoId?: string;
};

export type Transaction = {
  id: string;
  supporterId: string;
  amount: number;
  status: 'Successful' | 'Pending';
  campaignName: string;
  createdAt: string;
};

export type RecurringPlan = {
  id: string;
  supporterId: string;
  amount: number;
  frequency: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  totalDonated: number;
  createdAt: string;
};

export type FundraisingPage = {
  id: string;
  supporterId: string;
  name: string;
  campaignTeam: string;
  status: 'Active' | 'Inactive' | 'Closed';
  totalRaised: number;
  createdAt: string;
};

export type DuplicateCandidate = {
  id: string;
  orgId: string;
  supporterAId: string;
  supporterBId: string;
  confidenceScore: number;
  matchReasons: string[];
  recommendedPrimaryId: string;
  riskFlags: string[];
  status: 'Suggested' | 'Reviewed' | 'Merged' | 'Dismissed' | 'Blocked';
  createdAt: string;
};

export type MergeAudit = {
  id: string;
  orgId: string;
  mergedAt: string;
  mergedBy: string;
  primaryId: string;
  secondaryId: string;
  movedCounts: {
    transactions: number;
    recurringPlans: number;
    fundraisingPages: number;
  };
  fieldResolutions: Record<string, string>;
  warningsShown: string[];
  dryRunSummary: string;
};

export type AnalyticsEvent = {
  id: string;
  name:
    | 'duplicates_queue_viewed'
    | 'duplicate_review_opened'
    | 'merge_dry_run_viewed'
    | 'merge_confirmed'
    | 'merge_blocked'
    | 'merge_dismissed';
  createdAt: string;
  payload?: Record<string, unknown>;
};

export type AppData = {
  supporters: Supporter[];
  transactions: Transaction[];
  recurringPlans: RecurringPlan[];
  fundraisingPages: FundraisingPage[];
  duplicateCandidates: DuplicateCandidate[];
  mergeAudits: MergeAudit[];
  analyticsEvents: AnalyticsEvent[];
};
