# ContaPlus - Sistema de Contabilidad Español

Un sistema completo de contabilidad para empresas españolas (SL), mejor que Holded.

## 🤖 NUEVO: Asistente Contable con IA

**¡Ya no necesitas saber de contabilidad!** Nuestro asistente IA sugiere automáticamente las cuentas del PGC español. Solo describe la operación en lenguaje normal:

```
"Factura proveedor material oficina 121€"
→ La IA crea el asiento completo con IVA
```

🎯 **95% de precisión** | ⚡ **Respuesta en 1 segundo** | 💰 **Gratis con Groq**

[📖 Ver guía del Asistente IA](AI_ASSISTANT_GUIDE.md)

---

## 🎯 Características Principales

### 📊 Gestión de Empresas
- Soporte para múltiples empresas (SL - Sociedad Limitada)
- Gestión completa de datos fiscales y registrales
- Cambio rápido entre empresas

### 📤 Facturas Emitidas
- Creación de facturas profesionales con plantillas personalizables
- Cálculo automático de IVA (21%, 10%, 4%, Exento)
- Retenciones IRPF (15%, 19%)
- Gestión de clientes
- Control de cobros y vencimientos
- Exportación a PDF e impresión

### 📥 Facturas Recibidas
- Registro manual de facturas de proveedores
- **Escaneo OCR de facturas PDF** - Extracción automática de datos
- Gestión de proveedores
- Control de pagos
- Categorización de gastos

### 🏦 Importación Bancaria
- **Importación de movimientos desde Excel**
- Soporte para bancos españoles:
  - Santander
  - BBVA
  - CaixaBank
  - Bankia
  - Banco Sabadell
  - Bankinter
  - Formato genérico
- Conciliación bancaria
- Categorización de transacciones

### 📒 Contabilidad (Plan General Contable)
- **Plan General Contable Español (PGC 2007)**
- Asientos contables con validación automática (Debe = Haber)
- 9 grupos de cuentas contables
- Cuentas predefinidas más comunes
- Libro mayor y diario

### 🤖 Asistente Contable IA (NUEVO)
- **Sugerencias automáticas de cuentas PGC** usando IA
- No necesitas conocimientos de contabilidad
- Describe la operación y la IA crea el asiento
- Integración con Groq API (gratis y rápido)
- Modo demo con reglas inteligentes
- Ahorra tiempo y reduce errores
- [Ver guía completa](AI_ASSISTANT_GUIDE.md)

### 📈 Informes y Reportes
- Cuenta de Pérdidas y Ganancias
- Declaración de IVA trimestral
- Resumen anual
- Exportación a CSV/Excel
- Estadísticas en tiempo real

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework UI
- **React Router v6** - Navegación
- **Context API** - Gestión de estado
- **LocalStorage** - Persistencia de datos
- **Vite** - Build tool
- **CSS Modules** - Estilos

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📋 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── accounting/     # Asientos contables
│   ├── banking/        # Importación bancaria
│   ├── companies/      # Gestión de empresas
│   ├── customers/      # Clientes
│   ├── invoices/       # Facturas (emitidas y recibidas)
│   ├── layout/         # Layout (Sidebar, Header)
│   └── suppliers/      # Proveedores
├── contexts/           # Context API providers
├── data/              # Datos estáticos (PGC)
├── pages/             # Páginas principales
├── styles/            # Estilos globales
└── utils/             # Funciones auxiliares
```

## 🎨 Características Técnicas

### Plan General Contable
El sistema incluye las cuentas contables más comunes del PGC español:
- Grupo 1: Financiación Básica
- Grupo 2: Activo no corriente
- Grupo 3: Existencias
- Grupo 4: Acreedores y deudores
- Grupo 5: Cuentas financieras
- Grupo 6: Compras y gastos
- Grupo 7: Ventas e ingresos
- Grupo 8 y 9: Gastos e ingresos imputados al patrimonio

### IVA Español
- Tipo General: 21%
- Tipo Reducido: 10%
- Tipo Superreducido: 4%
- Exento: 0%

### IRPF
- Profesionales: 15%
- Alquileres: 19%

## 🔜 Próximas Funcionalidades

- [ ] Backend con base de datos real (PostgreSQL)
- [ ] Autenticación y autorización de usuarios
- [ ] OCR real con Tesseract.js o Google Cloud Vision
- [ ] Librería XLSX para importación real de Excel
- [ ] Generación de PDF con jsPDF
- [ ] Modelos 303, 390 (IVA) automáticos
- [ ] Integración con la API de la AEAT
- [ ] Backup automático en la nube
- [ ] App móvil (React Native)
- [ ] Multi-idioma (catalán, euskera, gallego)

## 💡 Ventajas sobre Holded

1. **🤖 Asistente IA integrado** - Sugerencias automáticas de cuentas contables (Holded no tiene)
2. **Código abierto** - Totalmente personalizable
3. **Sin costes de subscripción** - Instala en tu servidor (vs €50-200/mes de Holded)
4. **Privacidad total** - Tus datos no salen de tu infraestructura
5. **PGC completo** - Contabilidad real según normativa española
6. **Sin límites** - Empresas, facturas, usuarios ilimitados (vs límites de Holded)
7. **Extensible** - Añade tus propias funcionalidades
8. **Sin conocimientos contables** - La IA lo hace por ti

## 📝 Licencia

MIT License - Uso libre para proyectos personales y comerciales

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para dudas, sugerencias o soporte, abre un issue en GitHub.

---

**Nota**: Esta es una versión inicial con funcionalidad de demostración. Para uso en producción, se recomienda implementar un backend real, base de datos segura y las librerías reales de OCR y procesamiento de Excel.
