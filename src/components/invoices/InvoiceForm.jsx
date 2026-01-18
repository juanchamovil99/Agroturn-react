import { useState, useEffect } from 'react';
import { VAT_RATES, RETENTION_RATES } from '../../config/chartOfAccounts';
import { generateInvoiceNumber, calculateTotal } from '../../utils/formatters';
import './InvoiceForm.css';

const InvoiceForm = ({ invoice, company, type, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    client: {
      name: '',
      nif: '',
      address: '',
      city: '',
      postalCode: '',
      email: '',
      phone: '',
    },
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        vatRate: 0.21,
        retentionRate: 0,
        total: 0,
      },
    ],
    notes: '',
    paymentMethod: 'transfer',
  });

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    } else {
      // Generate invoice number for new invoices
      const prefix = company.invoicePrefix || 'F';
      const sequence = company.invoiceSequence || 1;
      const number = generateInvoiceNumber(prefix, sequence);
      setFormData((prev) => ({ ...prev, number }));

      // Set due date to 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setFormData((prev) => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0],
      }));
    }
  }, [invoice, company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [name]: value,
      },
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate item total
    const item = newItems[index];
    const subtotal = item.quantity * item.unitPrice;
    const vat = subtotal * item.vatRate;
    const retention = subtotal * item.retentionRate;
    newItems[index].total = subtotal + vat - retention;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          vatRate: 0.21,
          retentionRate: 0,
          total: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const vat = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * item.vatRate,
      0
    );

    const retention = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * item.retentionRate,
      0
    );

    const total = subtotal + vat - retention;

    return { subtotal, vat, retention, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totals = calculateTotals();
    const invoiceData = {
      ...formData,
      id: invoice?.id || `inv_${Date.now()}`,
      ...totals,
    };

    onSave(invoiceData);
  };

  const totals = calculateTotals();

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{invoice ? 'Editar Factura' : 'Nueva Factura'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          {/* Invoice Details */}
          <div className="form-section">
            <h3>Datos de la Factura</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="number">Número de Factura</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Fecha</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Fecha de Vencimiento</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviada</option>
                  <option value="paid">Pagada</option>
                  <option value="pending">Pendiente</option>
                  <option value="overdue">Vencida</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="form-section">
            <h3>Datos del Cliente</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientName">Nombre/Razón Social</label>
                <input
                  type="text"
                  id="clientName"
                  name="name"
                  value={formData.client.name}
                  onChange={handleClientChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="clientNif">NIF/CIF</label>
                <input
                  type="text"
                  id="clientNif"
                  name="nif"
                  value={formData.client.nif}
                  onChange={handleClientChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="clientAddress">Dirección</label>
              <input
                type="text"
                id="clientAddress"
                name="address"
                value={formData.client.address}
                onChange={handleClientChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientCity">Ciudad</label>
                <input
                  type="text"
                  id="clientCity"
                  name="city"
                  value={formData.client.city}
                  onChange={handleClientChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="clientPostalCode">Código Postal</label>
                <input
                  type="text"
                  id="clientPostalCode"
                  name="postalCode"
                  value={formData.client.postalCode}
                  onChange={handleClientChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="clientEmail">Email</label>
                <input
                  type="email"
                  id="clientEmail"
                  name="email"
                  value={formData.client.email}
                  onChange={handleClientChange}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="form-section">
            <div className="section-header">
              <h3>Líneas de Factura</h3>
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                ➕ Añadir Línea
              </button>
            </div>

            <div className="items-container">
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-number">{index + 1}</div>
                  <div className="item-fields">
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, 'description', e.target.value)
                        }
                        rows="2"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Precio Unitario (€)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>IVA</label>
                        <select
                          value={item.vatRate}
                          onChange={(e) =>
                            handleItemChange(index, 'vatRate', parseFloat(e.target.value))
                          }
                        >
                          {VAT_RATES.map((rate) => (
                            <option key={rate.code} value={rate.rate}>
                              {rate.name} ({(rate.rate * 100).toFixed(0)}%)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Retención</label>
                        <select
                          value={item.retentionRate}
                          onChange={(e) =>
                            handleItemChange(index, 'retentionRate', parseFloat(e.target.value))
                          }
                        >
                          {RETENTION_RATES.map((rate) => (
                            <option key={rate.code} value={rate.rate}>
                              {rate.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Total</label>
                        <input
                          type="text"
                          value={item.total.toFixed(2)}
                          disabled
                          className="total-input"
                        />
                      </div>
                    </div>
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem(index)}
                      title="Eliminar línea"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="form-section">
            <div className="totals-section">
              <div className="totals-grid">
                <div className="total-row">
                  <span className="total-label">Base Imponible:</span>
                  <span className="total-value">{totals.subtotal.toFixed(2)} €</span>
                </div>
                <div className="total-row">
                  <span className="total-label">IVA:</span>
                  <span className="total-value">{totals.vat.toFixed(2)} €</span>
                </div>
                {totals.retention > 0 && (
                  <div className="total-row">
                    <span className="total-label">Retención:</span>
                    <span className="total-value negative">-{totals.retention.toFixed(2)} €</span>
                  </div>
                )}
                <div className="total-row final">
                  <span className="total-label">TOTAL:</span>
                  <span className="total-value">{totals.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="form-section">
            <h3>Información Adicional</h3>
            <div className="form-group">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Notas adicionales, condiciones de pago, etc."
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethod">Forma de Pago</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="transfer">Transferencia Bancaria</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="check">Cheque</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {invoice ? 'Actualizar' : 'Crear'} Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
