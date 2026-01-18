import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Companies from './pages/companies/Companies';
import IssuedInvoices from './pages/invoices/IssuedInvoices';
import ReceivedInvoices from './pages/invoices/ReceivedInvoices';
import Banking from './pages/banking/Banking';
import Accounting from './pages/accounting/Accounting';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="invoices/issued" element={<IssuedInvoices />} />
          <Route path="invoices/received" element={<ReceivedInvoices />} />
          <Route path="banking" element={<Banking />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
