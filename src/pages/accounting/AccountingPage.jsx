import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CHART_OF_ACCOUNTS, PGC_GROUPS } from '../../data/pgc-spain';
import AccountingEntryForm from '../../components/accounting/AccountingEntryForm';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AccountingPage() {
  const { accountingEntries, currentCompany } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');

  const companyEntries = useMemo(() => {
    if (!currentCompany) return [];
    return accountingEntries.filter(e => e.companyId === currentCompany.id);
  }, [accountingEntries, currentCompany]);

  const filteredEntries = useMemo(() => {
    if (selectedGroup === 'all') return companyEntries;
    return companyEntries.filter(entry =>
      entry.lines.some(line => {
        const account = CHART_OF_ACCOUNTS.find(a => a.code === line.account);
        return account && account.group === parseInt(selectedGroup);
      })
    );
  }, [companyEntries, selectedGroup]);

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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Contabilidad (PGC España)</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nuevo Asiento
        </button>
      </div>

      <div className="card mb-3">
        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Plan General Contable</h3>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${selectedGroup === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedGroup('all')}
          >
            Todos
          </button>
          {Object.entries(PGC_GROUPS).map(([group, name]) => (
            <button
              key={group}
              className={`btn btn-sm ${selectedGroup === group ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedGroup(group)}
              title={name}
            >
              Grupo {group}: {name}
            </button>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📒</div>
          <div className="empty-state-text">No hay asientos contables registrados</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear primer asiento
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Número</th>
                <th>Descripción</th>
                <th>Debe</th>
                <th>Haber</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((entry) => {
                  const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
                  const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

                  return (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td><strong>{entry.number}</strong></td>
                      <td>
                        <div>{entry.description}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {entry.lines.map((line, i) => {
                            const account = CHART_OF_ACCOUNTS.find(a => a.code === line.account);
                            return (
                              <div key={i}>
                                {line.account} - {account?.name || 'Cuenta'}:{' '}
                                {line.debit > 0 ? formatCurrency(line.debit) : formatCurrency(line.credit)}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td><strong>{formatCurrency(totalDebit)}</strong></td>
                      <td><strong>{formatCurrency(totalCredit)}</strong></td>
                      <td>
                        <span className={`badge ${
                          Math.abs(totalDebit - totalCredit) < 0.01 ? 'badge-success' : 'badge-error'
                        }`}>
                          {Math.abs(totalDebit - totalCredit) < 0.01 ? '✓ Cuadrado' : '⚠️ Descuadrado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <AccountingEntryForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
