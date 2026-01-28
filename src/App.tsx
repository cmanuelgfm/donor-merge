import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SupportersList from './pages/SupportersList';
import SupporterDetail from './pages/SupporterDetail';
import DuplicatesQueue from './pages/DuplicatesQueue';
import MergeWizard from './pages/MergeWizard';
import MergeHistory from './pages/MergeHistory';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/supporters" element={<SupportersList />} />
        <Route path="/supporters/duplicates" element={<DuplicatesQueue />} />
        <Route path="/supporters/merge-history" element={<MergeHistory />} />
        <Route path="/supporters/merge/:candidateId" element={<MergeWizard />} />
        <Route path="/supporters/:id" element={<SupporterDetail />} />
      </Routes>
    </Layout>
  );
};

export default App;
