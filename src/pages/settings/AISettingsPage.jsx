import { useState } from 'react';
import { getAPIKeyInstructions } from '../../services/aiAccountant';

export default function AISettingsPage() {
  const [copied, setCopied] = useState(false);
  const instructions = getAPIKeyInstructions();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filePath = 'src/services/aiAccountant.js';

  return (
    <div className="page-content">
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        🤖 Configuración del Asistente Contable IA
      </h1>

      <div className="card mb-3" style={{ background: '#e3f2fd', borderLeft: '4px solid var(--primary-color)' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>¿Qué es el Asistente Contable IA?</h3>
        <p style={{ marginBottom: '12px' }}>
          El asistente contable usa inteligencia artificial para sugerir automáticamente las cuentas del
          Plan General Contable español basándose en la descripción de tus transacciones.
        </p>
        <p style={{ margin: 0 }}>
          <strong>No necesitas saber de contabilidad.</strong> Simplemente describe la operación y la IA
          creará el asiento contable correcto.
        </p>
      </div>

      <div className="card mb-3">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>🎯 Funcionalidades</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
            <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Sugerencias Inteligentes</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Describe la operación y obtén las cuentas contables adecuadas
            </p>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
            <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Asientos Automáticos</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Genera asientos completos desde facturas en un clic
            </p>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Validación PGC</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Cumple con el Plan General Contable español 2007
            </p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>
        📝 Configuración (Gratis)
      </h2>

      {/* Groq Instructions */}
      <div className="card mb-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>
            {instructions.groq.name} ⚡ Recomendado
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-success">Gratis</span>
            <span className="badge badge-info">Rápido</span>
          </div>
        </div>

        <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          {instructions.groq.steps.map((step, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {step}
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <a
            href={instructions.groq.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            🔗 Ir a Groq Console
          </a>
          <button
            className="btn btn-outline"
            onClick={() => handleCopy(filePath)}
          >
            {copied ? '✓ Copiado' : '📋 Copiar ruta del archivo'}
          </button>
        </div>
      </div>

      {/* Hugging Face Instructions */}
      <div className="card mb-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>
            {instructions.huggingface.name}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-success">Gratis</span>
          </div>
        </div>

        <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          {instructions.huggingface.steps.map((step, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {step}
            </li>
          ))}
        </ol>

        <a
          href={instructions.huggingface.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          🔗 Ir a Hugging Face
        </a>
      </div>

      <div className="card" style={{ background: '#fff3cd', borderLeft: '4px solid var(--warning-color)' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>🔒 Privacidad</h4>
        <p style={{ fontSize: '13px', margin: 0 }}>
          Tu API key se guarda localmente en el archivo <code>aiAccountant.js</code> de tu aplicación.
          Nunca se envía a ningún servidor excepto directamente a Groq/Hugging Face para procesar las sugerencias.
        </p>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>
        🎮 Modo Demo (Sin API Key)
      </h2>

      <div className="card mb-3" style={{ background: '#f5f5f5' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Sin configurar API key</h4>
        <p style={{ marginBottom: '12px' }}>
          La aplicación funciona en <strong>modo demo</strong> con un sistema de reglas básicas que
          sugiere cuentas contables comunes basándose en palabras clave.
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          Es útil para probar la app, pero las sugerencias son menos precisas que con IA.
        </p>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>
        💡 Ejemplos de Uso
      </h2>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>IA Sugiere</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Factura proveedor material oficina 121€</td>
              <td>
                <div style={{ fontSize: '12px' }}>
                  • 600 Compras (100€ debe)<br />
                  • 472 IVA soportado (21€ debe)<br />
                  • 400 Proveedores (121€ haber)
                </div>
              </td>
            </tr>
            <tr>
              <td>Cobro factura cliente ABC 1.210€</td>
              <td>
                <div style={{ fontSize: '12px' }}>
                  • 572 Bancos (1.210€ debe)<br />
                  • 705 Prestaciones servicios (1.000€ haber)<br />
                  • 477 IVA repercutido (210€ haber)
                </div>
              </td>
            </tr>
            <tr>
              <td>Pago nóminas mes enero 3.000€</td>
              <td>
                <div style={{ fontSize: '12px' }}>
                  • 640 Sueldos y salarios (3.000€ debe)<br />
                  • 572 Bancos (3.000€ haber)
                </div>
              </td>
            </tr>
            <tr>
              <td>Recibo luz oficina 150€</td>
              <td>
                <div style={{ fontSize: '12px' }}>
                  • 628 Suministros (123,97€ debe)<br />
                  • 472 IVA soportado (26,03€ debe)<br />
                  • 572 Bancos (150€ haber)
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
