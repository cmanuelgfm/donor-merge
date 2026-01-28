import { seedData } from './seed';
import {
  AppData,
  DuplicateCandidate,
  FundraisingPage,
  MergeAudit,
  RecurringPlan,
  Supporter,
  Transaction
} from '../types';
import { logEvent } from '../utils/analytics';

const STORAGE_KEY = 'gfm-prototype-data';

const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(stored) as AppData;
};

const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const withData = <T>(handler: (data: AppData) => T): T => {
  const data = loadData();
  const result = handler(data);
  saveData(data);
  return result;
};

export const mockApi = {
  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  },
  getDashboardSummary() {
    const data = loadData();
    const openDuplicates = data.duplicateCandidates.filter((candidate) => candidate.status === 'Suggested');
    return {
      duplicatesCount: openDuplicates.length,
      supportersCount: data.supporters.filter((supporter) => supporter.status === 'Active').length
    };
  },
  listSupporters(search = ''): Supporter[] {
    const data = loadData();
    const query = search.toLowerCase();
    return data.supporters.filter((supporter) => {
      if (supporter.status !== 'Active') return false;
      if (!query) return true;
      return (
        supporter.id.toLowerCase().includes(query) ||
        supporter.firstName.toLowerCase().includes(query) ||
        supporter.lastName.toLowerCase().includes(query) ||
        supporter.email.toLowerCase().includes(query)
      );
    });
  },
  getSupporter(id: string): Supporter | undefined {
    return loadData().supporters.find((supporter) => supporter.id === id);
  },
  listTransactionsBySupporter(id: string): Transaction[] {
    return loadData().transactions.filter((transaction) => transaction.supporterId === id);
  },
  listRecurringPlansBySupporter(id: string): RecurringPlan[] {
    return loadData().recurringPlans.filter((plan) => plan.supporterId === id);
  },
  listFundraisingPagesBySupporter(id: string): FundraisingPage[] {
    return loadData().fundraisingPages.filter((page) => page.supporterId === id);
  },
  listDuplicateCandidates(filters?: {
    confidence?: string;
    status?: string;
    riskFlag?: string;
    search?: string;
  }): DuplicateCandidate[] {
    const data = loadData();
    const query = filters?.search?.toLowerCase() ?? '';
    return data.duplicateCandidates.filter((candidate) => {
      if (filters?.status && candidate.status !== filters.status) return false;
      if (filters?.confidence === 'high' && candidate.confidenceScore < 85) return false;
      if (filters?.confidence === 'medium' && (candidate.confidenceScore < 60 || candidate.confidenceScore >= 85)) return false;
      if (filters?.confidence === 'low' && candidate.confidenceScore >= 60) return false;
      if (filters?.riskFlag && !candidate.riskFlags.includes(filters.riskFlag)) return false;
      if (!query) return true;
      const supporterA = data.supporters.find((supporter) => supporter.id === candidate.supporterAId);
      const supporterB = data.supporters.find((supporter) => supporter.id === candidate.supporterBId);
      const haystack = `${supporterA?.id ?? ''} ${supporterA?.firstName ?? ''} ${supporterA?.lastName ?? ''} ${supporterA?.email ?? ''} ${supporterB?.id ?? ''} ${supporterB?.firstName ?? ''} ${supporterB?.lastName ?? ''} ${supporterB?.email ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  },
  getDuplicateCandidate(id: string): DuplicateCandidate | undefined {
    return loadData().duplicateCandidates.find((candidate) => candidate.id === id);
  },
  updateCandidateStatus(id: string, status: DuplicateCandidate['status']) {
    return withData((data) => {
      const candidate = data.duplicateCandidates.find((item) => item.id === id);
      if (!candidate) return undefined;
      candidate.status = status;
      return candidate;
    });
  },
  bulkDismiss(ids: string[]) {
    return withData((data) => {
      data.duplicateCandidates.forEach((candidate) => {
        if (ids.includes(candidate.id)) {
          candidate.status = 'Dismissed';
        }
      });
      logEvent('merge_dismissed', { ids });
      return true;
    });
  },
  bulkReview(ids: string[]) {
    logEvent('duplicate_review_opened', { ids });
    return ids[0];
  },
  runMerge(params: {
    candidateId: string;
    primaryId: string;
    secondaryId: string;
    fieldResolutions: Record<string, string>;
    warningsShown: string[];
  }): MergeAudit | undefined {
    return withData((data) => {
      const candidate = data.duplicateCandidates.find((item) => item.id === params.candidateId);
      const primary = data.supporters.find((supporter) => supporter.id === params.primaryId);
      const secondary = data.supporters.find((supporter) => supporter.id === params.secondaryId);
      if (!candidate || !primary || !secondary) return undefined;

      const secondaryTransactions = data.transactions.filter((transaction) => transaction.supporterId === secondary.id);
      const secondaryRecurring = data.recurringPlans.filter((plan) => plan.supporterId === secondary.id);
      const secondaryPages = data.fundraisingPages.filter((page) => page.supporterId === secondary.id);

      data.transactions.forEach((transaction) => {
        if (transaction.supporterId === secondary.id) transaction.supporterId = primary.id;
      });
      data.recurringPlans.forEach((plan) => {
        if (plan.supporterId === secondary.id) plan.supporterId = primary.id;
      });
      data.fundraisingPages.forEach((page) => {
        if (page.supporterId === secondary.id) page.supporterId = primary.id;
      });

      primary.transactionsCount += secondary.transactionsCount;
      primary.transactionsTotal += secondary.transactionsTotal;
      primary.recurringPlansCount += secondary.recurringPlansCount;
      primary.recurringTotal += secondary.recurringTotal;
      primary.fundraisingPagesCount += secondary.fundraisingPagesCount;
      primary.fundraisingTotal += secondary.fundraisingTotal;
      primary.updatedAt = new Date().toISOString();

      secondary.status = 'Merged';
      secondary.mergedIntoId = primary.id;

      candidate.status = 'Merged';

      const audit: MergeAudit = {
        id: `MA-${Date.now()}`,
        orgId: candidate.orgId,
        mergedAt: new Date().toISOString(),
        mergedBy: 'Alex Admin',
        primaryId: primary.id,
        secondaryId: secondary.id,
        movedCounts: {
          transactions: secondaryTransactions.length,
          recurringPlans: secondaryRecurring.length,
          fundraisingPages: secondaryPages.length
        },
        fieldResolutions: params.fieldResolutions,
        warningsShown: params.warningsShown,
        dryRunSummary: `Moved ${secondaryTransactions.length} transactions, ${secondaryRecurring.length} recurring plans, and ${secondaryPages.length} fundraising pages into ${primary.id}. Secondary supporter will redirect.`
      };

      data.mergeAudits.unshift(audit);
      logEvent('merge_confirmed', { candidateId: candidate.id, primaryId: primary.id, secondaryId: secondary.id });
      return audit;
    });
  },
  listMergeAudits(filters?: { supporterId?: string }) {
    const data = loadData();
    if (!filters?.supporterId) return data.mergeAudits;
    return data.mergeAudits.filter(
      (audit) => audit.primaryId === filters.supporterId || audit.secondaryId === filters.supporterId
    );
  },
  logEvent,
  loadData
};
