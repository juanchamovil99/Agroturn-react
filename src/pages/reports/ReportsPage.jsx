import { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, getCurrentFiscalYear, exportToCSV } from '../../utils/helpers';
import { CHART_OF_ACCOUNTS } from '../../data/pgc-spain';

export default function ReportsPage() {
  const {
    currentCompany,
    issuedInvoices,
    receivedInvoices,
    accountingEntries
  } = useApp();

  const [selectedYear, setSelectedYear] = useState(getCurrentFiscalYear());
  const [reportType, setReportType] = useState('profit-loss');

  const yearData = useMemo(() => {
    if (!currentCompany) return null;

    const yearIssuedInvoices = issuedInvoices.filter(
      inv => inv.companyId === currentCompany.id &&
             new Date(inv.date).getFullYear() === selectedYear
    );

    const yearReceivedInvoices = receivedInvoices.filter(
      inv => inv.companyId === currentCompany.id &&
             new Date(inv.date).getFullYear() === selectedYear
    );

    const yearEntries = accountingEntries.filter(
      entry => entry.companyId === currentCompany.id &&
               new Date(entry.date).getFullYear() === selectedYear
    );

    // Calculate P&L
    const totalIncome = yearIssuedInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalVATCollected = yearIssuedInvoices.reduce((sum, inv) => sum + inv.totalVAT, 0);
    const totalExpenses = yearReceivedInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalVATPaid = yearReceivedInvoices.reduce((sum, inv) => sum + inv.totalVAT, 0);
    const grossProfit = totalIncome - totalExpenses;
    const netProfit = grossProfit;
    const vatBalance = totalVATCollected - totalVATPaid;

    return {
      totalIncome,
      totalVATCollected,
      totalExpenses,
      totalVATPaid,
      grossProfit,
      netProfit,
      vatBalance,
      invoicesCount: yearIssuedInvoices.length,
      expensesCount: yearReceivedInvoices.length,
      entriesCount: yearEntries.length
    };
  }, [currentCompany, issuedInvoices, receivedInvoices, accountingEntries, selectedYear]);

  const handleExportProfitLoss = () => {
    if (!yearData) return;

    const data = [
      { Concepto: 'Ingresos (Base Imponible)', Importe: yearData.totalIncome },
      { Concepto: 'IVA Repercutido', Importe: yearData.totalVATCollected },
      { Concepto: 'Gastos (Base Imponible)', Importe: -yearData.totalExpenses },
      { Concepto: 'IVA Soportado', Importe: -yearData.totalVATPaid },
      { Concepto: 'Resultado Bruto', Importe: yearData.grossProfit },
      { Concepto: 'Resultado Neto', Importe: yearData.netProfit },
      { Concepto: 'Saldo IVA', Importe: yearData.vatBalance }
    ];

    exportToCSV(data, `pyg_${selectedYear}_${currentCompany.name}.csv`);
  };

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

  if (!yearData) return null;

  return (
    <div className="page-content">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Informes y Reportes</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="form-control"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ width: '150px' }}
          >
            {[2026, 2025, 2024, 2023, 2022].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="btn btn-success" onClick={handleExportProfitLoss}>
            📥 Exportar CSV
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="flex gap-2">
          <button
            className={`btn ${reportType === 'profit-loss' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setReportType('profit-loss')}
          >
            Pérdidas y Ganancias
          </button>
          <button
            className={`btn ${reportType === 'vat' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setReportType('vat')}
          >
            IVA
          </button>
          <button
            className={`btn ${reportType === 'summary' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setReportType('summary')}
          >
            Resumen Anual
          </button>
        </div>
      </div>

      {reportType === 'profit-loss' && (
        <div>
          <div className="card mb-3">
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Cuenta de Pérdidas y Ganancias - {selectedYear}
            </h2>

            <table className="table">
              <tbody>
                <tr style={{ background: 'var(--background)', fontWeight: 'bold' }}>
                  <td colSpan="2">INGRESOS</td>
                </tr>
                <tr>
                  <td>Ventas y prestación de servicios (Base Imponible)</td>
                  <td className="text-right"><strong>{formatCurrency(yearData.totalIncome)}</strong></td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '40px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    IVA Repercutido
                  </td>
                  <td className="text-right">{formatCurrency(yearData.totalVATCollected)}</td>
                </tr>

                <tr style={{ background: 'var(--background)', fontWeight: 'bold' }}>
                  <td colSpan="2">GASTOS</td>
                </tr>
                <tr>
                  <td>Gastos de explotación (Base Imponible)</td>
                  <td className="text-right"><strong>{formatCurrency(yearData.totalExpenses)}</strong></td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '40px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    IVA Soportado
                  </td>
                  <td className="text-right">{formatCurrency(yearData.totalVATPaid)}</td>
                </tr>

                <tr style={{ borderTop: '2px solid var(--primary-color)' }}>
                  <td><strong style={{ fontSize: '18px' }}>RESULTADO BRUTO</strong></td>
                  <td className="text-right">
                    <strong style={{
                      fontSize: '18px',
                      color: yearData.grossProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                    }}>
                      {formatCurrency(yearData.grossProfit)}
                    </strong>
                  </td>
                </tr>

                <tr style={{ borderTop: '3px solid var(--primary-color)', background: 'var(--background)' }}>
                  <td><strong style={{ fontSize: '20px' }}>RESULTADO NETO</strong></td>
                  <td className="text-right">
                    <strong style={{
                      fontSize: '20px',
                      color: yearData.netProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                    }}>
                      {formatCurrency(yearData.netProfit)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Número de Facturas Emitidas</div>
              <div className="stat-value">{yearData.invoicesCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Número de Gastos</div>
              <div className="stat-value">{yearData.expensesCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Asientos Contables</div>
              <div className="stat-value">{yearData.entriesCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Margen Bruto %</div>
              <div className="stat-value">
                {yearData.totalIncome > 0
                  ? ((yearData.grossProfit / yearData.totalIncome) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'vat' && (
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
            Declaración de IVA - {selectedYear}
          </h2>

          <table className="table">
            <tbody>
              <tr style={{ background: 'var(--background)' }}>
                <td><strong>IVA Repercutido (Facturas emitidas)</strong></td>
                <td className="text-right"><strong>{formatCurrency(yearData.totalVATCollected)}</strong></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '20px' }}>Número de facturas</td>
                <td className="text-right">{yearData.invoicesCount}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '20px' }}>Base imponible</td>
                <td className="text-right">{formatCurrency(yearData.totalIncome)}</td>
              </tr>

              <tr style={{ background: 'var(--background)' }}>
                <td><strong>IVA Soportado (Facturas recibidas)</strong></td>
                <td className="text-right"><strong>{formatCurrency(yearData.totalVATPaid)}</strong></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '20px' }}>Número de facturas</td>
                <td className="text-right">{yearData.expensesCount}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '20px' }}>Base imponible</td>
                <td className="text-right">{formatCurrency(yearData.totalExpenses)}</td>
              </tr>

              <tr style={{ borderTop: '3px solid var(--primary-color)', background: 'var(--background)' }}>
                <td><strong style={{ fontSize: '18px' }}>SALDO DE IVA (A ingresar / A devolver)</strong></td>
                <td className="text-right">
                  <strong style={{
                    fontSize: '18px',
                    color: yearData.vatBalance >= 0 ? 'var(--error-color)' : 'var(--success-color)'
                  }}>
                    {formatCurrency(yearData.vatBalance)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          {yearData.vatBalance > 0 ? (
            <div className="card mt-3" style={{ background: '#ffebee', borderLeft: '4px solid var(--error-color)' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                ⚠️ <strong>IVA a ingresar:</strong> {formatCurrency(yearData.vatBalance)}
              </p>
            </div>
          ) : yearData.vatBalance < 0 ? (
            <div className="card mt-3" style={{ background: '#e8f5e9', borderLeft: '4px solid var(--success-color)' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                ✓ <strong>IVA a devolver:</strong> {formatCurrency(Math.abs(yearData.vatBalance))}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {reportType === 'summary' && (
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
            Resumen Anual - {selectedYear}
          </h2>

          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
              <div className="stat-label">Facturación Total</div>
              <div className="stat-value text-success">{formatCurrency(yearData.totalIncome)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {yearData.invoicesCount} facturas emitidas
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: 'var(--error-color)' }}>
              <div className="stat-label">Gastos Totales</div>
              <div className="stat-value text-error">{formatCurrency(yearData.totalExpenses)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {yearData.expensesCount} facturas recibidas
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
              <div className="stat-label">Resultado Neto</div>
              <div className="stat-value" style={{
                color: yearData.netProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)'
              }}>
                {formatCurrency(yearData.netProfit)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Margen: {yearData.totalIncome > 0
                  ? ((yearData.netProfit / yearData.totalIncome) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>

            <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
              <div className="stat-label">Saldo IVA</div>
              <div className="stat-value" style={{
                color: yearData.vatBalance >= 0 ? 'var(--error-color)' : 'var(--success-color)'
              }}>
                {formatCurrency(yearData.vatBalance)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {yearData.vatBalance >= 0 ? 'A ingresar' : 'A devolver'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Actividad Contable
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ background: 'var(--background)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Asientos Contables
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {yearData.entriesCount}
                </div>
              </div>

              <div className="card" style={{ background: 'var(--background)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  IVA Repercutido
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {formatCurrency(yearData.totalVATCollected)}
                </div>
              </div>

              <div className="card" style={{ background: 'var(--background)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  IVA Soportado
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {formatCurrency(yearData.totalVATPaid)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
