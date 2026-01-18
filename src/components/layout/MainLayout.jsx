import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { selectedCompany, companies, accountingEntries } = useStore();

  // Count accounting entries for selected company
  const accountingCount = selectedCompany
    ? accountingEntries.filter(e => e.companyId === selectedCompany.id).length
    : 0;

  // Menu items configuration
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/companies', label: 'Empresas', icon: '🏢' },
    { path: '/invoices/issued', label: 'Facturas Emitidas', icon: '📝' },
    { path: '/invoices/received', label: 'Facturas Recibidas', icon: '📥' },
    { path: '/banking', label: 'Banca', icon: '🏦' },
    { path: '/accounting', label: 'Contabilidad', icon: '📚' },
    { path: '/reports', label: 'Informes', icon: '📈' },
    { path: '/settings', label: 'Configuración', icon: '⚙️' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="app-title">ContaES - Contabilidad Profesional</h1>
        </div>
        <div className="header-right">
          {selectedCompany && (
            <div className="selected-company">
              <span className="company-label">Empresa:</span>
              <span className="company-name">{selectedCompany.name}</span>
            </div>
          )}
          {!selectedCompany && companies.length > 0 && (
            <Link to="/companies" className="select-company-link">
              Seleccionar empresa
            </Link>
          )}
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.path === '/accounting' && accountingCount > 0 && (
                      <span className="nav-badge">{accountingCount}</span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
