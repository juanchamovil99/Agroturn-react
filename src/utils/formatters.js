// Spanish formatters for currency, dates, and numbers

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const parseSpanishDate = (dateString) => {
  // Parse DD/MM/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateString);
};

export const generateInvoiceNumber = (prefix, sequence) => {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(5, '0');
  return `${prefix}${year}/${paddedSequence}`;
};

export const calculateVAT = (base, rate) => {
  return base * rate;
};

export const calculateTotal = (base, vatRate, retentionRate = 0) => {
  const vat = calculateVAT(base, vatRate);
  const retention = base * retentionRate;
  return base + vat - retention;
};

export const validateNIF = (nif) => {
  // Basic NIF/CIF validation for Spain
  if (!nif) return false;
  const nifRegex = /^[XYZ0-9][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/i;
  return nifRegex.test(nif) || cifRegex.test(nif);
};

export const validateIBAN = (iban) => {
  // Basic IBAN validation for Spain
  if (!iban) return false;
  const ibanRegex = /^ES\d{22}$/i;
  return ibanRegex.test(iban.replace(/\s/g, ''));
};

export const formatIBAN = (iban) => {
  if (!iban) return '';
  const cleaned = iban.replace(/\s/g, '');
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
};

export const formatNIF = (nif) => {
  if (!nif) return '';
  return nif.toUpperCase().replace(/\s/g, '');
};
