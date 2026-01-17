import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { VAT_RATES } from '../../data/pgc-spain';
import { formatDateInput } from '../../utils/helpers';

export default function ReceivedInvoiceForm({ onClose }) {
  const { addReceivedInvoice, suppliers } = useApp();

  const [formData, setFormData] = useState({
    number: '',
    date: formatDateInput(new Date()),
    dueDate: formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    supplierName: '',
    supplierTaxId: '',
    subtotal: 0,
    totalVAT: 0,
    total: 0,
    description: '',
    status: 'pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierSelect = (e) => {
    const supplierId = e.target.value;
    if (!supplierId) return;

    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierName: supplier.name,
        supplierTaxId: supplier.taxId
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addReceivedInvoice(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nueva Factura Recibida</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {suppliers.length > 0 && (
              <div className="form-group">
                <label className="form-label">Seleccionar Proveedor</label>
                <select className="form-control" onChange={handleSupplierSelect}>
                  <option value="">-- Nuevo proveedor --</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.taxId}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de Factura *</label>
                <input
                  type="text"
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

              <div className="form-group">
                <label className="form-label">Vencimiento *</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <input
                  type="text"
                  name="supplierName"
                  className="form-control"
                  value={formData.supplierName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIF/CIF *</label>
                <input
                  type="text"
                  name="supplierTaxId"
                  className="form-control"
                  value={formData.supplierTaxId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Base Imponible *</label>
                <input
                  type="number"
                  name="subtotal"
                  className="form-control"
                  value={formData.subtotal}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">IVA *</label>
                <input
                  type="number"
                  name="totalVAT"
                  className="form-control"
                  value={formData.totalVAT}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total *</label>
                <input
                  type="number"
                  name="total"
                  className="form-control"
                  value={formData.total}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
