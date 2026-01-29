export type SupporterStatus = 'Active' | 'Merged';

export interface Supporter {
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
  status: SupporterStatus;
  mergedIntoId?: string;
}

export interface Transaction {
  id: string;
  supporterId: string;
  amount: number;
  status: 'Successful' | 'Pending';
  campaignName: string;
  createdAt: string;
}

export interface RecurringPlan {
  id: string;
  supporterId: string;
  amount: number;
  frequency: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  totalDonated: number;
  createdAt: string;
}

export interface FundraisingPage {
  id: string;
  supporterId: string;
  name: string;
  campaignTeam: string;
  status: 'Active' | 'Paused' | 'Closed';
  totalRaised: number;
  createdAt: string;
}

export type CandidateStatus = 'Suggested' | 'Reviewed' | 'Merged' | 'Dismissed' | 'Blocked';

export interface DuplicateCandidate {
  id: string;
  orgId: string;
  supporterAId: string;
  supporterBId: string;
  confidenceScore: number;
  matchReasons: string[];
  recommendedPrimaryId: string;
  riskFlags: string[];
  status: CandidateStatus;
  createdAt: string;
}

export interface MergeAudit {
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
}

export interface SupporterStats {
  transactionsCount: number;
  transactionsTotal: number;
  recurringPlansCount: number;
  recurringPlansTotal: number;
  fundraisingPagesCount: number;
  fundraisingPagesTotal: number;
}

export interface SupporterWithStats extends Supporter, SupporterStats {}
