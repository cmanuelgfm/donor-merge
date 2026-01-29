import { seedData, SeedData } from './data/seed';
import {
  DuplicateCandidate,
  FundraisingPage,
  MergeAudit,
  RecurringPlan,
  Supporter,
  SupporterStats,
  SupporterWithStats,
  Transaction
} from './types';

const STORAGE_KEY = 'gfpro-merge-prototype';

interface Database extends SeedData {}

const loadDb = (): Database => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return JSON.parse(raw) as Database;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
};

const saveDb = (db: Database) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const getDb = () => loadDb();

const computeSupporterStats = (supporterId: string, db: Database): SupporterStats => {
  const transactions = db.transactions.filter((tx) => tx.supporterId === supporterId);
  const recurringPlans = db.recurringPlans.filter((rp) => rp.supporterId === supporterId);
  const fundraisingPages = db.fundraisingPages.filter((fp) => fp.supporterId === supporterId);

  const transactionsTotal = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const recurringPlansTotal = recurringPlans.reduce((sum, rp) => sum + rp.totalDonated, 0);
  const fundraisingPagesTotal = fundraisingPages.reduce((sum, fp) => sum + fp.totalRaised, 0);

  return {
    transactionsCount: transactions.length,
    transactionsTotal,
    recurringPlansCount: recurringPlans.length,
    recurringPlansTotal,
    fundraisingPagesCount: fundraisingPages.length,
    fundraisingPagesTotal
  };
};

const withStats = (supporter: Supporter, db: Database): SupporterWithStats => ({
  ...supporter,
  ...computeSupporterStats(supporter.id, db)
});

