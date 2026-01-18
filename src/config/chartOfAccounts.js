// Plan General de Contabilidad - Spanish Chart of Accounts
// Following Spanish accounting standards (PGC)

export const SPANISH_CHART_OF_ACCOUNTS = [
  // Grupo 1 - Financiación Básica
  { code: '100', name: 'Capital Social', category: 'Patrimonio Neto', type: 'credit' },
  { code: '112', name: 'Reserva Legal', category: 'Patrimonio Neto', type: 'credit' },
  { code: '113', name: 'Reservas Voluntarias', category: 'Patrimonio Neto', type: 'credit' },
  { code: '129', name: 'Resultado del Ejercicio', category: 'Patrimonio Neto', type: 'credit' },
  { code: '170', name: 'Deudas a Largo Plazo con Entidades de Crédito', category: 'Pasivo No Corriente', type: 'credit' },

  // Grupo 2 - Activo No Corriente
  { code: '206', name: 'Aplicaciones Informáticas', category: 'Inmovilizado Intangible', type: 'debit' },
  { code: '210', name: 'Terrenos y Bienes Naturales', category: 'Inmovilizado Material', type: 'debit' },
  { code: '211', name: 'Construcciones', category: 'Inmovilizado Material', type: 'debit' },
  { code: '213', name: 'Maquinaria', category: 'Inmovilizado Material', type: 'debit' },
  { code: '216', name: 'Mobiliario', category: 'Inmovilizado Material', type: 'debit' },
  { code: '217', name: 'Equipos para Procesos de Información', category: 'Inmovilizado Material', type: 'debit' },
  { code: '218', name: 'Elementos de Transporte', category: 'Inmovilizado Material', type: 'debit' },
  { code: '281', name: 'Amortización Acumulada del Inmovilizado Intangible', category: 'Inmovilizado', type: 'credit' },
  { code: '282', name: 'Amortización Acumulada del Inmovilizado Material', category: 'Inmovilizado', type: 'credit' },

  // Grupo 3 - Existencias
  { code: '300', name: 'Mercaderías A', category: 'Existencias', type: 'debit' },
  { code: '350', name: 'Productos Terminados', category: 'Existencias', type: 'debit' },

  // Grupo 4 - Acreedores y Deudores
  { code: '400', name: 'Proveedores', category: 'Pasivo Corriente', type: 'credit' },
  { code: '410', name: 'Acreedores por Prestaciones de Servicios', category: 'Pasivo Corriente', type: 'credit' },
  { code: '430', name: 'Clientes', category: 'Activo Corriente', type: 'debit' },
  { code: '431', name: 'Clientes, Efectos Comerciales a Cobrar', category: 'Activo Corriente', type: 'debit' },
  { code: '436', name: 'Clientes de Dudoso Cobro', category: 'Activo Corriente', type: 'debit' },
  { code: '440', name: 'Deudores', category: 'Activo Corriente', type: 'debit' },
  { code: '460', name: 'Anticipos de Remuneraciones', category: 'Activo Corriente', type: 'debit' },
  { code: '465', name: 'Remuneraciones Pendientes de Pago', category: 'Pasivo Corriente', type: 'credit' },
  { code: '470', name: 'Hacienda Pública, Deudora por Diversos Conceptos', category: 'Activo Corriente', type: 'debit' },
  { code: '472', name: 'Hacienda Pública, IVA Soportado', category: 'Activo Corriente', type: 'debit' },
  { code: '473', name: 'Hacienda Pública, Retenciones y Pagos a Cuenta', category: 'Activo Corriente', type: 'debit' },
  { code: '475', name: 'Hacienda Pública, Acreedora por Conceptos Fiscales', category: 'Pasivo Corriente', type: 'credit' },
  { code: '477', name: 'Hacienda Pública, IVA Repercutido', category: 'Pasivo Corriente', type: 'credit' },
  { code: '476', name: 'Organismos de la Seguridad Social, Acreedores', category: 'Pasivo Corriente', type: 'credit' },

  // Grupo 5 - Cuentas Financieras
  { code: '520', name: 'Deudas a Corto Plazo con Entidades de Crédito', category: 'Pasivo Corriente', type: 'credit' },
  { code: '521', name: 'Deudas a Corto Plazo', category: 'Pasivo Corriente', type: 'credit' },
  { code: '523', name: 'Proveedores de Inmovilizado a Corto Plazo', category: 'Pasivo Corriente', type: 'credit' },
  { code: '570', name: 'Caja, Euros', category: 'Tesorería', type: 'debit' },
  { code: '572', name: 'Bancos e Instituciones de Crédito c/c Vista, Euros', category: 'Tesorería', type: 'debit' },

  // Grupo 6 - Compras y Gastos
  { code: '600', name: 'Compras de Mercaderías', category: 'Compras', type: 'debit' },
  { code: '601', name: 'Compras de Materias Primas', category: 'Compras', type: 'debit' },
  { code: '606', name: 'Descuentos sobre Compras por Pronto Pago', category: 'Compras', type: 'credit' },
  { code: '621', name: 'Arrendamientos y Cánones', category: 'Gastos', type: 'debit' },
  { code: '622', name: 'Reparaciones y Conservación', category: 'Gastos', type: 'debit' },
  { code: '623', name: 'Servicios de Profesionales Independientes', category: 'Gastos', type: 'debit' },
  { code: '624', name: 'Transportes', category: 'Gastos', type: 'debit' },
  { code: '625', name: 'Primas de Seguros', category: 'Gastos', type: 'debit' },
  { code: '626', name: 'Servicios Bancarios y Similares', category: 'Gastos', type: 'debit' },
  { code: '627', name: 'Publicidad, Propaganda y Relaciones Públicas', category: 'Gastos', type: 'debit' },
  { code: '628', name: 'Suministros', category: 'Gastos', type: 'debit' },
  { code: '629', name: 'Otros Servicios', category: 'Gastos', type: 'debit' },
  { code: '640', name: 'Sueldos y Salarios', category: 'Gastos de Personal', type: 'debit' },
  { code: '642', name: 'Seguridad Social a Cargo de la Empresa', category: 'Gastos de Personal', type: 'debit' },
  { code: '649', name: 'Otros Gastos Sociales', category: 'Gastos de Personal', type: 'debit' },
  { code: '662', name: 'Intereses de Deudas', category: 'Gastos Financieros', type: 'debit' },
  { code: '669', name: 'Otros Gastos Financieros', category: 'Gastos Financieros', type: 'debit' },
  { code: '678', name: 'Gastos Excepcionales', category: 'Gastos Excepcionales', type: 'debit' },
  { code: '681', name: 'Amortización del Inmovilizado Intangible', category: 'Amortizaciones', type: 'debit' },
  { code: '682', name: 'Amortización del Inmovilizado Material', category: 'Amortizaciones', type: 'debit' },

  // Grupo 7 - Ventas e Ingresos
  { code: '700', name: 'Ventas de Mercaderías', category: 'Ventas', type: 'credit' },
  { code: '701', name: 'Ventas de Productos Terminados', category: 'Ventas', type: 'credit' },
  { code: '705', name: 'Prestaciones de Servicios', category: 'Ventas', type: 'credit' },
  { code: '706', name: 'Descuentos sobre Ventas por Pronto Pago', category: 'Ventas', type: 'debit' },
  { code: '708', name: 'Devoluciones de Ventas y Operaciones Similares', category: 'Ventas', type: 'debit' },
  { code: '709', name: 'Rappels sobre Ventas', category: 'Ventas', type: 'debit' },
  { code: '760', name: 'Ingresos de Participaciones en Instrumentos de Patrimonio', category: 'Ingresos Financieros', type: 'credit' },
  { code: '762', name: 'Ingresos de Créditos', category: 'Ingresos Financieros', type: 'credit' },
  { code: '769', name: 'Otros Ingresos Financieros', category: 'Ingresos Financieros', type: 'credit' },
  { code: '778', name: 'Ingresos Excepcionales', category: 'Ingresos Excepcionales', type: 'credit' },
];

export const VAT_RATES = [
  { code: '21', name: 'IVA General', rate: 0.21 },
  { code: '10', name: 'IVA Reducido', rate: 0.10 },
  { code: '4', name: 'IVA Superreducido', rate: 0.04 },
  { code: '0', name: 'IVA Exento', rate: 0.00 },
];

export const RETENTION_RATES = [
  { code: '15', name: 'IRPF 15%', rate: 0.15 },
  { code: '7', name: 'IRPF 7%', rate: 0.07 },
  { code: '0', name: 'Sin Retención', rate: 0.00 },
];
