// AI-powered accounting assistant using Groq API (free)
// Suggests Spanish PGC accounts based on transaction descriptions

const GROQ_API_KEY = 'gsk_YOUR_API_KEY_HERE'; // Users can get free key at https://console.groq.com
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Alternative: Use Hugging Face Inference API (also free)
const HF_API_KEY = 'hf_YOUR_API_KEY_HERE';
const HF_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct';

export async function suggestAccountingEntries(description, amount, type = 'expense') {
  // Try Groq first (faster and more reliable)
  try {
    return await suggestWithGroq(description, amount, type);
  } catch (error) {
    console.error('Groq API error:', error);
    // Fallback to rule-based suggestions
    return suggestWithRules(description, amount, type);
  }
}

async function suggestWithGroq(description, amount, type) {
  const prompt = `Eres un experto contable español. Basándote en el Plan General Contable español (PGC 2007), sugiere los asientos contables para la siguiente transacción:

Descripción: ${description}
Importe: ${amount}€
Tipo: ${type === 'expense' ? 'Gasto' : type === 'income' ? 'Ingreso' : 'Operación'}

Proporciona SOLO un JSON con este formato exacto, sin texto adicional:
{
  "entries": [
    {
      "account": "código de cuenta PGC",
      "accountName": "nombre de la cuenta",
      "debit": importe en debe (0 si no aplica),
      "credit": importe en haber (0 si no aplica),
      "description": "descripción del apunte"
    }
  ],
  "explanation": "breve explicación del asiento"
}

Cuentas PGC comunes:
- 430: Clientes
- 400: Proveedores
- 570: Caja
- 572: Bancos
- 472: IVA soportado
- 477: IVA repercutido
- 600: Compras
- 623: Servicios profesionales
- 628: Suministros
- 640: Sueldos y salarios
- 700: Ventas
- 705: Prestaciones de servicios`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // Fast and free model
      messages: [
        {
          role: 'system',
          content: 'Eres un experto contable español especializado en el Plan General Contable (PGC 2007). Respondes SOLO con JSON válido, sin texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract JSON from response (sometimes AI adds markdown)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }

  return JSON.parse(jsonMatch[0]);
}

// Rule-based fallback when AI is not available
function suggestWithRules(description, amount, type) {
  const desc = description.toLowerCase();
  const entries = [];

  // Common patterns
  if (type === 'expense') {
    // Supplier invoice
    if (desc.includes('proveedor') || desc.includes('compra')) {
      entries.push(
        {
          account: '600',
          accountName: 'Compras de mercaderías',
          debit: amount / 1.21,
          credit: 0,
          description: 'Base imponible compra'
        },
        {
          account: '472',
          accountName: 'IVA soportado',
          debit: amount - (amount / 1.21),
          credit: 0,
          description: 'IVA 21%'
        },
        {
          account: '400',
          accountName: 'Proveedores',
          debit: 0,
          credit: amount,
          description: 'Deuda con proveedor'
        }
      );
    }
    // Services
    else if (desc.includes('servicio') || desc.includes('profesional') || desc.includes('asesor')) {
      entries.push(
        {
          account: '623',
          accountName: 'Servicios de profesionales',
          debit: amount / 1.21,
          credit: 0,
          description: 'Base imponible servicios'
        },
        {
          account: '472',
          accountName: 'IVA soportado',
          debit: amount - (amount / 1.21),
          credit: 0,
          description: 'IVA 21%'
        },
        {
          account: '410',
          accountName: 'Acreedores por prestaciones de servicios',
          debit: 0,
          credit: amount,
          description: 'Deuda por servicios'
        }
      );
    }
    // Utilities
    else if (desc.includes('luz') || desc.includes('agua') || desc.includes('gas') || desc.includes('suministro')) {
      entries.push(
        {
          account: '628',
          accountName: 'Suministros',
          debit: amount / 1.21,
          credit: 0,
          description: 'Base imponible suministros'
        },
        {
          account: '472',
          accountName: 'IVA soportado',
          debit: amount - (amount / 1.21),
          credit: 0,
          description: 'IVA 21%'
        },
        {
          account: '572',
          accountName: 'Bancos',
          debit: 0,
          credit: amount,
          description: 'Pago de suministros'
        }
      );
    }
    // Salaries
    else if (desc.includes('nómina') || desc.includes('sueldo') || desc.includes('salario')) {
      entries.push(
        {
          account: '640',
          accountName: 'Sueldos y salarios',
          debit: amount,
          credit: 0,
          description: 'Salarios del mes'
        },
        {
          account: '572',
          accountName: 'Bancos',
          debit: 0,
          credit: amount,
          description: 'Pago de nóminas'
        }
      );
    }
    // Default expense
    else {
      entries.push(
        {
          account: '629',
          accountName: 'Otros servicios',
          debit: amount / 1.21,
          credit: 0,
          description: 'Gasto varios'
        },
        {
          account: '472',
          accountName: 'IVA soportado',
          debit: amount - (amount / 1.21),
          credit: 0,
          description: 'IVA 21%'
        },
        {
          account: '572',
          accountName: 'Bancos',
          debit: 0,
          credit: amount,
          description: 'Pago del gasto'
        }
      );
    }
  } else if (type === 'income') {
    // Sales/Services income
    entries.push(
      {
        account: '572',
        accountName: 'Bancos',
        debit: amount,
        credit: 0,
        description: 'Cobro de venta/servicio'
      },
      {
        account: desc.includes('venta') || desc.includes('producto') ? '700' : '705',
        accountName: desc.includes('venta') ? 'Ventas de mercaderías' : 'Prestaciones de servicios',
        debit: 0,
        credit: amount / 1.21,
        description: 'Base imponible'
      },
      {
        account: '477',
        accountName: 'IVA repercutido',
        debit: 0,
        credit: amount - (amount / 1.21),
        description: 'IVA 21%'
      }
    );
  }

  return {
    entries,
    explanation: 'Asiento sugerido basado en reglas contables estándar. Revisa que sea correcto para tu caso.'
  };
}

// Generate accounting entries from issued invoice
export function generateEntriesFromIssuedInvoice(invoice) {
  const entries = [
    {
      account: '430',
      accountName: 'Clientes',
      debit: invoice.total,
      credit: 0,
      description: `Factura ${invoice.number} - ${invoice.customerName}`
    },
    {
      account: '705',
      accountName: 'Prestaciones de servicios',
      debit: 0,
      credit: invoice.subtotal,
      description: 'Base imponible'
    },
    {
      account: '477',
      accountName: 'IVA repercutido',
      debit: 0,
      credit: invoice.totalVAT,
      description: 'IVA repercutido'
    }
  ];

  if (invoice.totalIRPF > 0) {
    entries.push({
      account: '473',
      accountName: 'Hacienda Pública, retenciones y pagos a cuenta',
      debit: invoice.totalIRPF,
      credit: 0,
      description: 'IRPF retenido'
    });
    entries[0].debit = invoice.total - invoice.totalIRPF;
  }

  return {
    entries,
    explanation: `Asiento de factura emitida ${invoice.number}`
  };
}

// Generate accounting entries from received invoice
export function generateEntriesFromReceivedInvoice(invoice) {
  const entries = [
    {
      account: '600', // or 623 for services
      accountName: 'Compras de mercaderías',
      debit: invoice.subtotal,
      credit: 0,
      description: `Factura ${invoice.number} - ${invoice.supplierName}`
    },
    {
      account: '472',
      accountName: 'IVA soportado',
      debit: invoice.totalVAT,
      credit: 0,
      description: 'IVA soportado'
    },
    {
      account: '400',
      accountName: 'Proveedores',
      debit: 0,
      credit: invoice.total,
      description: `Deuda con ${invoice.supplierName}`
    }
  ];

  return {
    entries,
    explanation: `Asiento de factura recibida ${invoice.number}`
  };
}

// Check if API key is configured
export function isAIConfigured() {
  return GROQ_API_KEY && GROQ_API_KEY !== 'gsk_YOUR_API_KEY_HERE';
}

// Get API key configuration instructions
export function getAPIKeyInstructions() {
  return {
    groq: {
      name: 'Groq (Recomendado)',
      url: 'https://console.groq.com',
      steps: [
        '1. Regístrate gratis en console.groq.com',
        '2. Ve a "API Keys" y crea una nueva clave',
        '3. Copia la clave y pégala en src/services/aiAccountant.js',
        '4. Reinicia la aplicación'
      ],
      free: true,
      fast: true
    },
    huggingface: {
      name: 'Hugging Face',
      url: 'https://huggingface.co/settings/tokens',
      steps: [
        '1. Regístrate gratis en huggingface.co',
        '2. Ve a Settings > Access Tokens',
        '3. Crea un nuevo token',
        '4. Copia la clave y pégala en src/services/aiAccountant.js'
      ],
      free: true,
      fast: false
    }
  };
}
