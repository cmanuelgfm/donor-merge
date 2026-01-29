import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import SupportersListPage from './pages/SupportersListPage';
import SupporterDetailPage from './pages/SupporterDetailPage';
import DuplicatesQueuePage from './pages/DuplicatesQueuePage';
import MergeWizardPage from './pages/MergeWizardPage';
import MergeHistoryPage from './pages/MergeHistoryPage';
import PlaceholderPage from './pages/PlaceholderPage';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/supporters" element={<SupportersListPage />} />
        <Route path="/supporters/duplicates" element={<DuplicatesQueuePage />} />
        <Route path="/supporters/merge-history" element={<MergeHistoryPage />} />
        <Route path="/supporters/merge/:candidateId" element={<MergeWizardPage />} />
        <Route path="/supporters/:id" element={<SupporterDetailPage />} />
        <Route path="/transactions" element={<PlaceholderPage title="Transactions" />} />
        <Route path="/fundraising" element={<PlaceholderPage title="Fundraising" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/administration" element={<PlaceholderPage title="Administration" />} />
        <Route path="*" element={<PlaceholderPage title="Not Found" />} />
      </Routes>
    </Layout>
  );
};

export default App;
