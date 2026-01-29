import { seedData } from './seed';
import {
  DataStore,
  DuplicateCandidate,
  FundraisingPage,
  MergeAudit,
  RecurringPlan,
  Supporter,
  Transaction,
} from './types';

const STORAGE_KEY = 'gfm-supporter-merge-data';

const loadStore = (): DataStore => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    return JSON.parse(raw) as DataStore;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
};

const saveStore = (store: DataStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const ensureCounts = (store: DataStore) => {
  store.supporters = store.supporters.map((supporter) => {
    const transactionsCount = store.transactions.filter(
      (item) => item.supporterId === supporter.id,
    ).length;
    const recurringPlansCount = store.recurringPlans.filter(
      (item) => item.supporterId === supporter.id,
    ).length;
    const fundraisingPagesCount = store.fundraisingPages.filter(
      (item) => item.supporterId === supporter.id,
    ).length;
    return {
      ...supporter,
      transactionsCount,
      recurringPlansCount,
      fundraisingPagesCount,
    };
  });
};

export const mockApi = {
  getStore: (): DataStore => {
    const store = loadStore();
    ensureCounts(store);
    return store;
  },
  getSupporters: (): Supporter[] => {
    const store = loadStore();
    ensureCounts(store);
    return store.supporters;
  },
  getSupporter: (id: string): Supporter | undefined => {
    const store = loadStore();
    ensureCounts(store);
    return store.supporters.find((supporter) => supporter.id === id);
  },
  getTransactions: (supporterId: string): Transaction[] => {
    const store = loadStore();
    return store.transactions.filter((item) => item.supporterId === supporterId);
  },
  getRecurringPlans: (supporterId: string): RecurringPlan[] => {
    const store = loadStore();
    return store.recurringPlans.filter((item) => item.supporterId === supporterId);
  },
  getFundraisingPages: (supporterId: string): FundraisingPage[] => {
    const store = loadStore();
    return store.fundraisingPages.filter((item) => item.supporterId === supporterId);
  },
  getDuplicateCandidates: (): DuplicateCandidate[] => {
    const store = loadStore();
    return store.duplicateCandidates;
  },
  updateCandidateStatus: (candidateId: string, status: DuplicateCandidate['status']) => {
    const store = loadStore();
    store.duplicateCandidates = store.duplicateCandidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, status } : candidate,
    );
    saveStore(store);
  },
  mergeCandidate: (
    candidateId: string,
    primaryId: string,
    secondaryId: string,
    fieldResolutions: Record<string, string>,
    warningsShown: string[],
  ): MergeAudit => {
    const store = loadStore();
    const now = new Date().toISOString();
    const movedTransactions = store.transactions.filter(
      (item) => item.supporterId === secondaryId,
    ).length;
    const movedRecurring = store.recurringPlans.filter(
      (item) => item.supporterId === secondaryId,
    ).length;
    const movedPages = store.fundraisingPages.filter(
      (item) => item.supporterId === secondaryId,
    ).length;

    store.transactions = store.transactions.map((item) =>
      item.supporterId === secondaryId ? { ...item, supporterId: primaryId } : item,
    );
    store.recurringPlans = store.recurringPlans.map((item) =>
      item.supporterId === secondaryId ? { ...item, supporterId: primaryId } : item,
    );
    store.fundraisingPages = store.fundraisingPages.map((item) =>
      item.supporterId === secondaryId ? { ...item, supporterId: primaryId } : item,
    );

    store.supporters = store.supporters.map((supporter) => {
      if (supporter.id === primaryId) {
        return {
          ...supporter,
          firstName: fieldResolutions.firstName || supporter.firstName,
          lastName: fieldResolutions.lastName || supporter.lastName,
          email: fieldResolutions.email || supporter.email,
          phone: fieldResolutions.phone || supporter.phone,
          address: fieldResolutions.address || supporter.address,
          communicationPrefs: {
            optIn:
              fieldResolutions.communicationPrefs === 'true'
                ? true
                : fieldResolutions.communicationPrefs === 'false'
                  ? false
                  : supporter.communicationPrefs.optIn,
          },
          updatedAt: now,
        };
      }
      if (supporter.id === secondaryId) {
        return {
          ...supporter,
          status: 'Merged',
          mergedIntoId: primaryId,
          updatedAt: now,
        };
      }
      return supporter;
    });

    const audit: MergeAudit = {
      id: `MA-${Math.floor(Math.random() * 9000 + 1000)}`,
      orgId: 'ORG-001',
      mergedAt: now,
      mergedBy: 'Colin Manuel',
      primaryId,
      secondaryId,
      movedCounts: {
        transactions: movedTransactions,
        recurringPlans: movedRecurring,
        fundraisingPages: movedPages,
      },
      fieldResolutions,
      warningsShown,
      dryRunSummary:
        'Transactions, recurring plans, and fundraising pages will move to the primary record. Secondary will redirect.',
    };

    store.mergeAudits = [audit, ...store.mergeAudits];
    store.duplicateCandidates = store.duplicateCandidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, status: 'Merged' } : candidate,
    );
    ensureCounts(store);
    saveStore(store);
    return audit;
  },
  getMergeAudits: (): MergeAudit[] => {
    const store = loadStore();
    return store.mergeAudits;
  },
  downloadExceptionCsv: (candidateId: string, reason: string) => {
    const csv = `candidateId,reason\n${candidateId},"${reason}"\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merge-exceptions.csv';
    link.click();
    URL.revokeObjectURL(url);
  },
  reset: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  },
};
