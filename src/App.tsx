import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import CalculatorPage from '@/pages/Calculator';
import Blueprint from '@/pages/Blueprint';
import Progress from '@/pages/Progress';
import CitiesPage from '@/pages/Cities';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/blueprint" element={<Blueprint />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/cities" element={<CitiesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
