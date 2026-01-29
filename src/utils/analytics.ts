type AnalyticsEvent = {
  name: string;
  payload?: Record<string, unknown>;
  createdAt: string;
};

const events: AnalyticsEvent[] = [];

export const analytics = {
  logEvent: (name: string, payload?: Record<string, unknown>) => {
    const entry = { name, payload, createdAt: new Date().toISOString() };
    events.push(entry);
    // eslint-disable-next-line no-console
    console.log('[analytics]', entry);
  },
  getEvents: () => [...events],
};
