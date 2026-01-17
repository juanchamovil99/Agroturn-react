// Utility functions for the accounting app

// Format currency in EUR
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Format date in Spanish format
export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES').format(new Date(date));
}

// Format date for input fields
export function formatDateInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate invoice number
export function generateInvoiceNumber(year, sequence) {
  return `${year}/${String(sequence).padStart(4, '0')}`;
}

// Calculate VAT
export function calculateVAT(baseAmount, vatRate) {
  return baseAmount * vatRate;
}

// Calculate total with VAT
export function calculateTotal(baseAmount, vatRate) {
  return baseAmount + calculateVAT(baseAmount, vatRate);
}

// Calculate IRPF (retention)
export function calculateIRPF(amount, irpfRate) {
  return amount * irpfRate;
}

// Validate Spanish NIF/CIF
export function validateNIF(nif) {
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  if (!nifRegex.test(nif)) return false;

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(nif.substr(0, 8), 10);
  const letter = nif.substr(8, 1);

  return letters[number % 23] === letter;
}

export function validateCIF(cif) {
  const cifRegex = /^[A-Z][0-9]{7}[0-9A-J]$/;
  return cifRegex.test(cif);
}

export function validateNIFCIF(id) {
  return validateNIF(id) || validateCIF(id);
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Parse Excel date (Excel stores dates as numbers)
export function parseExcelDate(excelDate) {
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  }
  return new Date(excelDate);
}

// Format number for Spanish locale
export function formatNumber(number, decimals = 2) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

// Calculate invoice total from items
export function calculateInvoiceTotal(items) {
  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const vat = subtotal * (item.vatRate || 0);
    const irpf = subtotal * (item.irpfRate || 0);
    return total + subtotal + vat - irpf;
  }, 0);
}

// Calculate invoice subtotal (without VAT)
export function calculateInvoiceSubtotal(items) {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unitPrice);
  }, 0);
}

// Calculate total VAT from items
export function calculateInvoiceTotalVAT(items) {
  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.unitPrice;
    return total + (subtotal * (item.vatRate || 0));
  }, 0);
}

// Calculate total IRPF from items
export function calculateInvoiceTotalIRPF(items) {
  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.unitPrice;
    return total + (subtotal * (item.irpfRate || 0));
  }, 0);
}

// Download data as JSON
export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Export to CSV
export function exportToCSV(data, filename) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(';'),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(';')
        ? `"${value}"`
        : value;
    }).join(';'))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Get current fiscal year
export function getCurrentFiscalYear() {
  return new Date().getFullYear();
}

// Get fiscal year from date
export function getFiscalYear(date) {
  return new Date(date).getFullYear();
}

// Calculate balance from accounting entries
export function calculateBalance(entries, accountCode) {
  return entries
    .filter(entry => entry.account === accountCode)
    .reduce((balance, entry) => {
      return balance + (entry.debit || 0) - (entry.credit || 0);
    }, 0);
}
