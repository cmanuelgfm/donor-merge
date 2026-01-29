const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div>
      <div className="page-title">{title}</div>
      <div className="page-subtitle">This section is part of the broader GoFundMe Pro surface.</div>
      <div className="card">
        <p className="muted">Prototype view only. Navigate to Supporters to explore the merge workflow.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
