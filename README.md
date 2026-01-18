# ContaES - Sistema de Contabilidad Profesional para España

Sistema de contabilidad completo diseñado específicamente para empresas españolas (SL), con soporte para el Plan General de Contabilidad español, gestión de IVA, y cumplimiento de normativas fiscales españolas.

## 🎯 Características Principales

### 📊 Dashboard Completo
- Vista general de la salud financiera de tu empresa
- Métricas clave: facturación, gastos, balance, saldo bancario
- Acciones rápidas para las tareas más comunes
- Actividad reciente y alertas

### 🏢 Gestión Multi-Empresa
- Gestiona múltiples empresas SL desde una sola interfaz
- Datos completos de cada empresa (NIF, dirección, IBAN)
- Cambio rápido entre empresas
- Configuración individual de prefijos y numeración de facturas

### 📝 Facturación Profesional
**Facturas Emitidas:**
- Creación rápida de facturas con plantillas profesionales
- Gestión de clientes con NIF
- Líneas de factura con IVA personalizable (21%, 10%, 4%, exento)
- Retenciones IRPF (15%, 7%, sin retención)
- Estados: Borrador, Enviada, Pagada, Pendiente, Vencida
- Vista previa e impresión de facturas
- Generación de PDF (en desarrollo)
- Búsqueda y filtrado avanzado

**Facturas Recibidas:**
- Escaneo automático de PDFs de proveedores (simulado)
- Entrada manual de facturas
- Seguimiento de gastos por proveedor
- Control de facturas pendientes de pago
- Marcado de facturas como pagadas

### 🏦 Importación Bancaria
- **Soporte para bancos españoles principales:**
  - BBVA
  - Santander
  - CaixaBank
  - Bankia
  - Sabadell
  - ING
  - Y otros bancos españoles

- **Formatos soportados:**
  - Excel (.xlsx, .xls)
  - CSV

- **Detección automática:**
  - Reconocimiento del formato del banco
  - Extracción de fecha, concepto, cargo/abono, saldo
  - Conversión de formatos españoles (fechas DD/MM/YYYY, decimales con coma)

### 📚 Contabilidad Española
- **Plan General de Contabilidad (PGC):**
  - Grupo 1: Financiación Básica
  - Grupo 2: Activo No Corriente
  - Grupo 3: Existencias
  - Grupo 4: Acreedores y Deudores
  - Grupo 5: Cuentas Financieras
  - Grupo 6: Compras y Gastos
  - Grupo 7: Ventas e Ingresos

- Cuentas predefinidas según normativa española
- Sistema de asientos contables
- Conciliación bancaria

### 📈 Informes y Reportes
- **Cuenta de Resultados:** Análisis de ventas vs. compras
- **Libro de IVA:** IVA repercutido y soportado
- **Balance de Situación:** Activos, pasivos y patrimonio
- **Libro Diario:** Registro cronológico de operaciones
- **Libro Mayor:** Movimientos por cuenta contable
- **Modelo 303:** Declaración trimestral del IVA
- **Evolución Mensual:** Tendencias de ingresos y gastos

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **React Router 6** - Navegación
- **Zustand** - Gestión de estado (con persistencia)
- **i18next** - Internacionalización
- **Axios** - Cliente HTTP
- **Framer Motion** - Animaciones

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [tu-repositorio]

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🚀 Uso

### 1. Crear tu primera empresa
1. Accede al módulo "Empresas"
2. Click en "Nueva Empresa"
3. Completa los datos (NIF, dirección, IBAN, etc.)
4. Selecciona la empresa para empezar a trabajar

### 2. Emitir facturas
1. Ve a "Facturas Emitidas"
2. Click en "Nueva Factura"
3. Completa los datos del cliente
4. Añade líneas de factura
5. Selecciona IVA y retención
6. Guarda y envía

### 3. Registrar gastos
1. Ve a "Facturas Recibidas"
2. Opción 1: "Escanear PDF" para subir factura del proveedor
3. Opción 2: "Añadir Manual" para introducir datos manualmente

