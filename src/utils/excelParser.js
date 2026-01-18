// Excel parser for Spanish bank statements
// Supports common Spanish bank formats (BBVA, Santander, CaixaBank, etc.)

export const parseSpanishBankStatement = (data) => {
  // This function expects data from XLSX library
  // Common columns: Fecha, Concepto, Cargo/Abono, Saldo

  const transactions = [];

  try {
    data.forEach((row, index) => {
      if (index === 0) return; // Skip header

      // Try to detect common Spanish bank formats
      const transaction = parseBankRow(row);
      if (transaction) {
        transactions.push(transaction);
      }
    });
  } catch (error) {
    console.error('Error parsing bank statement:', error);
  }

  return transactions;
};

const parseBankRow = (row) => {
  // Detect format based on column structure
  const keys = Object.keys(row);

  let date = null;
  let concept = '';
  let amount = 0;
  let balance = 0;
  let type = 'debit';

  // Try different Spanish bank formats
  for (const key of keys) {
    const lowerKey = key.toLowerCase();

    // Date detection
    if (lowerKey.includes('fecha') || lowerKey.includes('date')) {
      date = parseExcelDate(row[key]);
    }

    // Concept detection
    if (lowerKey.includes('concepto') || lowerKey.includes('descripción') ||
        lowerKey.includes('descripcion') || lowerKey.includes('detalle')) {
      concept = row[key];
    }

    // Amount detection (Cargo/Abono)
    if (lowerKey.includes('cargo') || lowerKey.includes('débito') || lowerKey.includes('debito')) {
      if (row[key] && row[key] !== '') {
        amount = -Math.abs(parseAmount(row[key]));
        type = 'debit';
      }
    }

    if (lowerKey.includes('abono') || lowerKey.includes('crédito') || lowerKey.includes('credito') ||
        lowerKey.includes('ingreso')) {
      if (row[key] && row[key] !== '') {
        amount = Math.abs(parseAmount(row[key]));
        type = 'credit';
      }
    }

    // Combined amount column (positive/negative)
    if (lowerKey.includes('importe') && !lowerKey.includes('cargo') && !lowerKey.includes('abono')) {
      const amt = parseAmount(row[key]);
      if (amt !== 0) {
        amount = amt;
        type = amt > 0 ? 'credit' : 'debit';
      }
    }

    // Balance detection
    if (lowerKey.includes('saldo')) {
      balance = parseAmount(row[key]);
    }
  }

  if (!date || amount === 0) return null;

  return {
    id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date,
    concept,
    amount,
    balance,
    type,
    reconciled: false,
    createdAt: new Date().toISOString(),
  };
};

const parseExcelDate = (value) => {
  if (!value) return null;

  // If it's already a Date object
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  // If it's an Excel serial number
  if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Try DD/MM/YYYY format
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toISOString().split('T')[0];
    }

    // Try parsing as ISO date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  return null;
};

const parseAmount = (value) => {
  if (value === null || value === undefined || value === '') return 0;

  // If it's already a number
  if (typeof value === 'number') return value;

  // If it's a string, clean it up
  if (typeof value === 'string') {
    // Remove currency symbols and spaces
    let cleaned = value.replace(/[€$\s]/g, '');

    // Spanish format uses . for thousands and , for decimals
    // Replace . with nothing, and , with .
    cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');

    // Parse as float
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  return 0;
};

export const detectBankFormat = (headers) => {
  const lowerHeaders = headers.map(h => h.toLowerCase());

  if (lowerHeaders.some(h => h.includes('santander'))) {
    return 'santander';
  }
  if (lowerHeaders.some(h => h.includes('bbva'))) {
    return 'bbva';
  }
  if (lowerHeaders.some(h => h.includes('caixa') || h.includes('caixabank'))) {
    return 'caixabank';
  }

  return 'generic';
};

export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        // This would normally use XLSX library
        // For now, we'll return a promise that the component can handle
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
