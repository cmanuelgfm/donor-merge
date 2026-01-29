import { Card } from '../components/Card';

type PlaceholderProps = {
  title: string;
  description: string;
};

export const Placeholder = ({ title, description }: PlaceholderProps) => {
  return (
    <div className="page">
      <Card>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </Card>
    </div>
  );
};
