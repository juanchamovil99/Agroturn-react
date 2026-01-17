import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import ExcelImporter from '../../components/banking/ExcelImporter';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function BankingPage() {
  const { bankTransactions, currentCompany } = useApp();
  const [showImporter, setShowImporter] = useState(false);
  const [filter, setFilter] = useState('all');

  const companyTransactions = useMemo(() => {
    if (!currentCompany) return [];
    return bankTransactions.filter(t => t.companyId === currentCompany.id);
  }, [bankTransactions, currentCompany]);

  const filteredTransactions = useMemo(() => {
    return companyTransactions.filter(transaction => {
      if (filter === 'all') return true;
      if (filter === 'income') return transaction.amount > 0;
      if (filter === 'expense') return transaction.amount < 0;
      return true;
    });
  }, [companyTransactions, filter]);

  const stats = useMemo(() => {
    const income = companyTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = companyTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expenses;

    return { income, expenses, balance };
  }, [companyTransactions]);

  if (!currentCompany) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-text">Selecciona una empresa primero</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Movimientos Bancarios</h1>
        <button className="btn btn-success" onClick={() => setShowImporter(true)}>
          📊 Importar Excel
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
          <div className="stat-label">Ingresos</div>
          <div className="stat-value text-success">{formatCurrency(stats.income)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--error-color)' }}>
          <div className="stat-label">Gastos</div>
          <div className="stat-value text-error">{formatCurrency(stats.expenses)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
          <div className="stat-label">Balance</div>
          <div className="stat-value" style={{ color: stats.balance >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
            {formatCurrency(stats.balance)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transacciones</div>
          <div className="stat-value">{companyTransactions.length}</div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="flex gap-2">
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`btn ${filter === 'income' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('income')}
          >
            Ingresos
          </button>
          <button
            className={`btn ${filter === 'expense' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('expense')}
          >
            Gastos
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏦</div>
          <div className="empty-state-text">
            No hay movimientos bancarios importados
          </div>
          <button className="btn btn-success" onClick={() => setShowImporter(true)}>
            Importar desde Excel
          </button>
          <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Soportamos formatos de: Santander, BBVA, CaixaBank, Bankia, Sabadell, etc.
          </p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Referencia</th>
                <th>Importe</th>
                <th>Balance</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.description}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {transaction.reference}
                    </td>
                    <td>
                      <strong style={{
                        color: transaction.amount >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                      }}>
                        {transaction.amount >= 0 ? '+' : ''}
                        {formatCurrency(transaction.amount)}
                      </strong>
                    </td>
                    <td>{formatCurrency(transaction.balance)}</td>
                    <td>
                      {transaction.category && (
                        <span className="badge badge-info">
                          {transaction.category}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showImporter && <ExcelImporter onClose={() => setShowImporter(false)} />}
    </div>
  );
}
