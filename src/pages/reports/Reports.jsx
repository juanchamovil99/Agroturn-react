import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import './Reports.css';

const Reports = () => {
  const { selectedCompany, issuedInvoices, receivedInvoices, bankTransactions } =
    useStore();

  const reportData = useMemo(() => {
    if (!selectedCompany) return null;

    const companyIssued = issuedInvoices.filter(
      (inv) => inv.companyId === selectedCompany.id
    );
    const companyReceived = receivedInvoices.filter(
      (inv) => inv.companyId === selectedCompany.id
    );

    // Calculate totals
    const sales = companyIssued.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
    const salesVAT = companyIssued.reduce((sum, inv) => sum + (inv.vat || 0), 0);
    const purchases = companyReceived.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
    const purchasesVAT = companyReceived.reduce((sum, inv) => sum + (inv.vat || 0), 0);

    const vatBalance = salesVAT - purchasesVAT;
    const netProfit = sales - purchases;

    // Group by month
    const monthlyData = {};
    companyIssued.forEach((inv) => {
      const month = inv.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, purchases: 0 };
      }
      monthlyData[month].sales += inv.subtotal || 0;
    });

    companyReceived.forEach((inv) => {
      const month = inv.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, purchases: 0 };
      }
      monthlyData[month].purchases += inv.subtotal || 0;
    });

    return {
      sales,
      salesVAT,
      purchases,
      purchasesVAT,
      vatBalance,
      netProfit,
      monthlyData,
    };
  }, [selectedCompany, issuedInvoices, receivedInvoices]);

  if (!selectedCompany) {
    return (
      <div className="reports-page">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Debes seleccionar una empresa para ver los informes</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Informes y Reportes</h1>
          <p className="subtitle">{selectedCompany.name}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Ventas</h3>
            <p className="metric-value">{formatCurrency(reportData.sales)}</p>
            <span className="metric-sub">Base imponible</span>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">📥</div>
          <div className="metric-content">
            <h3>Compras</h3>
            <p className="metric-value">{formatCurrency(reportData.purchases)}</p>
            <span className="metric-sub">Base imponible</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Resultado</h3>
            <p className="metric-value">{formatCurrency(reportData.netProfit)}</p>
            <span className="metric-sub">
              {reportData.netProfit >= 0 ? 'Beneficio' : 'Pérdida'}
            </span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">🧾</div>
          <div className="metric-content">
            <h3>IVA a Pagar/Devolver</h3>
            <p className="metric-value">{formatCurrency(Math.abs(reportData.vatBalance))}</p>
            <span className="metric-sub">
              {reportData.vatBalance >= 0 ? 'A pagar' : 'A devolver'}
            </span>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="reports-grid">
        <div className="report-card">
          <h3>📊 Cuenta de Resultados</h3>
          <div className="report-content">
            <div className="report-row">
              <span>Ventas</span>
              <span className="positive">{formatCurrency(reportData.sales)}</span>
            </div>
            <div className="report-row">
              <span>Compras</span>
              <span className="negative">-{formatCurrency(reportData.purchases)}</span>
            </div>
            <div className="report-row total">
              <span>Resultado</span>
              <span className={reportData.netProfit >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(reportData.netProfit)}
              </span>
            </div>
          </div>
          <button className="btn btn-outline">Generar PDF</button>
        </div>

        <div className="report-card">
          <h3>🧾 Libro de IVA</h3>
          <div className="report-content">
            <div className="report-section">
              <h4>IVA Repercutido (Ventas)</h4>
              <div className="report-row">
                <span>IVA 21%</span>
                <span>{formatCurrency(reportData.salesVAT)}</span>
              </div>
            </div>
            <div className="report-section">
              <h4>IVA Soportado (Compras)</h4>
              <div className="report-row">
                <span>IVA 21%</span>
                <span>{formatCurrency(reportData.purchasesVAT)}</span>
              </div>
            </div>
            <div className="report-row total">
              <span>Diferencia</span>
              <span className={reportData.vatBalance >= 0 ? 'negative' : 'positive'}>
                {formatCurrency(reportData.vatBalance)}
              </span>
            </div>
          </div>
          <button className="btn btn-outline">Generar PDF</button>
        </div>

        <div className="report-card">
          <h3>📑 Libro Diario</h3>
          <p className="report-description">
            Registro cronológico de todas las operaciones contables realizadas
          </p>
          <button className="btn btn-outline">Ver Libro Diario</button>
        </div>

        <div className="report-card">
          <h3>📒 Libro Mayor</h3>
          <p className="report-description">
            Movimientos agrupados por cuenta contable del Plan General Contable
          </p>
          <button className="btn btn-outline">Ver Libro Mayor</button>
        </div>

        <div className="report-card">
          <h3>⚖️ Balance de Situación</h3>
          <p className="report-description">
            Estado de activos, pasivos y patrimonio neto de la empresa
          </p>
          <button className="btn btn-outline">Generar Balance</button>
        </div>

        <div className="report-card">
          <h3>💼 Modelo 303 (IVA)</h3>
          <p className="report-description">
            Declaración trimestral del IVA para la Agencia Tributaria
          </p>
          <button className="btn btn-outline">Generar Modelo 303</button>
        </div>
      </div>

      {/* Monthly Evolution */}
      {Object.keys(reportData.monthlyData).length > 0 && (
        <div className="monthly-section">
          <h2>Evolución Mensual</h2>
          <div className="monthly-table-container">
            <table className="monthly-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-right">Compras</th>
                  <th className="text-right">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(reportData.monthlyData)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, data]) => {
                    const result = data.sales - data.purchases;
                    return (
                      <tr key={month}>
                        <td>{month}</td>
                        <td className="text-right">{formatCurrency(data.sales)}</td>
                        <td className="text-right">{formatCurrency(data.purchases)}</td>
                        <td className={`text-right ${result >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(result)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
