import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/dashboard/DashboardPage';
import CompaniesPage from './pages/companies/CompaniesPage';
import IssuedInvoicesPage from './pages/invoices/IssuedInvoicesPage';
import ReceivedInvoicesPage from './pages/invoices/ReceivedInvoicesPage';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import BankingPage from './pages/banking/BankingPage';
import AccountingPage from './pages/accounting/AccountingPage';
import ReportsPage from './pages/reports/ReportsPage';
import './styles/global.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header />
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/issued-invoices" element={<IssuedInvoicesPage />} />
              <Route path="/received-invoices" element={<ReceivedInvoicesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/banking" element={<BankingPage />} />
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