export const mockApi = {
  getSupporters: (search = '', includeMerged = false): SupporterWithStats[] => {
    const db = getDb();
    const normalized = search.toLowerCase().trim();
    const supporters = includeMerged
      ? db.supporters
      : db.supporters.filter((supporter) => supporter.status !== 'Merged');

    return supporters
      .filter((supporter) => {
        if (!normalized) return true;
        return (
          supporter.id.toLowerCase().includes(normalized) ||
          supporter.firstName.toLowerCase().includes(normalized) ||
          supporter.lastName.toLowerCase().includes(normalized) ||
          supporter.email.toLowerCase().includes(normalized)
        );
      })
      .map((supporter) => withStats(supporter, db));
  },
  getSupporter: (id: string): SupporterWithStats | undefined => {
    const db = getDb();
    const supporter = db.supporters.find((item) => item.id === id);
    if (!supporter) return undefined;
    return withStats(supporter, db);
  },
  getSupporterTransactions: (supporterId: string): Transaction[] => {
    const db = getDb();
    return db.transactions.filter((tx) => tx.supporterId === supporterId);
  },
  getSupporterRecurringPlans: (supporterId: string): RecurringPlan[] => {
    const db = getDb();
    return db.recurringPlans.filter((rp) => rp.supporterId === supporterId);
  },
  getSupporterFundraisingPages: (supporterId: string): FundraisingPage[] => {
    const db = getDb();
    return db.fundraisingPages.filter((fp) => fp.supporterId === supporterId);
  },
  getDuplicateCandidates: ({
    search = '',
    status = 'all',
    confidence = 'all',
    riskFlags = [] as string[]
  }: {
    search?: string;
    status?: string;
    confidence?: string;
    riskFlags?: string[];
  } = {}): DuplicateCandidate[] => {
    const db = getDb();
    const normalized = search.toLowerCase().trim();
    return db.duplicateCandidates.filter((candidate) => {
      const supporterA = db.supporters.find((item) => item.id === candidate.supporterAId);
      const supporterB = db.supporters.find((item) => item.id === candidate.supporterBId);
      if (!supporterA || !supporterB) return false;

      if (status !== 'all' && candidate.status !== status) return false;

      if (confidence !== 'all') {
        if (confidence === 'high' && candidate.confidenceScore < 85) return false;
        if (confidence === 'medium' && (candidate.confidenceScore < 60 || candidate.confidenceScore >= 85)) {
          return false;
        }
        if (confidence === 'low' && candidate.confidenceScore >= 60) return false;
      }

      if (riskFlags.length > 0) {
        const hasFlag = riskFlags.some((flag) => candidate.riskFlags.includes(flag));
        if (!hasFlag) return false;
      }

      if (!normalized) return true;

      const haystack = [
        supporterA.id,
        supporterA.firstName,
        supporterA.lastName,
        supporterA.email,
        supporterB.id,
        supporterB.firstName,
        supporterB.lastName,
        supporterB.email
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });
  },
  getDuplicateCandidate: (id: string): DuplicateCandidate | undefined => {
    const db = getDb();
    return db.duplicateCandidates.find((candidate) => candidate.id === id);
  },
  setCandidateStatus: (id: string, status: DuplicateCandidate['status']) => {
    const db = getDb();
    const candidate = db.duplicateCandidates.find((item) => item.id === id);
    if (!candidate) return;
    candidate.status = status;
    saveDb(db);
  },
  dismissCandidate: (id: string) => {
    const db = getDb();
    const candidate = db.duplicateCandidates.find((item) => item.id === id);
    if (!candidate) return;
    candidate.status = 'Dismissed';
    saveDb(db);
  },
  mergeCandidate: ({
    candidateId,
    primaryId,
    secondaryId,
    fieldResolutions,
    warningsShown,
    dryRunSummary
  }: {
    candidateId: string;
    primaryId: string;
    secondaryId: string;
    fieldResolutions: Record<string, string>;
    warningsShown: string[];
    dryRunSummary: string;
  }): MergeAudit | undefined => {
    const db = getDb();
    const candidate = db.duplicateCandidates.find((item) => item.id === candidateId);
    const primary = db.supporters.find((item) => item.id === primaryId);
    const secondary = db.supporters.find((item) => item.id === secondaryId);
    if (!candidate || !primary || !secondary) return undefined;

    const movedTransactions = db.transactions.filter((tx) => tx.supporterId === secondaryId);
    const movedRecurring = db.recurringPlans.filter((rp) => rp.supporterId === secondaryId);
    const movedPages = db.fundraisingPages.filter((fp) => fp.supporterId === secondaryId);

    movedTransactions.forEach((tx) => {
      tx.supporterId = primaryId;
    });
    movedRecurring.forEach((rp) => {
      rp.supporterId = primaryId;
    });
    movedPages.forEach((fp) => {
      fp.supporterId = primaryId;
    });

    secondary.status = 'Merged';
    secondary.mergedIntoId = primaryId;
    secondary.updatedAt = new Date().toISOString().slice(0, 10);
    primary.updatedAt = new Date().toISOString().slice(0, 10);

    candidate.status = 'Merged';

    const audit: MergeAudit = {
      id: `MA-${Math.floor(Math.random() * 9000) + 1000}`,
      orgId: candidate.orgId,
      mergedAt: new Date().toLocaleString(),
      mergedBy: 'C. Manuel',
      primaryId,
      secondaryId,
      movedCounts: {
        transactions: movedTransactions.length,
        recurringPlans: movedRecurring.length,
        fundraisingPages: movedPages.length
      },
      fieldResolutions,
      warningsShown,
      dryRunSummary
    };

    db.mergeAudits.unshift(audit);

    saveDb(db);
    return audit;
  },
  getMergeAudits: () => {
    const db = getDb();
    return db.mergeAudits;
  },
  getPossibleDuplicatesForSupporter: (supporterId: string) => {
    const db = getDb();
    return db.duplicateCandidates.filter(
      (candidate) =>
        candidate.status === 'Suggested' &&
        (candidate.supporterAId === supporterId || candidate.supporterBId === supporterId)
    );
  },
  getSupporterMergeHistory: (supporterId: string) => {
    const db = getDb();
    return db.mergeAudits.filter(
      (audit) => audit.primaryId === supporterId || audit.secondaryId === supporterId
    );
  },
  reset: () => {
    saveDb(seedData);
  }
};
