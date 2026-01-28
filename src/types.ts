export type Supporter = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  communicationPrefs: {
    optIn: boolean;
  };
  createdAt: string;
  updatedAt: string;
  orgId: string;
  flags: {
    isHighValue: boolean;
    isDoNotMerge: boolean;
    isMultiOrg: boolean;
  };
  transactionsCount: number;
  transactionsTotal: number;
  recurringPlansCount: number;
  recurringTotal: number;
  fundraisingPagesCount: number;
  fundraisingTotal: number;
  status: 'Active' | 'Merged';
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
  status: 'Active' | 'Paused' | 'Canceled';
  totalDonated: number;
  createdAt: string;
};

export type FundraisingPage = {
  id: string;
  supporterId: string;
  name: string;
  campaignTeam: string;
  status: 'Active' | 'Closed';
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

export type AppData = {
  supporters: Supporter[];
  transactions: Transaction[];
  recurringPlans: RecurringPlan[];
  fundraisingPages: FundraisingPage[];
  duplicateCandidates: DuplicateCandidate[];
  mergeAudits: MergeAudit[];
  analyticsEvents: { name: string; payload?: Record<string, unknown>; createdAt: string }[];
};
