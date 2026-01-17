// Plan General Contable Español (Spanish Chart of Accounts)
// Based on PGC 2007 for SMEs

export const PGC_GROUPS = {
  1: 'Financiación Básica',
  2: 'Activo no corriente',
  3: 'Existencias',
  4: 'Acreedores y deudores por operaciones comerciales',
  5: 'Cuentas financieras',
  6: 'Compras y gastos',
  7: 'Ventas e ingresos',
  8: 'Gastos imputados al patrimonio neto',
  9: 'Ingresos imputados al patrimonio neto'
};

export const CHART_OF_ACCOUNTS = [
  // Grupo 1: Financiación Básica
  { code: '100', name: 'Capital social', group: 1, type: 'equity' },
  { code: '129', name: 'Resultado del ejercicio', group: 1, type: 'equity' },
  { code: '170', name: 'Deudas a largo plazo con entidades de crédito', group: 1, type: 'liability' },

  // Grupo 2: Activo no corriente
  { code: '206', name: 'Aplicaciones informáticas', group: 2, type: 'asset' },
  { code: '210', name: 'Terrenos y bienes naturales', group: 2, type: 'asset' },
  { code: '211', name: 'Construcciones', group: 2, type: 'asset' },
  { code: '213', name: 'Maquinaria', group: 2, type: 'asset' },
  { code: '216', name: 'Mobiliario', group: 2, type: 'asset' },
  { code: '217', name: 'Equipos para procesos de información', group: 2, type: 'asset' },
  { code: '218', name: 'Elementos de transporte', group: 2, type: 'asset' },
  { code: '281', name: 'Amortización acumulada del inmovilizado material', group: 2, type: 'asset_contra' },

  // Grupo 3: Existencias
  { code: '300', name: 'Mercaderías A', group: 3, type: 'asset' },
  { code: '350', name: 'Productos terminados', group: 3, type: 'asset' },

  // Grupo 4: Acreedores y deudores
  { code: '400', name: 'Proveedores', group: 4, type: 'liability' },
  { code: '410', name: 'Acreedores por prestaciones de servicios', group: 4, type: 'liability' },
  { code: '430', name: 'Clientes', group: 4, type: 'asset' },
  { code: '436', name: 'Clientes de dudoso cobro', group: 4, type: 'asset' },
  { code: '440', name: 'Deudores', group: 4, type: 'asset' },
  { code: '465', name: 'Remuneraciones pendientes de pago', group: 4, type: 'liability' },
  { code: '470', name: 'Hacienda Pública, deudora por diversos conceptos', group: 4, type: 'asset' },
  { code: '472', name: 'Hacienda Pública, IVA soportado', group: 4, type: 'asset' },
  { code: '473', name: 'Hacienda Pública, retenciones y pagos a cuenta', group: 4, type: 'liability' },
  { code: '475', name: 'Hacienda Pública, acreedora por conceptos fiscales', group: 4, type: 'liability' },
  { code: '477', name: 'Hacienda Pública, IVA repercutido', group: 4, type: 'liability' },

  // Grupo 5: Cuentas financieras
  { code: '520', name: 'Deudas a corto plazo con entidades de crédito', group: 5, type: 'liability' },
  { code: '570', name: 'Caja, euros', group: 5, type: 'asset' },
  { code: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', group: 5, type: 'asset' },

  // Grupo 6: Compras y gastos
  { code: '600', name: 'Compras de mercaderías', group: 6, type: 'expense' },
  { code: '621', name: 'Arrendamientos y cánones', group: 6, type: 'expense' },
  { code: '623', name: 'Servicios de profesionales independientes', group: 6, type: 'expense' },
  { code: '624', name: 'Transportes', group: 6, type: 'expense' },
  { code: '625', name: 'Primas de seguros', group: 6, type: 'expense' },
  { code: '626', name: 'Servicios bancarios y similares', group: 6, type: 'expense' },
  { code: '627', name: 'Publicidad, propaganda y relaciones públicas', group: 6, type: 'expense' },
  { code: '628', name: 'Suministros', group: 6, type: 'expense' },
  { code: '629', name: 'Otros servicios', group: 6, type: 'expense' },
  { code: '640', name: 'Sueldos y salarios', group: 6, type: 'expense' },
  { code: '642', name: 'Seguridad Social a cargo de la empresa', group: 6, type: 'expense' },
  { code: '681', name: 'Amortización del inmovilizado material', group: 6, type: 'expense' },

  // Grupo 7: Ventas e ingresos
  { code: '700', name: 'Ventas de mercaderías', group: 7, type: 'income' },
  { code: '705', name: 'Prestaciones de servicios', group: 7, type: 'income' },
  { code: '708', name: 'Devoluciones de ventas y operaciones similares', group: 7, type: 'income_contra' },
  { code: '709', name: 'Rappels sobre ventas', group: 7, type: 'income_contra' },
  { code: '760', name: 'Ingresos de participaciones en instrumentos de patrimonio', group: 7, type: 'income' },
  { code: '769', name: 'Otros ingresos financieros', group: 7, type: 'income' }
];

export const VAT_RATES = {
  GENERAL: 0.21,    // 21% - Tipo general
  REDUCED: 0.10,    // 10% - Tipo reducido
  SUPER_REDUCED: 0.04, // 4% - Tipo superreducido
  EXEMPT: 0         // 0% - Exento
};

export const IRPF_RATES = {
  PROFESSIONAL: 0.15,  // 15% - Profesionales
  RENTAL: 0.19         // 19% - Alquileres
};

export function getAccountByCode(code) {
  return CHART_OF_ACCOUNTS.find(acc => acc.code === code);
}

export function getAccountsByGroup(group) {
  return CHART_OF_ACCOUNTS.filter(acc => acc.group === group);
}

export function getAccountsByType(type) {
  return CHART_OF_ACCOUNTS.filter(acc => acc.type === type);
}
