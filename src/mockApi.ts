import { seedData } from './data/seed';
import {
  AnalyticsEvent,
  AppData,
  DuplicateCandidate,
  FundraisingPage,
  MergeAudit,
  RecurringPlan,
  Supporter,
  Transaction
} from './types';

const STORAGE_KEY = 'gfp-merge-prototype-data';

const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored) as AppData;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
};

const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const computeTotals = (
  items: Array<{ supporterId: string; amount?: number; totalRaised?: number; totalDonated?: number }>,
  supporterId: string,
  field: 'amount' | 'totalRaised' | 'totalDonated'
) => {
  return items
    .filter((item) => item.supporterId === supporterId)
    .reduce((sum, item) => sum + (item[field] ?? 0), 0);
};

export const mockApi = {
  async getData(): Promise<AppData> {
    await wait();
    return loadData();
  },
  async getSupporters(): Promise<Supporter[]> {
    await wait();
    return loadData().supporters;
  },
  async getSupporter(id: string): Promise<Supporter | undefined> {
    await wait();
    return loadData().supporters.find((supporter) => supporter.id === id);
  },
  async getSupporterRelated(id: string): Promise<{
    transactions: Transaction[];
    recurringPlans: RecurringPlan[];
    fundraisingPages: FundraisingPage[];
  }> {
    await wait();
    const data = loadData();
    return {
      transactions: data.transactions.filter((item) => item.supporterId === id),
      recurringPlans: data.recurringPlans.filter((item) => item.supporterId === id),
      fundraisingPages: data.fundraisingPages.filter((item) => item.supporterId === id)
    };
  },
  async getDuplicateCandidates(): Promise<DuplicateCandidate[]> {
    await wait();
    return loadData().duplicateCandidates;
  },
  async updateCandidate(candidate: DuplicateCandidate): Promise<void> {
    await wait();
    const data = loadData();
    data.duplicateCandidates = data.duplicateCandidates.map((item) =>
      item.id === candidate.id ? candidate : item
    );
    saveData(data);
  },
  async bulkDismiss(candidateIds: string[]): Promise<void> {
    await wait();
    const data = loadData();
    data.duplicateCandidates = data.duplicateCandidates.map((candidate) =>
      candidateIds.includes(candidate.id)
        ? { ...candidate, status: 'Dismissed' }
        : candidate
    );
    saveData(data);
  },
  async mergeSupporters(options: {
    candidateId: string;
    primaryId: string;
    secondaryId: string;
    fieldResolutions: Record<string, string>;
    warnings: string[];
    dryRunSummary: string;
    mergedBy: string;
  }): Promise<MergeAudit> {
    await wait();
    const data = loadData();
    const candidate = data.duplicateCandidates.find((item) => item.id === options.candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const transactionsToMove = data.transactions.filter(
      (item) => item.supporterId === options.secondaryId
    );
    const plansToMove = data.recurringPlans.filter(
      (item) => item.supporterId === options.secondaryId
    );
    const pagesToMove = data.fundraisingPages.filter(
      (item) => item.supporterId === options.secondaryId
    );

    data.transactions = data.transactions.map((item) =>
      item.supporterId === options.secondaryId
        ? { ...item, supporterId: options.primaryId }
        : item
    );

    data.recurringPlans = data.recurringPlans.map((item) =>
      item.supporterId === options.secondaryId
        ? { ...item, supporterId: options.primaryId }
        : item
    );

    data.fundraisingPages = data.fundraisingPages.map((item) =>
      item.supporterId === options.secondaryId
        ? { ...item, supporterId: options.primaryId }
        : item
    );

    data.supporters = data.supporters.map((supporter) =>
      supporter.id === options.secondaryId
        ? { ...supporter, mergedIntoId: options.primaryId, updatedAt: new Date().toISOString() }
        : supporter
    );

    data.duplicateCandidates = data.duplicateCandidates.map((item) =>
      item.id === candidate.id
        ? { ...item, status: 'Merged' }
        : item
    );

    const audit: MergeAudit = {
      id: `MA-${Math.floor(Math.random() * 9000 + 1000)}`,
      orgId: candidate.orgId,
      mergedAt: new Date().toISOString(),
      mergedBy: options.mergedBy,
      primaryId: options.primaryId,
      secondaryId: options.secondaryId,
      movedCounts: {
        transactions: transactionsToMove.length,
        recurringPlans: plansToMove.length,
        fundraisingPages: pagesToMove.length
      },
      fieldResolutions: options.fieldResolutions,
      warningsShown: options.warnings,
      dryRunSummary: options.dryRunSummary
    };

    data.mergeAudits = [audit, ...data.mergeAudits];

    saveData(data);
    return audit;
  },
  async getMergeAudits(): Promise<MergeAudit[]> {
    await wait();
    return loadData().mergeAudits;
  },
  async logEvent(event: AnalyticsEvent): Promise<void> {
    const data = loadData();
    data.analyticsEvents = [event, ...data.analyticsEvents];
    saveData(data);
    console.info('[analytics]', event.name, event.payload ?? {});
  },
  async getMetricsForSupporter(id: string): Promise<{
    transactionsCount: number;
    recurringPlansCount: number;
    fundraisingPagesCount: number;
    transactionsTotal: number;
    recurringTotal: number;
    fundraisingTotal: number;
  }> {
    await wait();
    const data = loadData();
    return {
      transactionsCount: data.transactions.filter((item) => item.supporterId === id).length,
      recurringPlansCount: data.recurringPlans.filter((item) => item.supporterId === id).length,
      fundraisingPagesCount: data.fundraisingPages.filter((item) => item.supporterId === id).length,
      transactionsTotal: computeTotals(data.transactions, id, 'amount'),
      recurringTotal: computeTotals(data.recurringPlans, id, 'totalDonated'),
      fundraisingTotal: computeTotals(data.fundraisingPages, id, 'totalRaised')
    };
  }
};
