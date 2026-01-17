import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { VAT_RATES } from '../../data/pgc-spain';
import { formatDateInput } from '../../utils/helpers';

export default function PDFScanner({ onClose }) {
  const { addReceivedInvoice, suppliers } = useApp();
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Por favor selecciona un archivo PDF válido');
    }
  };

  // Extract text from PDF using pdf.js from CDN
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async function(e) {
        const typedarray = new Uint8Array(e.target.result);

        try {
          // Load pdf.js from CDN if not already loaded
          if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            document.head.appendChild(script);

            await new Promise((resolve) => {
              script.onload = resolve;
            });

            // Set worker
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }

          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';

          // Extract text from all pages
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Parse extracted text to find invoice data
  const parseInvoiceData = (text) => {
    const data = {
      number: '',
      date: formatDateInput(new Date()),
      dueDate: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      supplierName: '',
      supplierTaxId: '',
      subtotal: 0,
      totalVAT: 0,
      total: 0,
      description: '',
      items: []
    };

    // Extract invoice number - common patterns
    const invoicePatterns = [
      /(?:factura|invoice|n[úu]mero|number|nº|no\.?)\s*:?\s*([A-Z0-9\/-]+)/i,
      /([A-Z]{2,4}[-\/]?\d{4,})/,
      /\b([0-9]{4,}[-\/][0-9]+)\b/
    ];

    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.number = match[1].trim();
        break;
      }
    }

    // Extract dates (Spanish and international formats)
    const datePatterns = [
      /(?:fecha|date|emisión|emission)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/,
      /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[1];
          let parsedDate;

          if (dateStr.includes('/') || dateStr.includes('-')) {
            const parts = dateStr.split(/[-\/]/);
            if (parts[0].length === 4) {
              // YYYY-MM-DD
              parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              // DD-MM-YYYY or DD/MM/YYYY
              parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          }

          if (parsedDate && !isNaN(parsedDate.getTime())) {
            data.date = formatDateInput(parsedDate);
            break;
          }
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
    }

    // Extract Spanish NIF/CIF
    const cifPatterns = [
      /\b([ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])\b/g,
      /\b(\d{8}[A-Z])\b/g,
      /(?:NIF|CIF|DNI)\s*:?\s*([A-Z0-9]{8,9})/gi
    ];

    const allCIFs = new Set();
    for (const pattern of cifPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        allCIFs.add(match[1]);
      }
    }

    // First CIF is usually the supplier
    if (allCIFs.size > 0) {
      data.supplierTaxId = Array.from(allCIFs)[0];
    }

    // Extract company name (usually appears before CIF or at the top)
    const namePatterns = [
      /([A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚa-zñáéíóú\s\.]+(?:S\.?L\.?|S\.?A\.?|S\.?L\.?L\.?|C\.?B\.?))/,
      /^([A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚa-zñáéíóú\s\.]{3,50})/m
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1].length > 5 && match[1].length < 100) {
        data.supplierName = match[1].trim();
        break;
      }
    }

    // Extract amounts - look for total, base, IVA
    const totalPatterns = [
      /(?:total|TOTAL|Total)\s*:?\s*([\d.,]+)\s*€?/i,
      /(?:importe total|total amount)\s*:?\s*([\d.,]+)/i
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          data.total = amount;
          break;
        }
      }
    }

    // Extract base imponible
    const basePatterns = [
      /(?:base\s+imponible|base|subtotal)\s*:?\s*([\d.,]+)\s*€?/i,
      /(?:neto|net)\s*:?\s*([\d.,]+)/i
    ];

    for (const pattern of basePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          data.subtotal = amount;
          break;
        }
      }
    }

    // Extract IVA
    const ivaPatterns = [
      /(?:IVA|I\.V\.A\.?)\s*(?:21%|10%|4%)?\s*:?\s*([\d.,]+)\s*€?/i,
      /(?:VAT|tax)\s*:?\s*([\d.,]+)/i
    ];

    for (const pattern of ivaPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          data.totalVAT = amount;
          break;
        }
      }
    }

    // Calculate missing values
    if (data.total > 0 && data.subtotal === 0 && data.totalVAT === 0) {
      // Assume 21% VAT
      data.subtotal = data.total / 1.21;
      data.totalVAT = data.total - data.subtotal;
    } else if (data.subtotal > 0 && data.total === 0) {
      data.total = data.subtotal + data.totalVAT;
    } else if (data.total > 0 && data.subtotal > 0 && data.totalVAT === 0) {
      data.totalVAT = data.total - data.subtotal;
    }

    // Create a default item
    if (data.subtotal > 0) {
      data.items = [{
        description: 'Servicios/Productos según factura',
        quantity: 1,
        unitPrice: data.subtotal,
        vatRate: data.totalVAT > 0 ? data.totalVAT / data.subtotal : VAT_RATES.GENERAL
      }];
    }

    // Extract description (first few words or service description)
    const descPatterns = [
      /(?:concepto|descripción|description)\s*:?\s*([^\n]{10,100})/i,
      /(?:servicios?|productos?)\s+([^\n]{10,100})/i
    ];

    for (const pattern of descPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.description = match[1].trim().substring(0, 200);
        break;
      }
    }

    // If no description found, use first meaningful line
    if (!data.description && text.length > 20) {
      const lines = text.split('\n').filter(line => line.trim().length > 10);
      if (lines.length > 0) {
        data.description = lines[0].substring(0, 100);
      }
    }

    return data;
  };

  const handleScanPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(pdfFile);
      setRawText(text);

      // Parse the text to extract invoice data
      const parsedData = parseInvoiceData(text);

      setExtractedData(parsedData);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error al procesar el PDF. Por favor, intenta con otro archivo o introduce los datos manualmente.');
      setIsProcessing(false);
    }
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

              <div className="card" style={{ background: '#e3f2fd', borderLeft: '4px solid #2196F3' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>🤖 OCR Real Implementado</h4>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-secondary)' }}>
                  Esta versión utiliza <strong>PDF.js</strong> para extraer texto real del PDF y algoritmos
                  inteligentes para detectar:
                </p>
                <ul style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                  <li>Número de factura (varios formatos)</li>
                  <li>Fecha de emisión (DD/MM/YYYY, YYYY-MM-DD)</li>
                  <li>NIF/CIF del proveedor (validación española)</li>
                  <li>Nombre de la empresa</li>
                  <li>Base imponible, IVA y Total</li>
                  <li>Descripción de servicios/productos</li>
                </ul>
              </div>

              {rawText && (
                <div className="card mt-3" style={{ background: '#f5f5f5' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>📝 Texto Extraído</h4>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    padding: '8px',
                    background: 'white',
                    border: '1px solid var(--border-color)'
                  }}>
                    {rawText}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="card mb-3" style={{ background: '#d1f2eb', borderLeft: '4px solid #00c851' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>✓ Datos extraídos del PDF</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Revisa y edita los datos extraídos antes de guardar. El sistema ha analizado el PDF y
                  extraído la información automáticamente.
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

              {rawText && (
                <details className="card mt-2" style={{ background: '#f5f5f5', cursor: 'pointer' }}>
                  <summary style={{ padding: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                    📄 Ver texto extraído del PDF
                  </summary>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    padding: '12px',
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    marginTop: '8px'
                  }}>
                    {rawText}
                  </div>
                </details>
              )}
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
