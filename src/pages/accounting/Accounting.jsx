import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import useStore from '../../store/useStore';
import { SPANISH_CHART_OF_ACCOUNTS } from '../../config/chartOfAccounts';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Accounting.css';

const Accounting = () => {
  const { selectedCompany, accountingEntries } = useStore();

  const companyEntries = useMemo(() => {
    if (!selectedCompany) return [];
    return accountingEntries
      .filter((entry) => entry.companyId === selectedCompany.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCompany, accountingEntries]);

  if (!selectedCompany) {
    return (
      <div className="accounting-page">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Debes seleccionar una empresa para gestionar la contabilidad</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  const groupedAccounts = SPANISH_CHART_OF_ACCOUNTS.reduce((acc, account) => {
    const group = account.code[0];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(account);
    return acc;
  }, {});

  const groupNames = {
    '1': 'Financiación Básica',
    '2': 'Activo No Corriente',
    '3': 'Existencias',
    '4': 'Acreedores y Deudores',
    '5': 'Cuentas Financieras',
    '6': 'Compras y Gastos',
    '7': 'Ventas e Ingresos',
  };

  return (
    <div className="accounting-page">
      <div className="page-header">
        <div>
          <h1>Contabilidad Automática</h1>
          <p className="subtitle">{selectedCompany.name}</p>
        </div>
      </div>

      <div className="info-banner">
        <h3>🤖 Contabilidad Inteligente con IA</h3>
        <p>
          Cada factura genera automáticamente su asiento contable usando el Plan General de Contabilidad Español (PGC).
          La IA categoriza inteligentemente cada operación basándose en el contenido.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="accounting-summary">
        <div className="summary-item">
          <span className="summary-label">Total Asientos:</span>
          <span className="summary-value">{companyEntries.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ventas (Ingresos):</span>
          <span className="summary-value">
            {companyEntries.filter(e => e.type === 'income').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Compras (Gastos):</span>
          <span className="summary-value">
            {companyEntries.filter(e => e.type === 'expense').length}
          </span>
        </div>
      </div>

      {/* Accounting Entries List */}
      {companyEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No hay asientos contables</h2>
          <p>Los asientos se generan automáticamente cuando creas facturas</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Link to="/invoices/issued" className="btn btn-primary">
              Crear Factura de Venta
            </Link>
            <Link to="/invoices/received" className="btn btn-secondary">
              Añadir Factura de Gasto
            </Link>
          </div>
        </div>
      ) : (
        <div className="entries-container">
          <h2>Libro Diario (Asientos Contables)</h2>
          {companyEntries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="entry-header">
                <div>
                  <h3>{entry.description}</h3>
                  <div className="entry-meta">
                    <span className="entry-date">{formatDate(entry.date)}</span>
                    <span className={`entry-type ${entry.type}`}>
                      {entry.type === 'income' ? '💰 Ingreso' : '📥 Gasto'}
                    </span>
                    <span className="entry-category">{entry.category}</span>
                  </div>
                </div>
              </div>

              <table className="entry-table">
                <thead>
                  <tr>
                    <th>Cuenta</th>
                    <th>Descripción</th>
                    <th className="text-right">Debe</th>
                    <th className="text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line, index) => (
                    <tr key={index}>
                      <td className="account-code">{line.account}</td>
                      <td>
                        <div className="line-description">
                          <span className="account-name">{line.accountName}</span>
                          {line.description && (
                            <span className="line-detail">{line.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-right debit">
                        {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                      </td>
                      <td className="text-right credit">
                        {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr className="totals-row">
                    <td colSpan="2"><strong>Totales:</strong></td>
                    <td className="text-right">
                      <strong>
                        {formatCurrency(entry.lines.reduce((sum, l) => sum + l.debit, 0))}
                      </strong>
                    </td>
                    <td className="text-right">
                      <strong>
                        {formatCurrency(entry.lines.reduce((sum, l) => sum + l.credit, 0))}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <div className="chart-of-accounts">
        <h2>Plan General de Contabilidad</h2>

        {Object.entries(groupedAccounts).map(([group, accounts]) => (
          <div key={group} className="account-group">
            <h3 className="group-header">
              Grupo {group} - {groupNames[group]}
            </h3>
            <div className="accounts-table-container">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cuenta</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.code}>
                      <td className="account-code">{account.code}</td>
                      <td className="account-name">{account.name}</td>
                      <td className="account-category">{account.category}</td>
                      <td>
                        <span
                          className={`type-badge ${
                            account.type === 'debit' ? 'type-debit' : 'type-credit'
                          }`}
                        >
                          {account.type === 'debit' ? 'Debe' : 'Haber'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounting;
