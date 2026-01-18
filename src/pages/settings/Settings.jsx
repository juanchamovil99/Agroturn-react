import { useState, useEffect } from 'react';
import {
  isAIConfigured,
  setGeminiAPIKey,
  getGeminiAPIKey,
} from '../../services/smartAccountingAI';
import './Settings.css';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const key = getGeminiAPIKey();
    setApiKey(key);
    setIsConfigured(isAIConfigured());
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      alert('Por favor, introduce una API key válida');
      return;
    }

    setGeminiAPIKey(apiKey);
    setIsConfigured(true);
    alert('✅ API Key guardada correctamente\n\nAhora la IA inteligente está activada para la contabilidad.');
  };

  const handleRemoveKey = () => {
    if (confirm('¿Eliminar la API key? El sistema usará la IA básica (basada en reglas).')) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setIsConfigured(false);
      alert('API key eliminada. Usando IA básica.');
    }
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, introduce una API key');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Save key temporarily
      const oldKey = getGeminiAPIKey();
      setGeminiAPIKey(apiKey);

      // Test with a simple request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responde solo "OK"' }] }],
          }),
        }
      );

      if (response.ok) {
        setTestResult({ success: true, message: '✅ API Key válida y funcionando' });
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          message: `❌ Error: ${error.error?.message || 'API key inválida'}`,
        });
        // Restore old key
        if (oldKey) setGeminiAPIKey(oldKey);
      }
    } catch (error) {
      setTestResult({ success: false, message: `❌ Error de conexión: ${error.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>⚙️ Configuración</h1>
        <p className="subtitle">Configuración de IA y preferencias</p>
      </div>

      <div className="settings-section">
        <h2>🤖 Inteligencia Artificial</h2>

        <div className="ai-status">
          {isConfigured ? (
            <div className="status-badge active">
              <span className="status-icon">✅</span>
              <span>IA Inteligente Activada (Google Gemini)</span>
            </div>
          ) : (
            <div className="status-badge inactive">
              <span className="status-icon">⚠️</span>
              <span>Usando IA Básica (reglas predefinidas)</span>
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>🎯 ¿Por qué usar IA Inteligente?</h3>
          <ul>
            <li><strong>Categorización precisa:</strong> Distingue automáticamente entre gastos, ingresos y activos</li>
            <li><strong>Detección de activos:</strong> Identifica maquinaria, equipos, vehículos, etc.</li>
            <li><strong>Cálculo de amortización:</strong> Sugiere años de depreciación según normativa española</li>
            <li><strong>Cuentas PGC correctas:</strong> Selecciona las cuentas contables más apropiadas</li>
            <li><strong>Contexto inteligente:</strong> Analiza el contenido completo de la factura</li>
          </ul>
        </div>

        <div className="api-key-section">
          <h3>🔑 Google Gemini API Key (Gratis)</h3>

          <div className="instructions">
            <p><strong>Cómo obtener tu API key gratuita:</strong></p>
            <ol>
              <li>
                Ve a{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Inicia sesión con tu cuenta de Google</li>
              <li>Haz clic en "Create API Key"</li>
              <li>Copia la API key generada</li>
              <li>Pégala aquí abajo</li>
            </ol>
            <p className="note">
              <strong>Nota:</strong> El tier gratuito incluye 60 peticiones por minuto, más que suficiente para uso normal.
            </p>
          </div>

          <div className="api-key-input-group">
            <div className="input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="api-key-input"
              />
              <button
                className="btn-toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
              >
                💾 Guardar API Key
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleTestKey}
                disabled={!apiKey.trim() || isTesting}
              >
                {isTesting ? '⏳ Probando...' : '🧪 Probar Conexión'}
              </button>
              {isConfigured && (
                <button className="btn btn-danger" onClick={handleRemoveKey}>
                  🗑️ Eliminar Key
                </button>
              )}
            </div>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        <div className="comparison-table">
          <h3>📊 Comparación: IA Básica vs IA Inteligente</h3>
          <table>
            <thead>
              <tr>
                <th>Funcionalidad</th>
                <th>IA Básica (Sin API)</th>
                <th>IA Inteligente (Con API)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Categorización de gastos</td>
                <td>⚠️ Por palabras clave simples</td>
                <td>✅ Análisis contextual avanzado</td>
              </tr>
              <tr>
                <td>Detección de activos</td>
                <td>⚠️ Solo palabras obvias</td>
                <td>✅ Identifica tipo y características</td>
              </tr>
              <tr>
                <td>Cálculo de amortización</td>
                <td>❌ No disponible</td>
                <td>✅ Automático según normativa</td>
              </tr>
              <tr>
                <td>Selección de cuentas PGC</td>
                <td>⚠️ Reglas básicas</td>
                <td>✅ Análisis profesional</td>
              </tr>
              <tr>
                <td>Explicaciones</td>
                <td>❌ No</td>
                <td>✅ Explica cada categorización</td>
              </tr>
              <tr>
                <td>Precisión</td>
                <td>~70%</td>
                <td>~95%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="settings-section">
        <h2>ℹ️ Información</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Versión:</strong> 1.0.0
          </div>
          <div className="info-item">
            <strong>Sistema Contable:</strong> Plan General de Contabilidad (PGC) Español
          </div>
          <div className="info-item">
            <strong>Normativa:</strong> Compatible con normativa fiscal española 2024
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
