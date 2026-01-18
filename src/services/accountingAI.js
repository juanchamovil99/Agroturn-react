// AI-Powered Accounting Account Suggester
// Automatically suggests the best PGC accounts based on invoice type and description

import { SPANISH_CHART_OF_ACCOUNTS } from '../config/chartOfAccounts';

// Categories and their associated keywords
const EXPENSE_CATEGORIES = {
  // Services
  services: {
    keywords: ['servicio', 'asesor', 'consultor', 'mantenimiento', 'reparaci', 'limpieza', 'seguridad'],
    accounts: {
      debit: '623', // Servicios de Profesionales Independientes
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Telecommunications
  telecom: {
    keywords: ['telefon', 'internet', 'fibra', 'movil', 'telecomun', 'datos', 'vodafone', 'movistar', 'orange', 'telecable'],
    accounts: {
      debit: '629', // Otros Servicios (Comunicaciones)
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Utilities
  utilities: {
    keywords: ['luz', 'agua', 'gas', 'electricidad', 'suministro', 'energia', 'iberdrola', 'endesa', 'naturgy'],
    accounts: {
      debit: '628', // Suministros
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Rent
  rent: {
    keywords: ['alquiler', 'arrendamiento', 'renta', 'local', 'oficina', 'nave'],
    accounts: {
      debit: '621', // Arrendamientos y Cánones
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Insurance
  insurance: {
    keywords: ['seguro', 'prima', 'poliza', 'aseguradora', 'mutua'],
    accounts: {
      debit: '625', // Primas de Seguros
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Transportation
  transport: {
    keywords: ['transporte', 'mensajer', 'envio', 'correos', 'ups', 'seur', 'mrw', 'gasolina', 'diesel', 'combustible'],
    accounts: {
      debit: '624', // Transportes
      credit: '400', // Proveedores
    },
  },

  // Marketing & Advertising
  marketing: {
    keywords: ['publicidad', 'marketing', 'anuncio', 'propaganda', 'relaciones publicas', 'social media', 'seo', 'ads', 'google ads'],
    accounts: {
      debit: '627', // Publicidad, Propaganda y Relaciones Públicas
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Banking
  banking: {
    keywords: ['banco', 'comision', 'bancari', 'tarjeta', 'transferencia', 'tpv', 'bbva', 'santander', 'caixa'],
    accounts: {
      debit: '626', // Servicios Bancarios y Similares
      credit: '572', // Bancos c/c
    },
  },

  // Staff/Payroll
  payroll: {
    keywords: ['nomina', 'sueldo', 'salario', 'empleado', 'trabajador', 'seguridad social', 'irpf'],
    accounts: {
      debit: '640', // Sueldos y Salarios
      credit: '465', // Remuneraciones Pendientes de Pago
    },
  },

  // Purchases - Merchandise
  merchandise: {
    keywords: ['mercancia', 'compra', 'producto', 'stock', 'inventario'],
    accounts: {
      debit: '600', // Compras de Mercaderías
      credit: '400', // Proveedores
    },
  },

  // Purchases - Raw Materials
  materials: {
    keywords: ['materia prima', 'material', 'componente', 'insumo'],
    accounts: {
      debit: '601', // Compras de Materias Primas
      credit: '400', // Proveedores
    },
  },

  // Office Supplies
  office: {
    keywords: ['papeler', 'oficina', 'material de oficina', 'toner', 'cartucho', 'folio'],
    accounts: {
      debit: '629', // Otros Servicios
      credit: '400', // Proveedores
    },
  },

  // IT & Software
  software: {
    keywords: ['software', 'licencia', 'microsoft', 'adobe', 'hosting', 'dominio', 'cloud', 'saas', 'aplicacion'],
    accounts: {
      debit: '629', // Otros Servicios
      credit: '410', // Acreedores por Prestaciones de Servicios
    },
  },

  // Equipment/Assets
  equipment: {
    keywords: ['equipo', 'maquinaria', 'ordenador', 'portatil', 'impresora', 'mobiliario', 'mueble'],
    accounts: {
      debit: '217', // Equipos para Procesos de Información (or 213/216 depending on type)
      credit: '523', // Proveedores de Inmovilizado a Corto Plazo
    },
  },
};

const INCOME_CATEGORIES = {
  // Sales - Merchandise
  merchandise: {
    keywords: ['venta', 'producto', 'mercancia'],
    accounts: {
      debit: '430', // Clientes
      credit: '700', // Ventas de Mercaderías
    },
  },

  // Sales - Finished Products
  products: {
    keywords: ['producto terminado', 'fabricacion', 'produccion'],
    accounts: {
      debit: '430', // Clientes
      credit: '701', // Ventas de Productos Terminados
    },
  },

  // Services
  services: {
    keywords: ['servicio', 'consultor', 'asesor', 'mantenimiento', 'desarrollo', 'diseño'],
    accounts: {
      debit: '430', // Clientes
      credit: '705', // Prestaciones de Servicios
    },
  },
};

// Suggest accounts based on invoice description and type
export const suggestAccountsForInvoice = (description, type = 'expense') => {
  const lowerDesc = description.toLowerCase();

  if (type === 'expense' || type === 'received') {
    // Check each expense category
    for (const [category, config] of Object.entries(EXPENSE_CATEGORIES)) {
      const hasKeyword = config.keywords.some(keyword => lowerDesc.includes(keyword));

      if (hasKeyword) {
        return {
          category,
          categoryName: getCategoryName(category),
          debitAccount: config.accounts.debit,
          creditAccount: config.accounts.credit,
          debitAccountName: getAccountName(config.accounts.debit),
          creditAccountName: getAccountName(config.accounts.credit),
          confidence: calculateConfidence(lowerDesc, config.keywords),
        };
      }
    }

    // Default for expenses
    return {
      category: 'other',
      categoryName: 'Otros Gastos',
      debitAccount: '629',
      creditAccount: '400',
      debitAccountName: 'Otros Servicios',
      creditAccountName: 'Proveedores',
      confidence: 0.5,
    };
  } else {
    // Income/Issued invoices
    for (const [category, config] of Object.entries(INCOME_CATEGORIES)) {
      const hasKeyword = config.keywords.some(keyword => lowerDesc.includes(keyword));

      if (hasKeyword) {
        return {
          category,
          categoryName: getCategoryName(category),
          debitAccount: config.accounts.debit,
          creditAccount: config.accounts.credit,
          debitAccountName: getAccountName(config.accounts.debit),
          creditAccountName: getAccountName(config.accounts.credit),
          confidence: calculateConfidence(lowerDesc, config.keywords),
        };
      }
    }

    // Default for income (services)
    return {
      category: 'services',
      categoryName: 'Prestación de Servicios',
      debitAccount: '430',
      creditAccount: '705',
      debitAccountName: 'Clientes',
      creditAccountName: 'Prestaciones de Servicios',
      confidence: 0.5,
    };
  }
};

// Get account name from code
const getAccountName = (code) => {
  const account = SPANISH_CHART_OF_ACCOUNTS.find(acc => acc.code === code);
  return account ? account.name : code;
};

// Get category friendly name
const getCategoryName = (category) => {
  const names = {
    services: 'Servicios Profesionales',
    telecom: 'Telecomunicaciones',
    utilities: 'Suministros',
    rent: 'Arrendamiento',
    insurance: 'Seguros',
    transport: 'Transporte',
    marketing: 'Publicidad',
    banking: 'Servicios Bancarios',
    payroll: 'Nóminas',
    merchandise: 'Compra de Mercancías',
    materials: 'Materias Primas',
    office: 'Material de Oficina',
    software: 'Software y Licencias',
    equipment: 'Equipamiento',
    products: 'Venta de Productos',
  };
  return names[category] || 'Otros';
};

// Calculate confidence based on keyword matches
const calculateConfidence = (text, keywords) => {
  let matchCount = 0;
  keywords.forEach(keyword => {
    if (text.includes(keyword)) matchCount++;
  });

  // Base confidence + bonus for multiple matches
  const baseConfidence = 0.7;
  const bonus = Math.min(matchCount * 0.1, 0.3);
  return Math.min(baseConfidence + bonus, 1.0);
};

// Generate accounting entry from invoice
export const generateAccountingEntry = (invoice, type = 'expense') => {
  const isExpense = type === 'expense' || type === 'received';

  // Get description from first item or use default
  const description = invoice.items && invoice.items.length > 0
    ? invoice.items[0].description
    : invoice.supplier?.name || invoice.client?.name || '';

  // Get AI suggestion
  const suggestion = suggestAccountsForInvoice(description, type);

  // Create accounting entry (asiento)
  const entry = {
    id: `entry_${Date.now()}`,
    invoiceId: invoice.id,
    date: invoice.date,
    description: isExpense
      ? `Factura recibida: ${invoice.supplier?.name || 'Proveedor'}`
      : `Factura emitida: ${invoice.client?.name || 'Cliente'}`,
    type,
    category: suggestion.category,
    lines: [],
  };

  if (isExpense) {
    // EXPENSE: Debit expense account, Credit supplier/creditor
    // Line 1: Debit expense
    entry.lines.push({
      account: suggestion.debitAccount,
      accountName: suggestion.debitAccountName,
      debit: invoice.subtotal || 0,
      credit: 0,
      description: description.substring(0, 100),
    });

    // Line 2: Debit VAT
    if (invoice.vat > 0) {
      entry.lines.push({
        account: '472',
        accountName: 'H.P. IVA Soportado',
        debit: invoice.vat,
        credit: 0,
        description: `IVA ${(invoice.vatRate * 100).toFixed(0)}%`,
      });
    }

    // Line 3: Credit supplier (total)
    entry.lines.push({
      account: suggestion.creditAccount,
      accountName: suggestion.creditAccountName,
      debit: 0,
      credit: invoice.total || 0,
      description: invoice.supplier?.name || 'Proveedor',
    });
  } else {
    // INCOME: Debit client, Credit income account
    // Line 1: Debit client (total)
    entry.lines.push({
      account: suggestion.debitAccount,
      accountName: suggestion.debitAccountName,
      debit: invoice.total || 0,
      credit: 0,
      description: invoice.client?.name || 'Cliente',
    });

    // Line 2: Credit income
    entry.lines.push({
      account: suggestion.creditAccount,
      accountName: suggestion.creditAccountName,
      debit: 0,
      credit: invoice.subtotal || 0,
      description: description.substring(0, 100),
    });

    // Line 3: Credit VAT
    if (invoice.vat > 0) {
      entry.lines.push({
        account: '477',
        accountName: 'H.P. IVA Repercutido',
        debit: 0,
        credit: invoice.vat,
        description: `IVA ${(invoice.vatRate * 100).toFixed(0)}%`,
      });
    }
  }

  return { entry, suggestion };
};

// Get all possible categories for manual selection
export const getExpenseCategories = () => {
  return Object.entries(EXPENSE_CATEGORIES).map(([key, config]) => ({
    id: key,
    name: getCategoryName(key),
    accounts: config.accounts,
    keywords: config.keywords,
  }));
};

export const getIncomeCategories = () => {
  return Object.entries(INCOME_CATEGORIES).map(([key, config]) => ({
    id: key,
    name: getCategoryName(key),
    accounts: config.accounts,
    keywords: config.keywords,
  }));
};
