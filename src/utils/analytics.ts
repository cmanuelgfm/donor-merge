import { seedData } from '../data/seed';
import { AppData } from '../types';

const STORAGE_KEY = 'gfm-prototype-data';

const getData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(stored) as AppData;
};

export const logEvent = (name: string, payload?: Record<string, unknown>) => {
  const data = getData();
  data.analyticsEvents.push({ name, payload, createdAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // eslint-disable-next-line no-console
  console.info(`[analytics] ${name}`, payload ?? {});
};
