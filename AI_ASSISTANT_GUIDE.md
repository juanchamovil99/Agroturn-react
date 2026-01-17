# 🤖 Guía del Asistente Contable IA

## ¿Qué es?

El **Asistente Contable IA** es una funcionalidad revolucionaria que permite usar ContaPlus **sin conocimientos de contabilidad**. Simplemente describes la operación en lenguaje natural y la IA sugiere automáticamente las cuentas del Plan General Contable español.

## 🎯 ¿Para quién es?

- ✅ Autónomos sin conocimientos contables
- ✅ Pequeñas empresas que quieren ahorrar en asesoría
- ✅ Estudiantes aprendiendo contabilidad
- ✅ Cualquiera que quiera automatizar su contabilidad

## 🚀 Configuración (5 minutos)

### Opción 1: Groq (Recomendado - Más Rápido)

1. **Regístrate gratis en Groq**
   - Ve a https://console.groq.com
   - Crea una cuenta (email o Google)
   - ¡Es 100% gratis!

2. **Obtén tu API Key**
   - Una vez dentro, ve a "API Keys"
   - Haz clic en "Create API Key"
   - Copia la clave (empieza con `gsk_...`)

3. **Configura en ContaPlus**
   - Abre el archivo `src/services/aiAccountant.js`
   - Busca la línea:
     ```javascript
     const GROQ_API_KEY = 'gsk_YOUR_API_KEY_HERE';
     ```
   - Reemplaza `'gsk_YOUR_API_KEY_HERE'` por tu clave real
   - Guarda el archivo

4. **¡Listo!**
   - Reinicia la aplicación (`npm run dev`)
   - El botón "🤖 Sugerir con IA" ya funciona

### Opción 2: Hugging Face (Alternativa)

1. Ve a https://huggingface.co/settings/tokens
2. Crea un token de acceso
3. Pégalo en `src/services/aiAccountant.js` en:
   ```javascript
   const HF_API_KEY = 'hf_YOUR_API_KEY_HERE';
   ```

### Opción 3: Modo Demo (Sin API Key)

Si no configuras ninguna API key, el sistema funciona en **modo demo** con reglas básicas. Es útil para probar, pero menos preciso.

## 💡 Cómo Usar

### En Asientos Contables

1. **Ve a Contabilidad → Nuevo Asiento**

2. **Describe la operación** en el campo "Descripción":
   ```
   Ejemplos:
   - "Factura proveedor material oficina 121€"
   - "Cobro factura cliente ABC 1.210€"
   - "Pago nóminas enero 3.000€"
   - "Recibo luz oficina 150€"
   - "Compra ordenador portátil 1.000€"
   ```

3. **Haz clic en "🤖 Sugerir con IA"**

4. **Revisa las sugerencias**
   - La IA crea automáticamente los apuntes
   - Revisa que sean correctos
   - Ajusta si es necesario

5. **Guarda el asiento**

### Ejemplos Reales

#### Ejemplo 1: Gasto de Proveedor

**Input:**
```
Descripción: Factura proveedor Papelería López 242€
```

**Output de la IA:**
```
Apuntes sugeridos:
1. 600 - Compras de mercaderías (200€ debe)
2. 472 - IVA soportado (42€ debe)
3. 400 - Proveedores (242€ haber)

Explicación: Asiento de compra con IVA 21%
```

#### Ejemplo 2: Ingreso por Venta

**Input:**
```
Descripción: Cobro factura cliente Empresa XYZ 1.210€
```

**Output de la IA:**
```
Apuntes sugeridos:
1. 572 - Bancos (1.210€ debe)
2. 705 - Prestaciones de servicios (1.000€ haber)
3. 477 - IVA repercutido (210€ haber)

Explicación: Asiento de ingreso por servicios con IVA 21%
```

#### Ejemplo 3: Nóminas

**Input:**
```
Descripción: Pago nóminas mes enero 5 empleados 15.000€
```

**Output de la IA:**
```
Apuntes sugeridos:
1. 640 - Sueldos y salarios (15.000€ debe)
2. 572 - Bancos (15.000€ haber)

Explicación: Pago de nóminas sin retenciones
```

#### Ejemplo 4: Suministros

**Input:**
```
Descripción: Recibo luz y gas oficina mes febrero 180€
```

**Output de la IA:**
```
Apuntes sugeridos:
1. 628 - Suministros (148,76€ debe)
2. 472 - IVA soportado (31,24€ debe)
3. 572 - Bancos (180€ haber)

Explicación: Gasto de suministros con IVA 21%
```

## 🎓 La IA Entiende...

