interface AnalyticsEvent {
  name: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

const events: AnalyticsEvent[] = [];

export const logEvent = (name: string, payload?: Record<string, unknown>) => {
  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    payload
  };
  events.push(event);
  // eslint-disable-next-line no-console
  console.log('[analytics]', event);
};

export const getEvents = () => events;
