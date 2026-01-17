import { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const {
    currentCompany,
    issuedInvoices,
    receivedInvoices,
    bankTransactions,
    accountingEntries,
    customers,
    suppliers
  } = useApp();

  const stats = useMemo(() => {
    if (!currentCompany) {
      return {
        totalInvoiced: 0,
        totalExpenses: 0,
        pendingIncome: 0,
        pendingExpenses: 0,
        bankBalance: 0,
        customersCount: 0,
        suppliersCount: 0,
        accountingEntriesCount: 0
      };
    }

    const companyIssuedInvoices = issuedInvoices.filter(inv => inv.companyId === currentCompany.id);
    const companyReceivedInvoices = receivedInvoices.filter(inv => inv.companyId === currentCompany.id);
    const companyBankTransactions = bankTransactions.filter(t => t.companyId === currentCompany.id);
    const companyAccountingEntries = accountingEntries.filter(e => e.companyId === currentCompany.id);
    const companyCustomers = customers.filter(c => c.companyId === currentCompany.id);
    const companySuppliers = suppliers.filter(s => s.companyId === currentCompany.id);

    const totalInvoiced = companyIssuedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = companyReceivedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingIncome = companyIssuedInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingExpenses = companyReceivedInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);

    const bankIncome = companyBankTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const bankExpenses = companyBankTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const bankBalance = bankIncome - bankExpenses;

    return {
      totalInvoiced,
      totalExpenses,
      pendingIncome,
      pendingExpenses,
      bankBalance,
      customersCount: companyCustomers.length,
      suppliersCount: companySuppliers.length,
      accountingEntriesCount: companyAccountingEntries.length
    };
  }, [currentCompany, issuedInvoices, receivedInvoices, bankTransactions, accountingEntries, customers, suppliers]);

  if (!currentCompany) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <div className="empty-state-text">
            Bienvenido a ContaPlus
          </div>
          <p style={{ marginTop: '16px', fontSize: '16px', color: 'var(--text-secondary)' }}>
            Para comenzar, crea tu primera empresa
          </p>
          <Link to="/companies" className="btn btn-primary mt-3">
            ➕ Crear Empresa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        Dashboard - {currentCompany.name}
      </h1>

      {/* Financial Stats */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
        Resumen Financiero
      </h2>
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
          <div className="stat-label">Facturación Total</div>
          <div className="stat-value text-success">{formatCurrency(stats.totalInvoiced)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--error-color)' }}>
          <div className="stat-label">Gastos Totales</div>
          <div className="stat-value text-error">{formatCurrency(stats.totalExpenses)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
          <div className="stat-label">Pendiente de Cobro</div>
          <div className="stat-value text-warning">{formatCurrency(stats.pendingIncome)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
          <div className="stat-label">Balance Bancario</div>
          <div className="stat-value" style={{ color: stats.bankBalance >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
            {formatCurrency(stats.bankBalance)}
          </div>
        </div>
      </div>

      {/* Business Stats */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>
        Datos del Negocio
      </h2>
      <div className="stats-grid">
        <Link to="/customers" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-label">Clientes</div>
            <div className="stat-value">{stats.customersCount}</div>
          </div>
        </Link>
        <Link to="/suppliers" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-label">Proveedores</div>
            <div className="stat-value">{stats.suppliersCount}</div>
          </div>
        </Link>
        <Link to="/accounting" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-label">Asientos Contables</div>
            <div className="stat-value">{stats.accountingEntriesCount}</div>
          </div>
        </Link>
        <div className="stat-card">
          <div className="stat-label">Margen Bruto</div>
          <div className="stat-value" style={{ color: 'var(--primary-color)' }}>
            {formatCurrency(stats.totalInvoiced - stats.totalExpenses)}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>
        Acciones Rápidas
      </h2>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Link to="/issued-invoices" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            📤 Nueva Factura Emitida
          </Link>
          <Link to="/received-invoices" className="btn btn-success" style={{ textDecoration: 'none' }}>
            📥 Registrar Gasto
          </Link>
          <Link to="/banking" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            🏦 Importar Banco
          </Link>
          <Link to="/accounting" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            📒 Nuevo Asiento
          </Link>
        </div>
      </div>

      {/* Features Overview */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>
        Características de ContaPlus
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>✅ Gestión Completa</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <li>Múltiples empresas (SL)</li>
            <li>Plantillas de factura personalizables</li>
            <li>Clientes y proveedores</li>
            <li>Control de cobros y pagos</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🤖 Automatización</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <li>Escaneo OCR de facturas PDF</li>
            <li>Importación Excel de bancos españoles</li>
            <li>Cálculos automáticos de IVA e IRPF</li>
            <li>Generación de asientos contables</li>
          </ul>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>📊 Contabilidad Española</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <li>Plan General Contable (PGC 2007)</li>
            <li>Tipos de IVA españoles (21%, 10%, 4%)</li>
            <li>Retenciones IRPF</li>
            <li>Asientos con validación debe/haber</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
