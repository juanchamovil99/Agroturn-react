import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function InvoicePreview({ invoice, onClose }) {
  const { currentCompany } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, you would use a library like jsPDF or html2pdf
    alert('En una implementación real, aquí se generaría un PDF');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Vista previa de Factura</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-sm btn-primary" onClick={handlePrint}>
              🖨️ Imprimir
            </button>
            <button className="btn btn-sm btn-success" onClick={handleDownloadPDF}>
              📄 Descargar PDF
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '40px' }}>
          {/* Invoice Template */}
          <div style={{
            background: 'white',
            border: '1px solid var(--border-color)',
            padding: '40px',
            fontFamily: 'Arial, sans-serif'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '40px',
              paddingBottom: '20px',
              borderBottom: '3px solid var(--primary-color)'
            }}>
              <div>
                <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--primary-color)' }}>
                  {currentCompany?.name || 'Mi Empresa'}
                </h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {currentCompany?.taxId}<br />
                  {currentCompany?.address}<br />
                  {currentCompany?.postalCode} {currentCompany?.city}<br />
                  {currentCompany?.email}<br />
                  {currentCompany?.phone}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '28px', margin: 0, color: 'var(--primary-color)' }}>
                  FACTURA
                </h2>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0' }}>
                  {invoice.number}
                </p>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Fecha: {formatDate(invoice.date)}<br />
                  Vencimiento: {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                FACTURAR A:
              </h3>
              <div style={{
                background: 'var(--background)',
                padding: '16px',
                borderRadius: '4px'
              }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  {invoice.customerName}
                </p>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  NIF/CIF: {invoice.customerTaxId}<br />
                  {invoice.customerAddress}<br />
                  {invoice.customerPostalCode} {invoice.customerCity}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '30px'
            }}>
              <thead>
                <tr style={{ background: 'var(--primary-color)', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Descripción</th>
                  <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Cant.</th>
                  <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>P. Unit.</th>
                  <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>IVA</th>
                  <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>{item.description}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {(item.vatRate * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '40px'
            }}>
              <div style={{ width: '300px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span>Base Imponible:</span>
                  <strong>{formatCurrency(invoice.subtotal)}</strong>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span>IVA:</span>
                  <strong>{formatCurrency(invoice.totalVAT)}</strong>
                </div>
                {invoice.totalIRPF > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--error-color)'
                  }}>
                    <span>IRPF (retención):</span>
                    <strong>-{formatCurrency(invoice.totalIRPF)}</strong>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'var(--primary-color)'
                }}>
                  <span>TOTAL:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div style={{
              background: 'var(--background)',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                INFORMACIÓN DE PAGO
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                <strong>Método de pago:</strong>{' '}
                {invoice.paymentMethod === 'transfer' ? 'Transferencia bancaria' :
                 invoice.paymentMethod === 'cash' ? 'Efectivo' :
                 invoice.paymentMethod === 'card' ? 'Tarjeta' : 'Cheque'}
              </p>
              {currentCompany?.iban && (
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                  <strong>IBAN:</strong> {currentCompany.iban}<br />
                  {currentCompany.bankName && <><strong>Banco:</strong> {currentCompany.bankName}</>}
                </p>
              )}
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>NOTAS:</h4>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            {currentCompany?.registryData && (
              <div style={{
                paddingTop: '20px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                {currentCompany.registryData}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
