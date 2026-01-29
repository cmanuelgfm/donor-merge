import { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card = ({ className = '', children }: CardProps) => {
  return <div className={`card ${className}`}>{children}</div>;
};
