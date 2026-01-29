import { PropsWithChildren } from 'react';

type BadgeProps = PropsWithChildren<{
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}>;

export const Badge = ({ variant = 'neutral', children }: BadgeProps) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
