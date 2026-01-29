export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));

export const getConfidenceLabel = (score: number) => {
  if (score >= 85) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
};

export const getConfidenceTone = (score: number) => {
  if (score >= 85) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};
