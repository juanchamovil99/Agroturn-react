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
  const [extractionStats, setExtractionStats] = useState(null);
  const [error, setError] = useState(null);

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
    const stats = {
      foundNumber: false,
      foundDate: false,
      foundTaxId: false,
      foundName: false,
      foundTotal: false,
      foundBase: false,
      foundVAT: false,
      foundDescription: false,
      patterns: [],
      warnings: []
    };

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

    console.log('🔍 Iniciando análisis del PDF...');
    console.log('📝 Longitud del texto:', text.length, 'caracteres');
    console.log('📄 Primeros 500 caracteres:', text.substring(0, 500));

    // Extract invoice number - common patterns
    const invoicePatterns = [
      { regex: /(?:factura|invoice|n[úu]mero|number|nº|no\.?)\s*:?\s*([A-Z0-9\/-]{3,20})/i, name: 'Patrón factura con etiqueta' },
      { regex: /(?:^|\n)\s*([A-Z]{2,4}[-\/]?\d{4,})\s*(?:\n|$)/m, name: 'Patrón código alfanumérico' },
      { regex: /\b([0-9]{4,}[-\/][0-9]+)\b/, name: 'Patrón numérico con separador' },
      { regex: /(?:^|\n)\s*FACTURA\s+([A-Z0-9\/-]{3,20})/i, name: 'Factura seguida de número' }
    ];

    for (const { regex, name } of invoicePatterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        data.number = match[1].trim();
        stats.foundNumber = true;
        stats.patterns.push(`✓ Número: ${name}`);
        console.log('✅ Número de factura encontrado:', data.number, `(${name})`);
        break;
      }
    }
    if (!stats.foundNumber) {
      console.warn('⚠️ No se encontró número de factura');
      stats.warnings.push('No se detectó número de factura');
    }

    // Extract dates (Spanish and international formats)
    const datePatterns = [
      { regex: /(?:fecha|date|emisión|emission|emitida)\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i, name: 'Fecha con etiqueta' },
      { regex: /(?:^|\n)\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\s*(?:\n|$)/m, name: 'Fecha DD/MM/YYYY' },
      { regex: /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/, name: 'Fecha ISO' }
    ];

    for (const { regex, name } of datePatterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        try {
          const dateStr = match[1];
          let parsedDate;

          const parts = dateStr.split(/[-\/]/);
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
          } else {
            // DD-MM-YYYY or DD/MM/YYYY
            parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
          }

          if (parsedDate && !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000) {
            data.date = formatDateInput(parsedDate);
            stats.foundDate = true;
            stats.patterns.push(`✓ Fecha: ${name}`);
            console.log('✅ Fecha encontrada:', data.date, `(${name})`);
            break;
          }
        } catch (e) {
          console.error('❌ Error parseando fecha:', e);
        }
      }
    }
    if (!stats.foundDate) {
      console.warn('⚠️ No se encontró fecha, usando fecha actual');
      stats.warnings.push('Usando fecha actual por defecto');
    }

    // Extract Spanish NIF/CIF with better validation
    const cifPatterns = [
      { regex: /\b([ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J])\b/g, name: 'CIF corporativo' },
      { regex: /\b(\d{8}[A-Z])\b/g, name: 'NIF/NIE' },
      { regex: /(?:NIF|CIF|DNI|VAT)\s*:?\s*([A-Z0-9]{8,10})/gi, name: 'NIF/CIF con etiqueta' }
    ];

    const allCIFs = [];
    for (const { regex, name } of cifPatterns) {
      const matches = text.matchAll(regex);
      for (const match of matches) {
        const cif = match[1].toUpperCase();
        if (!allCIFs.includes(cif)) {
          allCIFs.push(cif);
          console.log(`✅ NIF/CIF detectado: ${cif} (${name})`);
        }
      }
    }

    if (allCIFs.length > 0) {
      data.supplierTaxId = allCIFs[0];
      stats.foundTaxId = true;
      stats.patterns.push(`✓ NIF/CIF: ${allCIFs.length} encontrado(s)`);
      if (allCIFs.length > 1) {
        console.log('ℹ️ Múltiples NIF/CIF encontrados:', allCIFs, '- usando el primero');
      }
    } else {
      console.warn('⚠️ No se encontró NIF/CIF');
      stats.warnings.push('No se detectó NIF/CIF del proveedor');
    }

    // Extract company name - improved patterns
    const namePatterns = [
      { regex: /([A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚa-zñáéíóú\s&\.]+(?:S\.?L\.?|S\.?A\.?|S\.?L\.?L\.?|C\.?B\.?))/g, name: 'Razón social con forma jurídica' },
      { regex: /^([A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚa-zñáéíóú\s&\.]{5,60})$/m, name: 'Nombre en mayúsculas inicio línea' },
      { regex: /(?:^|\n)\s*([A-ZÑÁÉÍÓÚ][A-ZÑÁÉÍÓÚa-zñáéíóú\s&\.]{10,80})\s*(?:\n|CIF|NIF)/im, name: 'Nombre antes de CIF' }
    ];

    for (const { regex, name } of namePatterns) {
      const matches = text.matchAll(regex);
      for (const match of matches) {
        const companyName = match[1].trim();
        // Avoid common false positives
        if (companyName.length > 5 &&
            companyName.length < 100 &&
            !companyName.includes('FACTURA') &&
            !companyName.includes('TOTAL') &&
            !companyName.includes('IVA')) {
          data.supplierName = companyName;
          stats.foundName = true;
          stats.patterns.push(`✓ Nombre: ${name}`);
          console.log('✅ Nombre de empresa encontrado:', data.supplierName, `(${name})`);
          break;
        }
      }
      if (stats.foundName) break;
    }
    if (!stats.foundName) {
      console.warn('⚠️ No se encontró nombre de empresa');
      stats.warnings.push('No se detectó nombre del proveedor');
    }

    // Extract amounts - improved with Spanish number format support
    const totalPatterns = [
      { regex: /(?:total|TOTAL|Total|Importe\s+Total)\s*:?\s*([\d\.,]+)\s*€?/gi, name: 'Total' },
      { regex: /(?:a\s+pagar|pagar)\s*:?\s*([\d\.,]+)\s*€?/gi, name: 'A pagar' }
    ];

    const allTotals = [];
    for (const { regex, name } of totalPatterns) {
      const matches = text.matchAll(regex);
      for (const match of matches) {
        const rawAmount = match[1];
        const amount = parseFloat(rawAmount.replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0 && amount < 1000000) {
          allTotals.push({ amount, name, raw: rawAmount });
          console.log(`💰 Total detectado: ${amount}€ (${name}, raw: ${rawAmount})`);
        }
      }
    }

    if (allTotals.length > 0) {
      // Use the largest amount as total
      data.total = Math.max(...allTotals.map(t => t.amount));
      stats.foundTotal = true;
      stats.patterns.push(`✓ Total: ${allTotals.length} candidato(s)`);
      console.log('✅ Total seleccionado:', data.total, '€');
    } else {
      console.warn('⚠️ No se encontró importe total');
      stats.warnings.push('No se detectó importe total');
    }

    // Extract base imponible
    const basePatterns = [
      { regex: /(?:base\s+imponible|base|subtotal)\s*:?\s*([\d\.,]+)\s*€?/gi, name: 'Base imponible' },
      { regex: /(?:neto|net|base\s+liquidable)\s*:?\s*([\d\.,]+)\s*€?/gi, name: 'Neto' }
    ];

    for (const { regex, name } of basePatterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          data.subtotal = amount;
          stats.foundBase = true;
          stats.patterns.push(`✓ Base: ${name}`);
          console.log('✅ Base imponible encontrada:', data.subtotal, '€', `(${name})`);
          break;
        }
      }
    }

    // Extract IVA - improved to find multiple rates
    const ivaPatterns = [
      { regex: /(?:IVA|I\.V\.A\.?)\s*(?:21%|10%|4%)?\s*:?\s*([\d\.,]+)\s*€?/gi, name: 'IVA con porcentaje' },
      { regex: /(?:VAT|tax|impuesto)\s*:?\s*([\d\.,]+)\s*€?/gi, name: 'IVA genérico' }
    ];

    const allIVAs = [];
    for (const { regex, name } of ivaPatterns) {
      const matches = text.matchAll(regex);
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          allIVAs.push({ amount, name });
          console.log(`💰 IVA detectado: ${amount}€ (${name})`);
        }
      }
    }

    if (allIVAs.length > 0) {
      // Sum all IVAs
      data.totalVAT = allIVAs.reduce((sum, iva) => sum + iva.amount, 0);
      stats.foundVAT = true;
      stats.patterns.push(`✓ IVA: ${allIVAs.length} encontrado(s)`);
      console.log('✅ IVA total:', data.totalVAT, '€');
    }

    // Calculate missing values and validate
    if (data.total > 0 && data.subtotal === 0 && data.totalVAT === 0) {
      // Assume 21% VAT
      data.subtotal = Math.round((data.total / 1.21) * 100) / 100;
      data.totalVAT = Math.round((data.total - data.subtotal) * 100) / 100;
      stats.warnings.push('Base e IVA calculados automáticamente (IVA 21%)');
      console.log('⚙️ Calculando base e IVA con 21%:', { base: data.subtotal, iva: data.totalVAT });
    } else if (data.subtotal > 0 && data.total === 0) {
      data.total = Math.round((data.subtotal + data.totalVAT) * 100) / 100;
      console.log('⚙️ Calculando total:', data.total, '€');
    } else if (data.total > 0 && data.subtotal > 0 && data.totalVAT === 0) {
      data.totalVAT = Math.round((data.total - data.subtotal) * 100) / 100;
      console.log('⚙️ Calculando IVA:', data.totalVAT, '€');
    }

    // Validate amounts
    const calculatedTotal = Math.round((data.subtotal + data.totalVAT) * 100) / 100;
    const totalDiff = Math.abs(data.total - calculatedTotal);
    if (totalDiff > 0.10 && data.total > 0 && data.subtotal > 0) {
      stats.warnings.push(`⚠️ Inconsistencia: Base (${data.subtotal}€) + IVA (${data.totalVAT}€) ≠ Total (${data.total}€)`);
      console.warn('⚠️ Los importes no cuadran:', { base: data.subtotal, iva: data.totalVAT, total: data.total, diff: totalDiff });
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

    // Extract description
    const descPatterns = [
      { regex: /(?:concepto|descripción|description|objeto)\s*:?\s*([^\n]{10,150})/i, name: 'Concepto con etiqueta' },
      { regex: /(?:servicios?|productos?|obra)\s+([^\n]{10,150})/i, name: 'Servicios/productos' }
    ];

    for (const { regex, name } of descPatterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        data.description = match[1].trim().substring(0, 200);
        stats.foundDescription = true;
        stats.patterns.push(`✓ Descripción: ${name}`);
        console.log('✅ Descripción encontrada:', data.description.substring(0, 50) + '...', `(${name})`);
        break;
      }
    }

    // If no description found, use first meaningful line
    if (!data.description && text.length > 20) {
      const lines = text.split('\n').filter(line =>
        line.trim().length > 15 &&
        !line.includes('FACTURA') &&
        !line.includes('CIF') &&
        !line.includes('€')
      );
      if (lines.length > 0) {
        data.description = lines[0].substring(0, 100);
        stats.foundDescription = true;
        console.log('ℹ️ Usando primera línea como descripción:', data.description);
      }
    }

    // Generate extraction report
    const foundFields = [
      stats.foundNumber,
      stats.foundDate,
      stats.foundTaxId,
      stats.foundName,
      stats.foundTotal || stats.foundBase
    ].filter(Boolean).length;

    stats.successRate = Math.round((foundFields / 5) * 100);
    console.log(`\n📊 Resumen de extracción: ${foundFields}/5 campos (${stats.successRate}%)`);
    console.log('✓ Patrones aplicados:', stats.patterns);
    if (stats.warnings.length > 0) {
      console.log('⚠️ Advertencias:', stats.warnings);
    }

    setExtractionStats(stats);
    return data;
  };

  const handleScanPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);
    setExtractionStats(null);

    try {
      console.log('🚀 Iniciando procesamiento de:', pdfFile.name);

      // Extract text from PDF
      const text = await extractTextFromPDF(pdfFile);
      console.log('✅ Texto extraído exitosamente');

      if (!text || text.trim().length < 50) {
        throw new Error('El PDF parece estar vacío o contiene muy poco texto. Puede ser una imagen escaneada sin OCR.');
      }

      setRawText(text);

      // Parse the text to extract invoice data
      const parsedData = parseInvoiceData(text);

      setExtractedData(parsedData);
      setIsProcessing(false);

      // Show success message with stats
      console.log('✅ Procesamiento completado');
    } catch (error) {
      console.error('❌ Error processing PDF:', error);
      setError(error.message || 'Error desconocido al procesar el PDF');
      setIsProcessing(false);

      // More user-friendly error messages
      let errorMsg = 'Error al procesar el PDF.';
      if (error.message.includes('vacío')) {
        errorMsg = 'El PDF no contiene texto legible. Puede ser una imagen escaneada.';
      } else if (error.message.includes('worker')) {
        errorMsg = 'Error al cargar el procesador de PDF. Verifica tu conexión a internet.';
      }

      alert(errorMsg + '\nPor favor, revisa la consola (F12) para más detalles o introduce los datos manualmente.');
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

              {error && (
                <div className="card mb-3" style={{ background: '#ffebee', borderLeft: '4px solid #f44336' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#c62828' }}>❌ Error en el Procesamiento</h4>
                  <p style={{ fontSize: '13px', margin: 0, color: '#c62828' }}>{error}</p>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    💡 Tip: Abre la consola del navegador (F12) para ver logs detallados del análisis.
                  </p>
                  <button
                    className="btn btn-outline mt-2"
                    onClick={handleScanPDF}
                    disabled={isProcessing}
                    style={{ fontSize: '13px' }}
                  >
                    🔄 Intentar de nuevo
                  </button>
                </div>
              )}

              <div className="card" style={{ background: '#e3f2fd', borderLeft: '4px solid #2196F3' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>🤖 OCR Real con Análisis Inteligente</h4>
                <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-secondary)' }}>
                  Sistema avanzado con <strong>PDF.js</strong> y análisis de patrones múltiples:
                </p>
                <ul style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-secondary)' }}>
                  <li><strong>Detección multi-patrón:</strong> 4+ formatos de números de factura</li>
                  <li><strong>Fechas inteligentes:</strong> DD/MM/YYYY, YYYY-MM-DD, ISO</li>
                  <li><strong>Validación NIF/CIF:</strong> Detecta múltiples identificadores fiscales</li>
                  <li><strong>Reconocimiento de razones sociales:</strong> Incluye formas jurídicas (SL, SA)</li>
                  <li><strong>Cálculo automático:</strong> Si falta base o IVA, se calcula automáticamente</li>
                  <li><strong>Estadísticas detalladas:</strong> Muestra qué se encontró y qué no</li>
                  <li><strong>Logs de depuración:</strong> Abre F12 para ver análisis completo</li>
                </ul>
              </div>

              {rawText && (
                <details className="card mt-3" style={{ background: '#f5f5f5', cursor: 'pointer' }} open={error ? true : false}>
                  <summary style={{ padding: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                    📝 Texto Extraído del PDF ({rawText.length} caracteres) - Click para {error ? 'ver' : 'expandir'}
                  </summary>
                  <div style={{
                    maxHeight: '300px',
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
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '8px', marginBottom: '4px' }}>
                    💡 Este es el texto que el sistema intentó analizar. Úsalo para entender qué detectó PDF.js.
                  </p>
                </details>
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

              {/* Extraction Statistics */}
              {extractionStats && (
                <div className="card mb-3" style={{
                  background: extractionStats.successRate >= 60 ? '#e8f5e9' : '#fff3e0',
                  borderLeft: `4px solid ${extractionStats.successRate >= 60 ? '#4caf50' : '#ff9800'}`
                }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>
                    📊 Estadísticas de Extracción ({extractionStats.successRate}%)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px' }}>
                      {extractionStats.foundNumber ? '✅' : '❌'} Número de factura
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {extractionStats.foundDate ? '✅' : '⚠️'} Fecha
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {extractionStats.foundTaxId ? '✅' : '❌'} NIF/CIF
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {extractionStats.foundName ? '✅' : '❌'} Nombre proveedor
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {extractionStats.foundTotal || extractionStats.foundBase ? '✅' : '❌'} Importes
                    </div>
                  </div>

                  {extractionStats.patterns.length > 0 && (
                    <details style={{ fontSize: '12px', marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '4px' }}>
                        🔍 Patrones detectados ({extractionStats.patterns.length})
                      </summary>
                      <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                        {extractionStats.patterns.map((pattern, idx) => (
                          <li key={idx} style={{ color: '#666' }}>{pattern}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {extractionStats.warnings.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '8px', background: '#fff3cd', borderRadius: '4px' }}>
                      <strong style={{ fontSize: '12px', color: '#856404' }}>⚠️ Advertencias:</strong>
                      <ul style={{ marginLeft: '20px', marginTop: '4px', marginBottom: 0 }}>
                        {extractionStats.warnings.map((warning, idx) => (
                          <li key={idx} style={{ fontSize: '12px', color: '#856404' }}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

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