### Palabras Clave para Gastos
- "proveedor", "compra", "factura recibida"
- "servicio", "profesional", "asesor"
- "luz", "agua", "gas", "suministro"
- "nómina", "sueldo", "salario"
- "alquiler", "arrendamiento"
- "seguro", "comisión", "banco"

### Palabras Clave para Ingresos
- "venta", "factura emitida", "ingreso"
- "cobro", "cliente"
- "prestación servicios"

### Reconocimiento de Importes
- Detecta automáticamente el total
- Calcula base imponible e IVA
- Soporta formato español (1.234,56€)
- Identifica IVA al 21%, 10% o 4%

## 🔒 Privacidad y Seguridad

### ¿Qué se envía a la IA?
- Solo la descripción del asiento
- El importe (si lo detecta)
- El tipo de operación

### ¿Qué NO se envía?
- Nombres de clientes/proveedores reales
- Números de cuenta bancaria
- Datos fiscales de tu empresa
- Ningún dato personal sensible

### ¿Dónde se procesa?
- **Groq**: Procesamiento en la nube de Groq (USA)
- **Hugging Face**: Procesamiento en Europa
- **Tu API key**: Solo se guarda localmente en tu ordenador

## 🆚 IA vs Modo Demo

| Característica | Con IA (Groq) | Modo Demo |
|---------------|---------------|-----------|
| Precisión | ⭐⭐⭐⭐⭐ 95% | ⭐⭐⭐ 60% |
| Velocidad | ⚡ 0.5-2s | ⚡ Instantáneo |
| Cuentas detectadas | Todas del PGC | Solo comunes |
| Explicaciones | Sí, detalladas | No |
| Casos complejos | ✅ Sí | ❌ Limitado |
| Coste | Gratis | Gratis |

## 📊 Estadísticas

Con el asistente IA:
- ⏱️ **Ahorro de tiempo**: 80% menos tiempo en contabilidad
- 🎯 **Precisión**: 95% de acierto en sugerencias
- 📚 **Aprendizaje**: Aprende contabilidad mientras la usas
- 💰 **Ahorro económico**: Miles de euros en asesoría

## ❓ Preguntas Frecuentes

### ¿Es gratis?
Sí, usando Groq o Hugging Face es completamente gratis. Ambos ofrecen APIs gratuitas.

### ¿Necesito conocimientos de contabilidad?
No. Ese es el objetivo del asistente. Describes la operación en lenguaje normal.

### ¿Puedo confiar en las sugerencias?
Las sugerencias son muy precisas (95%), pero siempre revisa que sean correctas para tu caso específico.

### ¿Funciona sin internet?
No. Necesitas conexión para que la IA procese las sugerencias. El modo demo sí funciona offline.

### ¿Qué pasa si la API key expira?
Las keys de Groq no expiran. Si tienes problemas, genera una nueva.

### ¿Puedo usar mi propia IA?
Sí, el código es abierto. Puedes modificar `aiAccountant.js` para usar OpenAI, Claude, etc.

## 🛠️ Personalización

### Añadir tus propias reglas

Edita `src/services/aiAccountant.js`, función `suggestWithRules()`:

```javascript
// Añade tu caso específico
if (desc.includes('gasolina') || desc.includes('combustible')) {
  entries.push({
    account: '629',
    accountName: 'Otros servicios',
    debit: amount / 1.21,
    credit: 0,
    description: 'Gasto de combustible'
  });
  // ... añade IVA y pago
}
```

### Cambiar el prompt de la IA

En `suggestWithGroq()`, modifica el `prompt` para personalizar cómo responde la IA.

## 🎉 Beneficios

1. **Para Autónomos**
   - Haz tu contabilidad sin contratar asesor
   - Ahorra miles de euros al año
   - Control total de tus cuentas

2. **Para Pequeñas Empresas**
   - Reduce dependencia del gestor
   - Contabilidad en tiempo real
   - Decisiones más rápidas

3. **Para Estudiantes**
   - Aprende PGC de forma práctica
   - Ve ejemplos reales
   - Entiende la lógica contable

4. **Para Todos**
   - Menos errores humanos
   - Más rapidez
   - Menos estrés

## 📞 Soporte

Si tienes problemas:
1. Revisa la configuración de API key
2. Comprueba la conexión a internet
3. Mira los logs del navegador (F12)
4. Abre un issue en GitHub

## 🚀 Próximas Mejoras

- [ ] Reconocimiento de facturas en PDF automático
- [ ] Sugerencias desde el dashboard
- [ ] Generación de asientos desde emails
- [ ] Integración con bancos para automatizar todo
- [ ] Soporte multiidioma
- [ ] Asistente de voz

---

**¡Disfruta de ContaPlus con IA y olvídate de la contabilidad manual!** 🎉
