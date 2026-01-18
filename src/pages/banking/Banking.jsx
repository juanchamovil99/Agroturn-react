import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Banking.css';

const Banking = () => {
  const { selectedCompany, bankTransactions, addBankTransactions } = useStore();
  const [importing, setImporting] = useState(false);

  const companyTransactions = useMemo(() => {
    if (!selectedCompany) return [];
    return bankTransactions
      .filter((t) => t.companyId === selectedCompany.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCompany, bankTransactions]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);

    // Simulate Excel parsing (would use XLSX library in production)
    setTimeout(() => {
      alert(
        'Importación Excel de bancos españoles:\n\n' +
          '✓ Detecta automáticamente formato (BBVA, Santander, CaixaBank, etc.)\n' +
          '✓ Extrae: Fecha, Concepto, Cargo/Abono, Saldo\n' +
          '✓ Convierte fechas y cantidades españolas\n\n' +
          'Por ahora, se generarán transacciones de ejemplo.'
      );

      // Generate sample transactions
      const sampleTransactions = [
        {
          id: `bank_${Date.now()}_1`,
          companyId: selectedCompany.id,
          date: '2024-01-15',
          concept: 'Transferencia recibida - Cliente ABC',
          amount: 1250.5,
          balance: 15250.5,
          type: 'credit',
          reconciled: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: `bank_${Date.now()}_2`,
          companyId: selectedCompany.id,
          date: '2024-01-14',
          concept: 'Pago proveedor XYZ',
          amount: -350.75,
          balance: 14000.0,
          type: 'debit',
          reconciled: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: `bank_${Date.now()}_3`,
          companyId: selectedCompany.id,
          date: '2024-01-13',
          concept: 'Nóminas empleados',
          amount: -2500.0,
          balance: 14350.75,
          type: 'debit',
          reconciled: false,
          createdAt: new Date().toISOString(),
        },
      ];

      addBankTransactions(sampleTransactions);
      setImporting(false);
    }, 1500);
  };

  if (!selectedCompany) {
    return (
      <div className="banking-page">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Debes seleccionar una empresa antes de gestionar movimientos bancarios</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  const lastTransaction = companyTransactions[0];
  const currentBalance = lastTransaction?.balance || 0;

  const totals = companyTransactions.reduce(
    (acc, t) => {
      if (t.type === 'credit') {
        acc.income += Math.abs(t.amount);
      } else {
        acc.expenses += Math.abs(t.amount);
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return (
    <div className="banking-page">
      <div className="page-header">
        <div>
          <h1>Banca</h1>
          <p className="subtitle">{selectedCompany.name}</p>
        </div>
        <div className="file-upload-container">
          <label htmlFor="excel-upload" className="btn btn-primary">
            {importing ? '⏳ Importando...' : '📊 Importar Excel'}
          </label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={importing}
          />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Saldo Actual</h3>
          <p className="summary-value">{formatCurrency(currentBalance)}</p>
          <span className="summary-label">Último movimiento</span>
        </div>
        <div className="summary-card">
          <h3>Ingresos</h3>
          <p className="summary-value green">+{formatCurrency(totals.income)}</p>
          <span className="summary-label">Total entradas</span>
        </div>
        <div className="summary-card">
          <h3>Gastos</h3>
          <p className="summary-value orange">-{formatCurrency(totals.expenses)}</p>
          <span className="summary-label">Total salidas</span>
        </div>
      </div>

      <div className="info-box">
        <h3>📋 Formatos Soportados</h3>
        <p>
          El sistema detecta automáticamente extractos bancarios de:
          <strong> BBVA, Santander, CaixaBank, Bankia, Sabadell, ING</strong> y otros
          bancos españoles.
        </p>
        <p>Formatos: Excel (.xlsx, .xls) o CSV</p>
      </div>

      {companyTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h2>No hay movimientos bancarios</h2>
          <p>Importa un extracto bancario de tu banco español en formato Excel o CSV</p>
          <label htmlFor="excel-upload-empty" className="btn btn-primary">
            Importar Extracto Bancario
          </label>
          <input
            id="excel-upload-empty"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="transactions-container">
          <h2>Movimientos</h2>
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th className="text-right">Importe</th>
                  <th className="text-right">Saldo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {companyTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td className="concept-cell">{transaction.concept}</td>
                    <td
                      className={`text-right amount-cell ${
                        transaction.type === 'credit' ? 'positive' : 'negative'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td className="text-right">{formatCurrency(transaction.balance)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          transaction.reconciled ? 'status-reconciled' : 'status-pending'
                        }`}
                      >
                        {transaction.reconciled ? 'Conciliado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banking;
