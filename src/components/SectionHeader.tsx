import { PropsWithChildren } from 'react';

type SectionHeaderProps = PropsWithChildren<{
  action?: React.ReactNode;
}>;

export const SectionHeader = ({ children, action }: SectionHeaderProps) => {
  return (
    <div className="section-header">
      <h2>{children}</h2>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
};
