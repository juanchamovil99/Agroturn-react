import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import './Dashboard.css';

const Dashboard = () => {
  const {
    selectedCompany,
    companies,
    issuedInvoices,
    receivedInvoices,
    bankTransactions,
  } = useStore();

  const stats = useMemo(() => {
    const companyInvoices = selectedCompany
      ? issuedInvoices.filter(inv => inv.companyId === selectedCompany.id)
      : issuedInvoices;

    const companyReceivedInvoices = selectedCompany
      ? receivedInvoices.filter(inv => inv.companyId === selectedCompany.id)
      : receivedInvoices;

    const totalIssued = companyInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalReceived = companyReceivedInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    const pendingIssued = companyInvoices
      .filter(inv => inv.status === 'pending' || inv.status === 'sent')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const pendingReceived = companyReceivedInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const companyTransactions = selectedCompany
      ? bankTransactions.filter(t => t.companyId === selectedCompany.id)
      : bankTransactions;

    const lastTransaction = companyTransactions.length > 0
      ? companyTransactions[companyTransactions.length - 1]
      : null;

    return {
      totalIssued,
      totalReceived,
      pendingIssued,
      pendingReceived,
      balance: totalIssued - totalReceived,
      bankBalance: lastTransaction?.balance || 0,
      issuedCount: companyInvoices.length,
      receivedCount: companyReceivedInvoices.length,
    };
  }, [selectedCompany, issuedInvoices, receivedInvoices, bankTransactions]);

  if (companies.length === 0) {
    return (
      <div className="dashboard">
        <div className="welcome-card">
          <h2>Bienvenido a ContaES</h2>
          <p>Tu solución profesional de contabilidad para empresas españolas</p>
          <div className="welcome-actions">
            <Link to="/companies" className="btn btn-primary">
              Crear tu primera empresa
            </Link>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📝</span>
              <h3>Facturación</h3>
              <p>Emite y gestiona facturas con plantillas personalizadas</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📥</span>
              <h3>Recepción de Facturas</h3>
              <p>Escanea PDFs de proveedores automáticamente</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏦</span>
              <h3>Importación Bancaria</h3>
              <p>Importa extractos de bancos españoles en Excel</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Informes</h3>
              <p>Genera informes contables y fiscales</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="dashboard">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Por favor, selecciona una empresa para ver el dashboard</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard - {selectedCompany.name}</h1>
        <p className="company-nif">NIF: {selectedCompany.nif}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Facturado</h3>
            <p className="stat-value">{formatCurrency(stats.totalIssued)}</p>
            <span className="stat-label">{stats.issuedCount} facturas</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pendiente de Cobro</h3>
            <p className="stat-value">{formatCurrency(stats.pendingIssued)}</p>
            <span className="stat-label">Por cobrar</span>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">📥</div>
          <div className="stat-content">
            <h3>Gastos</h3>
            <p className="stat-value">{formatCurrency(stats.totalReceived)}</p>
            <span className="stat-label">{stats.receivedCount} facturas</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Pendiente de Pago</h3>
            <p className="stat-value">{formatCurrency(stats.pendingReceived)}</p>
            <span className="stat-label">Por pagar</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Balance</h3>
            <p className="stat-value">{formatCurrency(stats.balance)}</p>
            <span className="stat-label">Resultado</span>
          </div>
        </div>

        <div className="stat-card stat-accent">
          <div className="stat-icon">🏦</div>
          <div className="stat-content">
            <h3>Saldo Bancario</h3>
            <p className="stat-value">{formatCurrency(stats.bankBalance)}</p>
            <span className="stat-label">Último movimiento</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <Link to="/invoices/issued" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Nueva Factura</h3>
            <p>Emitir factura de venta</p>
          </Link>
          <Link to="/invoices/received" className="action-card">
            <span className="action-icon">📥</span>
            <h3>Registrar Gasto</h3>
            <p>Añadir factura de proveedor</p>
          </Link>
          <Link to="/banking" className="action-card">
            <span className="action-icon">🏦</span>
            <h3>Importar Banco</h3>
            <p>Cargar extracto bancario</p>
          </Link>
          <Link to="/reports" className="action-card">
            <span className="action-icon">📊</span>
            <h3>Ver Informes</h3>
            <p>Consultar reportes</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Actividad Reciente</h2>
        {stats.issuedCount === 0 && stats.receivedCount === 0 ? (
          <div className="empty-state">
            <p>No hay actividad reciente</p>
            <Link to="/invoices/issued" className="btn btn-primary">
              Crear primera factura
            </Link>
          </div>
        ) : (
          <div className="activity-list">
            <p>Últimas facturas y movimientos aparecerán aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
