import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SupportersList } from './pages/SupportersList';
import { SupporterDetail } from './pages/SupporterDetail';
import { DuplicatesQueue } from './pages/DuplicatesQueue';
import { MergeWizard } from './pages/MergeWizard';
import { MergeHistory } from './pages/MergeHistory';
import { Placeholder } from './pages/Placeholder';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="supporters" element={<SupportersList />} />
        <Route path="supporters/duplicates" element={<DuplicatesQueue />} />
        <Route path="supporters/merge-history" element={<MergeHistory />} />
        <Route path="supporters/:id" element={<SupporterDetail />} />
        <Route path="supporters/merge/:candidateId" element={<MergeWizard />} />
        <Route
          path="transactions"
          element={<Placeholder title="Transactions" description="Transaction tools coming soon." />}
        />
        <Route
          path="fundraising"
          element={<Placeholder title="Fundraising" description="Fundraising tools coming soon." />}
        />
        <Route
          path="reports"
          element={<Placeholder title="Reports" description="Reporting tools coming soon." />}
        />
        <Route
          path="administration"
          element={<Placeholder title="Administration" description="Admin tools coming soon." />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