### 4. Importar movimientos bancarios
1. Descarga el extracto bancario de tu banco (Excel o CSV)
2. Ve a "Banca"
3. Click en "Importar Excel"
4. Selecciona el archivo
5. El sistema detectará automáticamente el formato

### 5. Consultar informes
1. Ve a "Informes y Reportes"
2. Visualiza métricas clave
3. Accede a reportes específicos (IVA, Resultados, Balance)
4. Genera PDFs para presentación

## 📋 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes comunes
│   ├── companies/      # Gestión de empresas
│   ├── invoices/       # Facturas y formularios
│   ├── layout/         # Layout principal y navegación
│   ├── reports/        # Componentes de reportes
│   └── banking/        # Componentes bancarios
├── pages/              # Páginas principales
│   ├── dashboard/      # Dashboard
│   ├── companies/      # Listado de empresas
│   ├── invoices/       # Facturas emitidas/recibidas
│   ├── banking/        # Movimientos bancarios
│   ├── accounting/     # Contabilidad
│   └── reports/        # Informes
├── store/              # Estado global (Zustand)
├── utils/              # Utilidades y helpers
│   ├── formatters.js   # Formateo español (€, fechas)
│   └── excelParser.js  # Parser de extractos bancarios
├── config/             # Configuración
│   └── chartOfAccounts.js  # Plan General Contable
└── styles/             # Estilos globales
```

## 🌟 Características Avanzadas

### Formateo Español
- Moneda: EUR con formato español (1.234,56 €)
- Fechas: DD/MM/YYYY
- Validación de NIF/CIF
- Validación de IBAN español
- Formateo de IBAN (espacios cada 4 dígitos)

### Gestión de IVA
- IVA General: 21%
- IVA Reducido: 10%
- IVA Superreducido: 4%
- IVA Exento: 0%
- Cálculo automático de IVA a pagar/devolver

### Retenciones IRPF
- 15% (profesionales)
- 7% (otros casos)
- Sin retención
- Cálculo automático en facturas

## 🎨 Diseño

- **UI Moderna:** Diseño limpio y profesional
- **Responsive:** Funciona en desktop, tablet y móvil
- **Tema:** Gradientes morados/azules
- **Iconos:** Emojis para mejor UX
- **Animaciones:** Transiciones suaves

## 🔒 Seguridad y Validación

- Validación de NIF/CIF español
- Validación de IBAN español
- Validación de campos obligatorios
- Confirmación para acciones destructivas
- Persistencia local de datos

## 🚧 Próximas Funcionalidades

- [ ] Generación real de PDFs (jsPDF)
- [ ] Escaneo OCR de facturas (Tesseract.js)
- [ ] Importación real de Excel (XLSX)
- [ ] Envío de facturas por email
- [ ] Exportación de datos contables
- [ ] Backup y restauración de datos
- [ ] Multi-usuario con autenticación
- [ ] API backend para sincronización
- [ ] Integración con bancos españoles
- [ ] Modelos fiscales automatizados (303, 347, etc.)
- [ ] Recordatorios de vencimientos
- [ ] Gráficos interactivos (Recharts)
- [ ] Exportación a formato Contaplus/A3

## 📝 Cumplimiento Normativo

Este sistema está diseñado siguiendo:
- Plan General de Contabilidad español (PGC)
- Normativa de IVA en España
- Requisitos de facturación españoles
- Estructura de cuentas contables oficial

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto.

## 💡 Inspiración

Diseñado para ser una alternativa mejor a Holded, con:
- Interfaz más limpia y moderna
- Funcionalidades específicas para España
- Mayor flexibilidad
- Código abierto
- Sin costes de suscripción

## 📧 Contacto

Para preguntas, sugerencias o reportar problemas, por favor abre un issue en GitHub.

---

Hecho con ❤️ para empresas españolas
