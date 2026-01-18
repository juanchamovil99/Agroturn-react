// PDF Invoice Parser for Spanish Invoices
// Extracts data from PDF invoices using text extraction and pattern matching

export const extractInvoiceDataFromPDF = async (file) => {
  try {
    const text = await extractTextFromPDF(file);
    const invoiceData = parseSpanishInvoice(text);
    return invoiceData;
  } catch (error) {
    console.error('Error extracting invoice data:', error);
    throw error;
  }
};

// Extract text from PDF using native browser APIs
const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert PDF bytes to text (simple extraction for text-based PDFs)
        // This works for PDFs that contain actual text, not scanned images
        const text = extractTextFromPDFBytes(uint8Array);

        if (!text || text.trim().length < 50) {
          reject(new Error('No se pudo extraer texto del PDF. Puede ser un PDF escaneado que requiere OCR.'));
          return;
        }

        resolve(text);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo PDF'));
    reader.readAsArrayBuffer(file);
  });
};

// Extract text from PDF bytes (simplified approach)
const extractTextFromPDFBytes = (uint8Array) => {
  try {
    // Convert bytes to string
    let text = '';

    // PDF text is often stored in stream objects
    // Look for text between BT (Begin Text) and ET (End Text) markers
    const pdfString = new TextDecoder('latin1').decode(uint8Array);

    // Extract text content from PDF streams
    // Method 1: Look for text in stream objects
    const streamRegex = /BT\s+(.*?)\s+ET/gs;
    const matches = pdfString.matchAll(streamRegex);

    for (const match of matches) {
      const streamContent = match[1];
      // Extract text from Tj and TJ operators
      const textMatches = streamContent.matchAll(/\((.*?)\)\s*Tj/g);
      for (const textMatch of textMatches) {
        text += decodeURIComponent(escape(textMatch[1])) + ' ';
      }

      // Also check for array format [(text)] TJ
      const arrayMatches = streamContent.matchAll(/\[(.*?)\]\s*TJ/g);
      for (const arrayMatch of arrayMatches) {
        const arrayContent = arrayMatch[1];
        const innerTextMatches = arrayContent.matchAll(/\((.*?)\)/g);
        for (const innerMatch of innerTextMatches) {
          text += decodeURIComponent(escape(innerMatch[1])) + ' ';
        }
      }
    }

    // Method 2: Also try to extract from any parentheses (common in PDFs)
    if (text.length < 100) {
      const simpleMatches = pdfString.matchAll(/\(([^)]+)\)/g);
      for (const match of simpleMatches) {
        const cleaned = match[1]
          .replace(/\\[0-9]{3}/g, '') // Remove octal codes
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        if (cleaned.length > 2 && !cleaned.includes('<<') && !cleaned.includes('>>')) {
          text += cleaned + ' ';
        }
      }
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .trim();

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF bytes:', error);
    return '';
  }
};

// Parse Spanish invoice data from extracted text
const parseSpanishInvoice = (text) => {
  const data = {
    number: '',
    date: '',
    supplier: {
      name: '',
      nif: '',
      address: '',
      city: '',
      postalCode: '',
    },
    subtotal: 0,
    vat: 0,
    total: 0,
    vatRate: 0.21,
    items: [],
  };

  // Extract invoice number
  const invoiceNumberPatterns = [
    /(?:factura|invoice|n[úu]mero|number|n[º°])\s*:?\s*([A-Z0-9\/-]+)/i,
    /(?:fact|inv)[.\s]*(?:n[º°]?|num)?[:\s]*([A-Z0-9\/-]+)/i,
  ];

  for (const pattern of invoiceNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.number = match[1].trim();
      break;
    }
  }

  // Extract date (Spanish format DD/MM/YYYY or DD-MM-YYYY)
  const datePatterns = [
    /(?:fecha|date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.date = parseSpanishDateString(match[1]);
      break;
    }
  }

  // Extract NIF/CIF (Spanish tax ID format)
  const nifPatterns = [
    /(?:NIF|CIF|DNI)[:\s]*([A-Z]?\d{7,8}[A-Z0-9])/i,
    /\b([A-Z]\d{7}[A-Z0-9])\b/,
    /\b(\d{8}[A-Z])\b/,
  ];

  for (const pattern of nifPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.supplier.nif = match[1].trim().toUpperCase();
      break;
    }
  }

  // Extract supplier name (usually near the top, before NIF)
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    // Look for company-like names (capitalized words, S.L., S.A., etc.)
    if (line.length > 5 && line.length < 80) {
      if (/[A-ZÁÉÍÓÚÑ]/.test(line) &&
          (line.includes('S.L.') || line.includes('S.A.') ||
           line.includes('SL') || line.includes('SA') ||
           /^[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(line))) {
        data.supplier.name = line;
        break;
      }
    }
  }

  // Extract postal code (5 digits in Spain)
  const postalCodeMatch = text.match(/\b(\d{5})\b/);
  if (postalCodeMatch) {
    data.supplier.postalCode = postalCodeMatch[1];
  }

  // Extract amounts (looking for Base Imponible, IVA, Total)
  const amountPatterns = [
    { key: 'subtotal', patterns: [
      /(?:base\s*imponible|subtotal|base)[:\s]*(\d{1,10}[,\.]\d{2})/i,
    ]},
    { key: 'vat', patterns: [
      /(?:IVA|I\.V\.A)[^:]*[:\s]*(\d{1,10}[,\.]\d{2})/i,
    ]},
    { key: 'total', patterns: [
      /(?:total|importe\s*total)[:\s]*(\d{1,10}[,\.]\d{2})/i,
    ]},
  ];

  for (const { key, patterns } of amountPatterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data[key] = parseSpanishAmount(match[1]);
        break;
      }
    }
  }

  // If subtotal is 0 but we have total, try to calculate
  if (data.subtotal === 0 && data.total > 0) {
    // Assume 21% VAT
    data.subtotal = data.total / 1.21;
    data.vat = data.total - data.subtotal;
  } else if (data.subtotal > 0 && data.vat === 0) {
    data.vat = data.subtotal * 0.21;
  }

  if (data.total === 0 && data.subtotal > 0) {
    data.total = data.subtotal + data.vat;
  }

  // Detect VAT rate
  const vatRateMatch = text.match(/(?:IVA|I\.V\.A)[^0-9]*(\d{1,2})%/i);
  if (vatRateMatch) {
    data.vatRate = parseInt(vatRateMatch[1]) / 100;
  }

  return data;
};

// Parse Spanish date string (DD/MM/YYYY or DD-MM-YYYY) to YYYY-MM-DD
const parseSpanishDateString = (dateStr) => {
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];

    // Handle 2-digit years
    if (year.length === 2) {
      year = '20' + year;
    }

    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split('T')[0];
};

// Parse Spanish amount (1.234,56 or 1234,56) to number
const parseSpanishAmount = (amountStr) => {
  // Remove spaces and dots (thousands separator)
  // Replace comma with dot (decimal separator)
  const cleaned = amountStr
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
};

// Check if PDF is likely a scanned image (no extractable text)
export const isPDFScanned = async (file) => {
  try {
    const text = await extractTextFromPDF(file);
    return !text || text.trim().length < 50;
  } catch {
    return true;
  }
};
