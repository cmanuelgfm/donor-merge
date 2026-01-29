import { mockApi } from './mockApi';
import { AnalyticsEvent } from './types';

export const trackEvent = (name: AnalyticsEvent['name'], payload?: AnalyticsEvent['payload']) => {
  const event: AnalyticsEvent = {
    id: `EV-${Math.floor(Math.random() * 9000 + 1000)}`,
    name,
    createdAt: new Date().toISOString(),
    payload
  };
  void mockApi.logEvent(event);
};
