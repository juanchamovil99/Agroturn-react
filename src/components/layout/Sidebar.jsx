import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function Sidebar() {
  const location = useLocation();
  const { currentCompany } = useApp();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/companies', label: 'Empresas', icon: '🏢' },
    { path: '/issued-invoices', label: 'Facturas Emitidas', icon: '📤' },
    { path: '/received-invoices', label: 'Facturas Recibidas', icon: '📥' },
    { path: '/customers', label: 'Clientes', icon: '👥' },
    { path: '/suppliers', label: 'Proveedores', icon: '🏪' },
    { path: '/banking', label: 'Banca', icon: '🏦' },
    { path: '/accounting', label: 'Contabilidad', icon: '📒' },
    { path: '/reports', label: 'Informes', icon: '📈' },
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
          ContaPlus
        </h2>
        {currentCompany && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {currentCompany.name}
          </p>
        )}
      </div>

      <nav>
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
