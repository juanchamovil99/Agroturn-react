import { formatCurrency, formatDate } from '../../utils/formatters';
import './InvoicePreview.css';

const InvoicePreview = ({ invoice, company, onClose }) => {
  const handleDownloadPDF = () => {
    // This would generate a PDF using jspdf library
    // For now, we'll just show an alert
    alert('Funcionalidad de descarga PDF en desarrollo');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    alert('Funcionalidad de envío por email en desarrollo');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content preview-modal">
        <div className="modal-header no-print">
          <h2>Vista Previa de Factura</h2>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handlePrint}>
              🖨️ Imprimir
            </button>
            <button className="btn btn-secondary" onClick={handleDownloadPDF}>
              📄 Descargar PDF
            </button>
            <button className="btn btn-secondary" onClick={handleSendEmail}>
              📧 Enviar Email
            </button>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="invoice-preview">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="company-info">
              <h1 className="company-name">{company.name}</h1>
              <p>NIF: {company.nif}</p>
              <p>{company.address}</p>
              <p>
                {company.postalCode} {company.city}
              </p>
              {company.email && <p>Email: {company.email}</p>}
              {company.phone && <p>Tel: {company.phone}</p>}
            </div>
            <div className="invoice-info">
              <h2 className="invoice-title">FACTURA</h2>
              <div className="invoice-details">
                <div className="detail-item">
                  <span className="detail-label">Número:</span>
                  <span className="detail-value">{invoice.number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{formatDate(invoice.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vencimiento:</span>
                  <span className="detail-value">{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="client-section">
            <h3>Cliente</h3>
            <div className="client-details">
              <p className="client-name">{invoice.client.name}</p>
              <p>NIF: {invoice.client.nif}</p>
              {invoice.client.address && <p>{invoice.client.address}</p>}
              {invoice.client.city && (
                <p>
                  {invoice.client.postalCode} {invoice.client.city}
                </p>
              )}
              {invoice.client.email && <p>Email: {invoice.client.email}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Precio Unit.</th>
                <th className="text-right">IVA</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right">{(item.vatRate * 100).toFixed(0)}%</td>
                  <td className="text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-section-preview">
            <div className="totals-grid-preview">
              <div className="total-row-preview">
                <span>Base Imponible:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="total-row-preview">
                <span>IVA:</span>
                <span>{formatCurrency(invoice.vat)}</span>
              </div>
              {invoice.retention > 0 && (
                <div className="total-row-preview">
                  <span>Retención IRPF:</span>
                  <span className="negative">-{formatCurrency(invoice.retention)}</span>
                </div>
              )}
              <div className="total-row-preview final">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="payment-section">
            <h4>Forma de Pago</h4>
            <p>{getPaymentMethodLabel(invoice.paymentMethod)}</p>
            {company.iban && (
              <p>
                <strong>IBAN:</strong> {company.iban}
              </p>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="notes-section">
              <h4>Notas</h4>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="invoice-footer">
            <p className="footer-text">
              Gracias por su confianza. Para cualquier consulta sobre esta factura,
              contacte con nosotros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    transfer: 'Transferencia Bancaria',
    cash: 'Efectivo',
    card: 'Tarjeta',
    check: 'Cheque',
    other: 'Otro',
  };
  return labels[method] || method;
};

export default InvoicePreview;
