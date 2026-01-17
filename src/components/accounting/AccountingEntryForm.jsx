import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CHART_OF_ACCOUNTS } from '../../data/pgc-spain';
import { formatDateInput } from '../../utils/helpers';
import { suggestAccountingEntries, isAIConfigured } from '../../services/aiAccountant';

export default function AccountingEntryForm({ onClose }) {
  const { addAccountingEntry, accountingEntries, currentCompany } = useApp();

  const companyEntries = accountingEntries.filter(e => e.companyId === currentCompany?.id);
  const nextNumber = companyEntries.length + 1;

  const [formData, setFormData] = useState({
    number: nextNumber,
    date: formatDateInput(new Date()),
    description: '',
    lines: [
      { account: '', description: '', debit: 0, credit: 0 },
      { account: '', description: '', debit: 0, credit: 0 }
    ]
  });

  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    setTotals({ debit: totalDebit, credit: totalCredit });
  }, [formData.lines]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      [field]: field === 'account' || field === 'description' ? value : parseFloat(value) || 0
    };
    setFormData(prev => ({ ...prev, lines: newLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { account: '', description: '', debit: 0, credit: 0 }]
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length === 2) return;
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const handleAISuggest = async () => {
    if (!formData.description) {
      alert('Por favor, introduce una descripción del asiento antes de usar la IA');
      return;
    }

    setIsLoadingAI(true);
    setAiSuggestion(null);

    try {
      // Calculate total from existing lines if any
      const estimatedAmount = formData.lines.reduce((sum, line) =>
        sum + Math.max(line.debit, line.credit), 0) || 100;

      // Determine type based on description keywords
      let type = 'expense';
      const desc = formData.description.toLowerCase();
      if (desc.includes('venta') || desc.includes('ingreso') || desc.includes('cobro') || desc.includes('factura emitida')) {
        type = 'income';
      }

      const suggestion = await suggestAccountingEntries(formData.description, estimatedAmount, type);
      setAiSuggestion(suggestion);

      // Auto-apply suggestion
      if (suggestion.entries && suggestion.entries.length > 0) {
        setFormData(prev => ({
          ...prev,
          lines: suggestion.entries.map(entry => ({
            account: entry.account,
            description: entry.description,
            debit: entry.debit,
            credit: entry.credit
          }))
        }));
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      alert('Error al obtener sugerencias de IA. Revisa la configuración de API key o usa el modo manual.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Math.abs(totals.debit - totals.credit) > 0.01) {
      alert('El asiento no está cuadrado. El Debe y el Haber deben ser iguales.');
      return;
    }

    addAccountingEntry(formData);
    onClose();
  };

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Nuevo Asiento Contable</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de Asiento</label>
                <input
                  type="number"
                  name="number"
                  className="form-control"
                  value={formData.number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción del Asiento *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ej: Factura proveedor nº 123, Cobro cliente ABC..."
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleAISuggest}
                  disabled={isLoadingAI || !formData.description}
                  title="Sugerir cuentas contables con IA"
                >
                  {isLoadingAI ? '🔄 Analizando...' : '🤖 Sugerir con IA'}
                </button>
              </div>
              {!isAIConfigured() && (
                <div style={{
                  fontSize: '12px',
                  color: 'var(--warning-color)',
                  marginTop: '4px'
                }}>
                  ⚠️ Configura tu API key de Groq en src/services/aiAccountant.js para usar IA (modo demo activo)
                </div>
              )}
            </div>

            {aiSuggestion && (
              <div className="card mb-3" style={{
                background: '#e3f2fd',
                borderLeft: '4px solid var(--primary-color)'
              }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--primary-color)' }}>
                  🤖 Sugerencia de IA aplicada
                </h4>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  {aiSuggestion.explanation}
                </p>
              </div>
            )}

            <div className="mb-3">
              <div className="flex-between mb-2">
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Apuntes</h3>
                <button type="button" className="btn btn-sm btn-primary" onClick={addLine}>
                  ➕ Añadir línea
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>Cuenta</th>
                    <th>Descripción</th>
                    <th style={{ width: '150px' }}>Debe</th>
                    <th style={{ width: '150px' }}>Haber</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lines.map((line, index) => {
                    const account = CHART_OF_ACCOUNTS.find(a => a.code === line.account);
                    return (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-control"
                            value={line.account}
                            onChange={(e) => handleLineChange(index, 'account', e.target.value)}
                            required
                          >
                            <option value="">Seleccionar...</option>
                            {CHART_OF_ACCOUNTS.map(acc => (
                              <option key={acc.code} value={acc.code}>
                                {acc.code} - {acc.name}
                              </option>
                            ))}
                          </select>
                          {account && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {account.name}
                            </div>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={line.description}
                            onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                            placeholder="Detalle del apunte"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={line.debit || ''}
                            onChange={(e) => {
                              handleLineChange(index, 'debit', e.target.value);
                              if (e.target.value) handleLineChange(index, 'credit', 0);
                            }}
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={line.credit || ''}
                            onChange={(e) => {
                              handleLineChange(index, 'credit', e.target.value);
                              if (e.target.value) handleLineChange(index, 'debit', 0);
                            }}
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeLine(index)}
                            disabled={formData.lines.length === 2}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 'bold', background: 'var(--background)' }}>
                    <td colSpan="2" style={{ textAlign: 'right' }}>TOTALES:</td>
                    <td>{totals.debit.toFixed(2)} €</td>
                    <td>{totals.credit.toFixed(2)} €</td>
                    <td>
                      {isBalanced ? (
                        <span style={{ color: 'var(--success-color)' }}>✓</span>
                      ) : (
                        <span style={{ color: 'var(--error-color)' }}>⚠️</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {!isBalanced && (
                <div className="card mt-2" style={{ background: '#ffebee', borderLeft: '4px solid var(--error-color)' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--error-color)' }}>
                    ⚠️ El asiento no está cuadrado. Diferencia: {Math.abs(totals.debit - totals.credit).toFixed(2)} €
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isBalanced}>
              {isBalanced ? '✓ Guardar Asiento' : '⚠️ Asiento Descuadrado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
