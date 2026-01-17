import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { VAT_RATES } from '../../data/pgc-spain';
import { formatDateInput } from '../../utils/helpers';

export default function PDFScanner({ onClose }) {
  const { addReceivedInvoice, suppliers } = useApp();
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Por favor selecciona un archivo PDF válido');
    }
  };

  const handleScanPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);

    // Simulate PDF processing
    // In a real app, you would use a library like pdf.js or send to a backend API
    // with OCR capabilities (Tesseract.js, Google Cloud Vision, AWS Textract, etc.)
    setTimeout(() => {
      // Mock extracted data
      const mockData = {
        number: `FAC-${Math.floor(Math.random() * 10000)}`,
        date: formatDateInput(new Date()),
        dueDate: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        supplierName: 'Proveedor Ejemplo S.L.',
        supplierTaxId: 'B12345678',
        subtotal: 100.00,
        totalVAT: 21.00,
        total: 121.00,
        description: 'Servicios profesionales',
        items: [
          {
            description: 'Servicio 1',
            quantity: 1,
            unitPrice: 100.00,
            vatRate: VAT_RATES.GENERAL
          }
        ]
      };

      setExtractedData(mockData);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSaveInvoice = () => {
    if (!extractedData) return;

    addReceivedInvoice({
      ...extractedData,
      status: 'pending',
      pdfFileName: pdfFile.name
    });

    onClose();
  };

  const handleEditField = (field, value) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Escanear Factura PDF</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!extractedData ? (
            <div>
              <div className="card mb-3" style={{ background: 'var(--background)', padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <h3 style={{ marginBottom: '16px' }}>Carga un PDF de factura</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Nuestra tecnología OCR extraerá automáticamente los datos de la factura
                </p>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  📁 Seleccionar PDF
                </label>

                {pdfFile && (
                  <div style={{ marginTop: '20px' }}>
                    <div className="badge badge-success" style={{ fontSize: '14px', padding: '8px 16px' }}>
                      ✓ {pdfFile.name}
                    </div>
                    <br />
                    <button
                      className="btn btn-success mt-2"
                      onClick={handleScanPDF}
                      disabled={isProcessing}
                    >
                      {isProcessing ? '🔄 Procesando...' : '🔍 Escanear Factura'}
                    </button>
                  </div>
                )}
              </div>

              <div className="card" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>💡 Nota</h4>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-secondary)' }}>
                  Esta es una demostración. En producción, utilizaríamos tecnologías como:
                </p>
                <ul style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                  <li>PDF.js para extraer texto del PDF</li>
                  <li>Tesseract.js para OCR de imágenes</li>
                  <li>Google Cloud Vision o AWS Textract para OCR avanzado</li>
                  <li>IA para extraer campos estructurados automáticamente</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="card mb-3" style={{ background: '#d1f2eb', borderLeft: '4px solid #00c851' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>✓ Datos extraídos correctamente</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Revisa y edita los datos extraídos antes de guardar
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número de Factura</label>
                  <input
                    type="text"
                    className="form-control"
                    value={extractedData.number}
                    onChange={(e) => handleEditField('number', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={extractedData.date}
                    onChange={(e) => handleEditField('date', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vencimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={extractedData.dueDate}
                    onChange={(e) => handleEditField('dueDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Proveedor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={extractedData.supplierName}
                    onChange={(e) => handleEditField('supplierName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NIF/CIF Proveedor</label>
                  <input
                    type="text"
                    className="form-control"
                    value={extractedData.supplierTaxId}
                    onChange={(e) => handleEditField('supplierTaxId', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base Imponible</label>
                  <input
                    type="number"
                    className="form-control"
                    value={extractedData.subtotal}
                    onChange={(e) => handleEditField('subtotal', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">IVA</label>
                  <input
                    type="number"
                    className="form-control"
                    value={extractedData.totalVAT}
                    onChange={(e) => handleEditField('totalVAT', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total</label>
                  <input
                    type="number"
                    className="form-control"
                    value={extractedData.total}
                    onChange={(e) => handleEditField('total', parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={extractedData.description}
                  onChange={(e) => handleEditField('description', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          {extractedData && (
            <button className="btn btn-success" onClick={handleSaveInvoice}>
              💾 Guardar Factura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
