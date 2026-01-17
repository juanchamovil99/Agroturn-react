import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function ExcelImporter({ onClose }) {
  const { addBankTransactions } = useApp();
  const [file, setFile] = useState(null);
  const [bankFormat, setBankFormat] = useState('santander');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(extension)) {
        setFile(selectedFile);
      } else {
        alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV');
      }
    }
  };

  const parseExcelFile = async () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate file processing
    // In a real app, you would use the XLSX library to parse the Excel file
    setTimeout(() => {
      // Mock transactions based on selected bank format
      const mockTransactions = [
        {
          date: '2024-01-15',
          description: 'Transferencia recibida - Cliente ABC S.L.',
          reference: 'TRF-001234',
          amount: 1250.00,
          balance: 15430.50,
          category: 'Ingreso'
        },
        {
          date: '2024-01-14',
          description: 'Pago domiciliado - Seguridad Social',
          reference: 'DOM-556677',
          amount: -450.30,
          balance: 14180.50,
          category: 'Nóminas y SS'
        },
        {
          date: '2024-01-13',
          description: 'Pago proveedor - Material Oficina',
          reference: 'TRF-998877',
          amount: -125.60,
          balance: 14630.80,
          category: 'Gastos'
        },
        {
          date: '2024-01-12',
          description: 'Comisión mantenimiento cuenta',
          reference: 'COM-001',
          amount: -12.00,
          balance: 14756.40,
          category: 'Comisiones'
        },
        {
          date: '2024-01-11',
          description: 'Transferencia recibida - Cliente XYZ Ltd.',
          reference: 'TRF-887766',
          amount: 2100.00,
          balance: 14768.40,
          category: 'Ingreso'
        }
      ];

      setPreview(mockTransactions);
      setIsProcessing(false);
    }, 1500);
  };

  const handleImport = () => {
    if (!preview) return;

    addBankTransactions(preview);
    alert(`Se han importado ${preview.length} transacciones correctamente`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Importar Movimientos Bancarios desde Excel</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!preview ? (
            <div>
              <div className="form-group">
                <label className="form-label">Banco</label>
                <select
                  className="form-control"
                  value={bankFormat}
                  onChange={(e) => setBankFormat(e.target.value)}
                >
                  <option value="santander">Santander</option>
                  <option value="bbva">BBVA</option>
                  <option value="caixabank">CaixaBank</option>
                  <option value="bankia">Bankia</option>
                  <option value="sabadell">Banco Sabadell</option>
                  <option value="bankinter">Bankinter</option>
                  <option value="generic">Formato genérico</option>
                </select>
              </div>

              <div className="card" style={{
                background: 'var(--background)',
                padding: '40px',
                textAlign: 'center',
                border: '2px dashed var(--border-color)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ marginBottom: '12px' }}>Arrastra tu archivo Excel aquí</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Soportamos formatos .xlsx, .xls y .csv
                </p>

                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  📁 Seleccionar Archivo
                </label>

                {file && (
                  <div style={{ marginTop: '24px' }}>
                    <div className="badge badge-success" style={{ fontSize: '14px', padding: '10px 20px' }}>
                      ✓ {file.name}
                    </div>
                    <br />
                    <button
                      className="btn btn-success mt-3"
                      onClick={parseExcelFile}
                      disabled={isProcessing}
                    >
                      {isProcessing ? '🔄 Procesando...' : '📖 Leer Archivo'}
                    </button>
                  </div>
                )}
              </div>

              <div className="card mt-3" style={{ background: '#e3f2fd' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>💡 Instrucciones</h4>
                <ul style={{ fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                  <li>Descarga tus movimientos bancarios desde la web de tu banco</li>
                  <li>Selecciona el formato Excel (.xlsx) o CSV</li>
                  <li>Elige el banco correspondiente en el selector superior</li>
                  <li>Carga el archivo y revisa los datos antes de importar</li>
                </ul>
              </div>

              <div className="card mt-3" style={{ background: '#fff3cd' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>⚠️ Nota de demostración</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Esta es una demostración. En producción, utilizaríamos la librería
                  <strong> XLSX (SheetJS)</strong> para leer archivos Excel y parsear los datos según
                  el formato específico de cada banco español.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="card mb-3" style={{ background: '#d1f2eb', borderLeft: '4px solid #00c851' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>
                  ✓ {preview.length} transacciones encontradas
                </h4>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  Revisa los datos antes de importar a la base de datos
                </p>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Referencia</th>
                      <th>Importe</th>
                      <th>Saldo</th>
                      <th>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((transaction, index) => (
                      <tr key={index}>
                        <td>{transaction.date}</td>
                        <td>{transaction.description}</td>
                        <td style={{ fontSize: '12px' }}>{transaction.reference}</td>
                        <td>
                          <strong style={{
                            color: transaction.amount >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                          }}>
                            {transaction.amount >= 0 ? '+' : ''}
                            {transaction.amount.toFixed(2)} €
                          </strong>
                        </td>
                        <td>{transaction.balance.toFixed(2)} €</td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '11px' }}>
                            {transaction.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          {preview && (
            <button className="btn btn-success" onClick={handleImport}>
              ✓ Importar {preview.length} Transacciones
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
