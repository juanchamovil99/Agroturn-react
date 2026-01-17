import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import ReceivedInvoiceForm from '../../components/invoices/ReceivedInvoiceForm';
import PDFScanner from '../../components/invoices/PDFScanner';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ReceivedInvoicesPage() {
  const { receivedInvoices, currentCompany, deleteReceivedInvoice } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [filter, setFilter] = useState('all');

  const companyInvoices = useMemo(() => {
    if (!currentCompany) return [];
    return receivedInvoices.filter(inv => inv.companyId === currentCompany.id);
  }, [receivedInvoices, currentCompany]);

  const filteredInvoices = useMemo(() => {
    return companyInvoices.filter(invoice => {
      if (filter === 'all') return true;
      if (filter === 'paid') return invoice.status === 'paid';
      if (filter === 'pending') return invoice.status === 'pending';
      return true;
    });
  }, [companyInvoices, filter]);

  const stats = useMemo(() => {
    const total = companyInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = companyInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pending = companyInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);

    return { total, paid, pending };
  }, [companyInvoices]);

  const handleDelete = (invoice) => {
    if (window.confirm(`¿Estás seguro de eliminar la factura ${invoice.number}?`)) {
      deleteReceivedInvoice(invoice.id);
    }
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

  return (
    <div className="page-content">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Facturas Recibidas</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-success" onClick={() => setShowScanner(true)}>
            📸 Escanear PDF
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Nueva Factura
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: 'var(--error-color)' }}>
          <div className="stat-label">Total Gastos</div>
          <div className="stat-value text-error">{formatCurrency(stats.total)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
          <div className="stat-label">Pagado</div>
          <div className="stat-value text-success">{formatCurrency(stats.paid)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
          <div className="stat-label">Pendiente Pago</div>
          <div className="stat-value text-warning">{formatCurrency(stats.pending)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
          <div className="stat-label">Número de Facturas</div>
          <div className="stat-value">{companyInvoices.length}</div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="flex gap-2">
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
          >
            Todas ({companyInvoices.length})
          </button>
          <button
            className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('paid')}
          >
            Pagadas
          </button>
          <button
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📥</div>
          <div className="empty-state-text">No hay facturas recibidas</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-success" onClick={() => setShowScanner(true)}>
              Escanear PDF
            </button>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Introducir manualmente
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Base</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.number}</strong></td>
                  <td>{invoice.supplierName}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td>{formatCurrency(invoice.subtotal)}</td>
                  <td>{formatCurrency(invoice.totalVAT)}</td>
                  <td><strong>{formatCurrency(invoice.total)}</strong></td>
                  <td>
                    <span className={`badge ${
                      invoice.status === 'paid' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(invoice)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <ReceivedInvoiceForm onClose={() => setShowForm(false)} />}
      {showScanner && <PDFScanner onClose={() => setShowScanner(false)} />}
    </div>
  );
}
