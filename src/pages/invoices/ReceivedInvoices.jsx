import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './IssuedInvoices.css';

const ReceivedInvoices = () => {
  const {
    selectedCompany,
    receivedInvoices,
    addReceivedInvoice,
    updateReceivedInvoice,
    deleteReceivedInvoice,
  } = useStore();

  const [showUpload, setShowUpload] = useState(false);

  const companyInvoices = useMemo(() => {
    if (!selectedCompany) return [];
    return receivedInvoices
      .filter((inv) => inv.companyId === selectedCompany.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCompany, receivedInvoices]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate PDF scanning (would use a real OCR library in production)
    alert(
      'Escaneando PDF... Esta funcionalidad extraería automáticamente:\n- Proveedor\n- Número de factura\n- Fecha\n- Importes\n- IVA\n\nPor ahora, añade los datos manualmente.'
    );

    // For now, create a blank invoice
    const newInvoice = {
      id: `rec_${Date.now()}`,
      companyId: selectedCompany.id,
      number: '',
      date: new Date().toISOString().split('T')[0],
      supplier: {
        name: '',
        nif: '',
      },
      subtotal: 0,
      vat: 0,
      total: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addReceivedInvoice(newInvoice);
    setShowUpload(false);
  };

  const handleManualAdd = () => {
    const newInvoice = {
      id: `rec_${Date.now()}`,
      companyId: selectedCompany.id,
      number: prompt('Número de factura:') || '',
      date: new Date().toISOString().split('T')[0],
      supplier: {
        name: prompt('Nombre del proveedor:') || '',
        nif: prompt('NIF del proveedor:') || '',
      },
      subtotal: parseFloat(prompt('Base imponible:') || '0'),
      vat: parseFloat(prompt('IVA:') || '0'),
      total: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    newInvoice.total = newInvoice.subtotal + newInvoice.vat;
    addReceivedInvoice(newInvoice);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar esta factura recibida?')) {
      deleteReceivedInvoice(id);
    }
  };

  const handleMarkAsPaid = (invoice) => {
    updateReceivedInvoice(invoice.id, { ...invoice, status: 'paid' });
  };

  if (!selectedCompany) {
    return (
      <div className="invoices-page">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Debes seleccionar una empresa antes de gestionar facturas</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  const totals = companyInvoices.reduce(
    (acc, inv) => {
      acc.total += inv.total || 0;
      if (inv.status === 'paid') {
        acc.paid += inv.total || 0;
      } else {
        acc.pending += inv.total || 0;
      }
      return acc;
    },
    { total: 0, paid: 0, pending: 0 }
  );

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Facturas Recibidas</h1>
          <p className="subtitle">{selectedCompany.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowUpload(true)}>
            📄 Escanear PDF
          </button>
          <button className="btn btn-primary" onClick={handleManualAdd}>
            ➕ Añadir Manual
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="upload-section">
          <h3>Cargar Factura PDF</h3>
          <p>Sube un PDF y el sistema extraerá automáticamente los datos</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="file-input"
          />
          <button className="btn btn-secondary" onClick={() => setShowUpload(false)}>
            Cancelar
          </button>
        </div>
      )}

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Gastos</h3>
          <p className="summary-value">{formatCurrency(totals.total)}</p>
          <span className="summary-label">{companyInvoices.length} facturas</span>
        </div>
        <div className="summary-card">
          <h3>Pagado</h3>
          <p className="summary-value green">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="summary-card">
          <h3>Pendiente de Pago</h3>
          <p className="summary-value orange">{formatCurrency(totals.pending)}</p>
        </div>
      </div>

      {companyInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📥</div>
          <h2>No hay facturas recibidas</h2>
          <p>Añade facturas de proveedores escaneando PDFs o manualmente</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setShowUpload(true)}>
              Escanear PDF
            </button>
            <button className="btn btn-primary" onClick={handleManualAdd}>
              Añadir Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="invoices-table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Base</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companyInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-number">{invoice.number}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td>
                    <div className="client-info">
                      <div className="client-name">{invoice.supplier?.name}</div>
                      <div className="client-nif">{invoice.supplier?.nif}</div>
                    </div>
                  </td>
                  <td>{formatCurrency(invoice.subtotal || 0)}</td>
                  <td>{formatCurrency(invoice.vat || 0)}</td>
                  <td className="total-cell">{formatCurrency(invoice.total || 0)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        invoice.status === 'paid' ? 'status-paid' : 'status-pending'
                      }`}
                    >
                      {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {invoice.status !== 'paid' && (
                        <button
                          className="btn-icon"
                          onClick={() => handleMarkAsPaid(invoice)}
                          title="Marcar como pagada"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(invoice.id)}
                        title="Eliminar"
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
    </div>
  );
};

export default ReceivedInvoices;
