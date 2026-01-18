import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { extractInvoiceDataFromPDF, isPDFScanned } from '../../utils/pdfParser';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionError, setExtractionError] = useState(null);

  const companyInvoices = useMemo(() => {
    if (!selectedCompany) return [];
    return receivedInvoices
      .filter((inv) => inv.companyId === selectedCompany.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCompany, receivedInvoices]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      alert('Por favor, selecciona un archivo PDF válido.');
      return;
    }

    setIsProcessing(true);
    setExtractionError(null);

    try {
      // Check if PDF is scanned (image-based)
      const isScanned = await isPDFScanned(file);

      if (isScanned) {
        alert(
          '⚠️ PDF Escaneado Detectado\n\n' +
          'Este PDF parece ser una imagen escaneada y no contiene texto extraíble.\n\n' +
          'Para estos casos necesitarías:\n' +
          '- OCR (Reconocimiento Óptico de Caracteres)\n' +
          '- O introducir los datos manualmente\n\n' +
          'Por ahora, usa "Añadir Manual"'
        );
        setIsProcessing(false);
        setShowUpload(false);
        return;
      }

      // Extract invoice data from PDF
      const extractedData = await extractInvoiceDataFromPDF(file);

      // Create invoice with extracted data
      const newInvoice = {
        id: `rec_${Date.now()}`,
        companyId: selectedCompany.id,
        number: extractedData.number || `AUTO-${Date.now()}`,
        date: extractedData.date || new Date().toISOString().split('T')[0],
        supplier: {
          name: extractedData.supplier.name || 'Sin nombre',
          nif: extractedData.supplier.nif || '',
          address: extractedData.supplier.address || '',
          city: extractedData.supplier.city || '',
          postalCode: extractedData.supplier.postalCode || '',
        },
        subtotal: extractedData.subtotal || 0,
        vat: extractedData.vat || 0,
        total: extractedData.total || 0,
        vatRate: extractedData.vatRate || 0.21,
        status: 'pending',
        createdAt: new Date().toISOString(),
        pdfFileName: file.name,
      };

      addReceivedInvoice(newInvoice);

      // Show success message with extracted data
      alert(
        '✅ Factura Extraída Exitosamente\n\n' +
        `Número: ${newInvoice.number}\n` +
        `Proveedor: ${newInvoice.supplier.name}\n` +
        `NIF: ${newInvoice.supplier.nif || 'No detectado'}\n` +
        `Fecha: ${formatDate(newInvoice.date)}\n` +
        `Base: ${formatCurrency(newInvoice.subtotal)}\n` +
        `IVA: ${formatCurrency(newInvoice.vat)}\n` +
        `Total: ${formatCurrency(newInvoice.total)}\n\n` +
        'Puedes editar los datos si es necesario.'
      );

      setShowUpload(false);
    } catch (error) {
      console.error('Error extracting PDF:', error);
      setExtractionError(error.message);
      alert(
        '❌ Error al Extraer Datos\n\n' +
        error.message + '\n\n' +
        'Por favor, intenta con otro PDF o usa "Añadir Manual".'
      );
    } finally {
      setIsProcessing(false);
      // Reset file input
      e.target.value = '';
    }
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
          <h3>📄 Cargar Factura PDF</h3>
          <p>
            {isProcessing
              ? '⏳ Extrayendo datos del PDF...'
              : 'Sube un PDF y el sistema extraerá automáticamente: Proveedor, NIF, Fecha, Importes e IVA'}
          </p>
          {extractionError && (
            <div className="error-message" style={{ color: '#f56565', marginBottom: '1rem' }}>
              ❌ {extractionError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="file-input"
              disabled={isProcessing}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowUpload(false);
                setExtractionError(null);
              }}
              disabled={isProcessing}
            >
              Cancelar
            </button>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#718096' }}>
            <strong>Nota:</strong> Funciona mejor con PDFs que contienen texto (no imágenes escaneadas).
            Para PDFs escaneados, se requiere OCR avanzado.
          </div>
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
