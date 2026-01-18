/**
 * Smart Accounting AI Service with Free AI API Integration
 *
 * Uses Google Gemini API (free tier) for intelligent accounting categorization
 * Handles: sales, purchases, assets, depreciation, and PGC suggestions
 */

import { SPANISH_CHART_OF_ACCOUNTS } from '../config/chartOfAccounts';

// API Configuration
const GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Check if AI API is configured
 */
export const isAIConfigured = () => {
  return !!GEMINI_API_KEY;
};

/**
 * Set Gemini API key
 */
export const setGeminiAPIKey = (key) => {
  localStorage.setItem('gemini_api_key', key);
  return true;
};

/**
 * Get Gemini API key
 */
export const getGeminiAPIKey = () => {
  return GEMINI_API_KEY;
};

/**
 * Call Gemini AI for accounting suggestions
 */
const callGeminiAI = async (prompt) => {
  const apiKey = localStorage.getItem('gemini_api_key');

  if (!apiKey) {
    throw new Error('API Key no configurada. Por favor, configura tu API key de Google Gemini.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error de API: ${error.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No se recibió respuesta de la IA');
  }

  return text;
};

/**
 * Parse AI response to extract accounting suggestion
 */
const parseAIResponse = (aiResponse) => {
  try {
    // Try to extract JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: parse text response
    const lines = aiResponse.split('\n').filter(l => l.trim());
    const result = {
      type: 'expense',
      category: 'Otros gastos',
      debitAccount: '629',
      creditAccount: '410',
      isAsset: false,
      confidence: 0.7,
    };

    // Extract information from text
    for (const line of lines) {
      if (line.includes('tipo:') || line.includes('type:')) {
        if (line.toLowerCase().includes('asset') || line.toLowerCase().includes('activo')) {
          result.isAsset = true;
          result.type = 'asset';
        } else if (line.toLowerCase().includes('income') || line.toLowerCase().includes('ingreso')) {
          result.type = 'income';
        }
      }
      if (line.includes('debe:') || line.includes('debit:')) {
        const match = line.match(/(\d{3,4})/);
        if (match) result.debitAccount = match[1];
      }
      if (line.includes('haber:') || line.includes('credit:')) {
        const match = line.match(/(\d{3,4})/);
        if (match) result.creditAccount = match[1];
      }
      if (line.includes('categoría:') || line.includes('category:')) {
        const categoryMatch = line.match(/:\s*(.+)$/);
        if (categoryMatch) result.category = categoryMatch[1].trim();
      }
      if (line.includes('depreciación:') || line.includes('depreciation:')) {
        const depMatch = line.match(/(\d+)/);
        if (depMatch) {
          result.depreciationYears = parseInt(depMatch[1]);
          result.depreciationAccount = '681'; // Amortización del inmovilizado
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('No se pudo interpretar la respuesta de la IA');
  }
};

/**
 * Get smart accounting suggestion using AI
 */
export const getSmartAccountingSuggestion = async (invoice, type = 'expense') => {
  // Build context for AI
  const isExpense = type === 'expense' || type === 'received';
  const entityName = isExpense ? invoice.supplier?.name : invoice.client?.name;

  // Get description
  let description = '';
  if (invoice.items && invoice.items.length > 0) {
    description = invoice.items
      .map(item => item.description || '')
      .filter(d => d.trim())
      .join(', ');
  }

  if (!description) {
    description = entityName ? `${entityName} - servicio` : 'Servicio general';
  }

  const amount = invoice.total || 0;
  const vatAmount = invoice.vat || 0;

  // Create prompt for AI
  const prompt = `Eres un experto contable español especializado en el Plan General de Contabilidad (PGC).

DATOS DE LA FACTURA:
- Tipo: ${isExpense ? 'GASTO (Factura Recibida)' : 'INGRESO (Factura Emitida)'}
- ${isExpense ? 'Proveedor' : 'Cliente'}: ${entityName || 'Sin especificar'}
- Descripción: ${description}
- Base imponible: ${amount - vatAmount}€
- IVA: ${vatAmount}€
- Total: ${amount}€

INSTRUCCIONES:
1. Analiza si esto es:
   - Un gasto corriente (servicios, suministros, etc.)
   - Un activo/inmovilizado (maquinaria, vehículos, equipos informáticos, etc.)
   - Un ingreso (venta de productos/servicios)

2. Para ACTIVOS, especifica:
   - Tipo de activo (Maquinaria, Equipos informáticos, Vehículos, Mobiliario, etc.)
   - Años de depreciación según normativa española (Maquinaria: 10 años, Equipos informáticos: 4 años, Vehículos: 6 años, etc.)
   - Cuenta PGC correspondiente (213 Maquinaria, 217 Equipos informáticos, 218 Elementos de transporte, 216 Mobiliario, etc.)

3. Para GASTOS, identifica la categoría:
   - Telecomunicaciones (629)
   - Suministros (628)
   - Arrendamientos (621)
   - Servicios profesionales (623)
   - Publicidad (627)
   - Material de oficina (629)
   - Otros

4. Sugiere las cuentas PGC correctas para:
   - Cuenta DEBE (cargo)
   - Cuenta HABER (abono)
   - Si es activo, también cuenta de amortización (681)

FORMATO DE RESPUESTA (JSON):
{
  "type": "expense|income|asset",
  "category": "Nombre de la categoría",
  "categoryCode": "Código PGC principal",
  "debitAccount": "Cuenta debe",
  "debitAccountName": "Nombre cuenta debe",
  "creditAccount": "Cuenta haber",
  "creditAccountName": "Nombre cuenta haber",
  "isAsset": true|false,
  "assetType": "Tipo de activo (si aplica)",
  "depreciationYears": número_años,
  "depreciationAccount": "681",
  "depreciationMonthly": importe_mensual,
  "explanation": "Breve explicación de la categorización",
  "confidence": 0.0-1.0
}

Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const aiResponse = await callGeminiAI(prompt);
    const suggestion = parseAIResponse(aiResponse);

    // Validate and enrich suggestion
    return enrichSuggestion(suggestion, invoice, type);
  } catch (error) {
    console.error('Error calling AI:', error);
    // Fallback to rule-based system
    return getFallbackSuggestion(invoice, type, error.message);
  }
};

/**
 * Enrich AI suggestion with additional data
 */
const enrichSuggestion = (suggestion, invoice, type) => {
  // Find account names from PGC
  const debitAcc = SPANISH_CHART_OF_ACCOUNTS.find(a => a.code === suggestion.debitAccount);
  const creditAcc = SPANISH_CHART_OF_ACCOUNTS.find(a => a.code === suggestion.creditAccount);

  if (debitAcc) {
    suggestion.debitAccountName = debitAcc.name;
  }
  if (creditAcc) {
    suggestion.creditAccountName = creditAcc.name;
  }

  // Calculate depreciation if it's an asset
  if (suggestion.isAsset && suggestion.depreciationYears) {
    const amount = (invoice.total || 0) - (invoice.vat || 0);
    suggestion.depreciationMonthly = amount / (suggestion.depreciationYears * 12);
    suggestion.depreciationAnnual = amount / suggestion.depreciationYears;
  }

  return suggestion;
};

/**
 * Fallback to rule-based system if AI fails
 */
const getFallbackSuggestion = (invoice, type, error) => {
  const isExpense = type === 'expense' || type === 'received';

  let description = '';
  if (invoice.items && invoice.items.length > 0) {
    description = invoice.items
      .map(item => item.description || '')
      .filter(d => d.trim())
      .join(' ')
      .toLowerCase();
  }

  if (!description) {
    const entityName = invoice.supplier?.name || invoice.client?.name || '';
    description = entityName.toLowerCase();
  }

  // Simple rule-based detection
  let suggestion = {
    type: isExpense ? 'expense' : 'income',
    category: isExpense ? 'Otros gastos' : 'Prestación de servicios',
    debitAccount: isExpense ? '629' : '430',
    debitAccountName: isExpense ? 'Otros servicios' : 'Clientes',
    creditAccount: isExpense ? '410' : '705',
    creditAccountName: isExpense ? 'Acreedores' : 'Prestaciones de servicios',
    isAsset: false,
    confidence: 0.6,
    usingFallback: true,
    aiError: error,
  };

  // Check for assets
  const assetKeywords = ['ordenador', 'portatil', 'laptop', 'maquinaria', 'vehiculo', 'coche', 'furgoneta', 'camion', 'mobiliario', 'mesa', 'silla', 'estanteria'];
  if (isExpense && assetKeywords.some(kw => description.includes(kw))) {
    suggestion.isAsset = true;
    suggestion.type = 'asset';

    if (description.includes('ordenador') || description.includes('portatil') || description.includes('laptop')) {
      suggestion.category = 'Equipos informáticos';
      suggestion.debitAccount = '217';
      suggestion.debitAccountName = 'Equipos para procesos de información';
      suggestion.depreciationYears = 4;
      suggestion.assetType = 'Equipos informáticos';
    } else if (description.includes('vehiculo') || description.includes('coche') || description.includes('furgoneta')) {
      suggestion.category = 'Elementos de transporte';
      suggestion.debitAccount = '218';
      suggestion.debitAccountName = 'Elementos de transporte';
      suggestion.depreciationYears = 6;
      suggestion.assetType = 'Vehículos';
    } else if (description.includes('maquinaria')) {
      suggestion.category = 'Maquinaria';
      suggestion.debitAccount = '213';
      suggestion.debitAccountName = 'Maquinaria';
      suggestion.depreciationYears = 10;
      suggestion.assetType = 'Maquinaria';
    } else {
      suggestion.category = 'Mobiliario';
      suggestion.debitAccount = '216';
      suggestion.debitAccountName = 'Mobiliario';
      suggestion.depreciationYears = 10;
      suggestion.assetType = 'Mobiliario';
    }

    suggestion.depreciationAccount = '681';
    const amount = (invoice.total || 0) - (invoice.vat || 0);
    suggestion.depreciationMonthly = amount / (suggestion.depreciationYears * 12);
    suggestion.depreciationAnnual = amount / suggestion.depreciationYears;
  }

  return suggestion;
};

/**
 * Generate complete accounting entry with AI suggestions
 */
export const generateSmartAccountingEntry = async (invoice, type = 'expense') => {
  const suggestion = await getSmartAccountingSuggestion(invoice, type);

  const isExpense = type === 'expense' || type === 'received';
  const amount = invoice.total || 0;
  const vatAmount = invoice.vat || 0;
  const baseAmount = amount - vatAmount;

  const entityName = isExpense ? invoice.supplier?.name : invoice.client?.name;

  let description = '';
  if (invoice.items && invoice.items.length > 0) {
    description = invoice.items
      .map(item => item.description || '')
      .filter(d => d.trim())
      .join(', ');
  }
  if (!description) {
    description = entityName || 'Sin descripción';
  }

  const entry = {
    id: `entry_${Date.now()}`,
    invoiceId: invoice.id,
    date: invoice.date || new Date().toISOString().split('T')[0],
    description: `${isExpense ? 'Factura recibida' : 'Factura emitida'} - ${description}`,
    type: suggestion.type,
    category: suggestion.category,
    lines: [],
  };

  if (suggestion.isAsset) {
    // Asset purchase entry
    entry.lines = [
      {
        account: suggestion.debitAccount,
        accountName: suggestion.debitAccountName,
        description: `${suggestion.assetType} - ${description}`,
        debit: baseAmount,
        credit: 0,
      },
      {
        account: '472',
        accountName: 'HP IVA soportado',
        description: 'IVA soportado',
        debit: vatAmount,
        credit: 0,
      },
      {
        account: suggestion.creditAccount,
        accountName: suggestion.creditAccountName,
        description: entityName,
        debit: 0,
        credit: amount,
      },
    ];
  } else if (isExpense) {
    // Regular expense entry
    entry.lines = [
      {
        account: suggestion.debitAccount,
        accountName: suggestion.debitAccountName,
        description: description,
        debit: baseAmount,
        credit: 0,
      },
      {
        account: '472',
        accountName: 'HP IVA soportado',
        description: 'IVA soportado',
        debit: vatAmount,
        credit: 0,
      },
      {
        account: suggestion.creditAccount,
        accountName: suggestion.creditAccountName,
        description: entityName,
        debit: 0,
        credit: amount,
      },
    ];
  } else {
    // Income entry
    entry.lines = [
      {
        account: suggestion.debitAccount,
        accountName: suggestion.debitAccountName,
        description: entityName,
        debit: amount,
        credit: 0,
      },
      {
        account: suggestion.creditAccount,
        accountName: suggestion.creditAccountName,
        description: description,
        debit: 0,
        credit: baseAmount,
      },
      {
        account: '477',
        accountName: 'HP IVA repercutido',
        description: 'IVA repercutido',
        debit: 0,
        credit: vatAmount,
      },
    ];
  }

  return { entry, suggestion };
};

export default {
  isAIConfigured,
  setGeminiAPIKey,
  getGeminiAPIKey,
  getSmartAccountingSuggestion,
  generateSmartAccountingEntry,
};
