import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import InvoicePreview from '../../components/invoices/InvoicePreview';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function IssuedInvoicesPage() {
  const { issuedInvoices, currentCompany, deleteIssuedInvoice } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, pending, overdue

  const companyInvoices = useMemo(() => {
    if (!currentCompany) return [];
    return issuedInvoices.filter(inv => inv.companyId === currentCompany.id);
  }, [issuedInvoices, currentCompany]);

  const filteredInvoices = useMemo(() => {
    return companyInvoices.filter(invoice => {
      if (filter === 'all') return true;
      if (filter === 'paid') return invoice.status === 'paid';
      if (filter === 'pending') return invoice.status === 'pending';
      if (filter === 'overdue') {
        return invoice.status === 'pending' &&
               new Date(invoice.dueDate) < new Date();
      }
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

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (invoice) => {
    if (window.confirm(`¿Estás seguro de eliminar la factura ${invoice.number}?`)) {
      deleteIssuedInvoice(invoice.id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Facturas Emitidas</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nueva Factura
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Facturado</div>
          <div className="stat-value">{formatCurrency(stats.total)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--success-color)' }}>
          <div className="stat-label">Cobrado</div>
          <div className="stat-value text-success">{formatCurrency(stats.paid)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
          <div className="stat-label">Pendiente</div>
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
          <button
            className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('overdue')}
          >
            Vencidas
          </button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-text">No hay facturas emitidas</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear primera factura
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
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
                  <td>{invoice.customerName}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td>{formatCurrency(invoice.subtotal)}</td>
                  <td>{formatCurrency(invoice.totalVAT)}</td>
                  <td><strong>{formatCurrency(invoice.total)}</strong></td>
                  <td>
                    <span className={`badge ${
                      invoice.status === 'paid' ? 'badge-success' :
                      invoice.status === 'pending' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {invoice.status === 'paid' ? 'Pagada' :
                       invoice.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setPreviewInvoice(invoice)}
                        title="Ver factura"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(invoice)}
                      >
                        ✏️
                      </button>
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

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={handleCloseForm}
        />
      )}

      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
    </div>
  );
}
