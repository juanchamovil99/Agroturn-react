import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { VAT_RATES, IRPF_RATES } from '../../data/pgc-spain';
import {
  formatDateInput,
  generateInvoiceNumber,
  calculateInvoiceSubtotal,
  calculateInvoiceTotalVAT,
  calculateInvoiceTotalIRPF,
  calculateInvoiceTotal
} from '../../utils/helpers';

export default function InvoiceForm({ invoice, onClose }) {
  const { addIssuedInvoice, updateIssuedInvoice, currentCompany, issuedInvoices, customers } = useApp();

  const companyInvoices = issuedInvoices.filter(inv => inv.companyId === currentCompany?.id);
  const currentYear = new Date().getFullYear();
  const nextSequence = companyInvoices.filter(inv =>
    new Date(inv.date).getFullYear() === currentYear
  ).length + 1;

  const [formData, setFormData] = useState({
    number: invoice?.number || generateInvoiceNumber(currentYear, nextSequence),
    date: invoice?.date || formatDateInput(new Date()),
    dueDate: invoice?.dueDate || formatDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    customerName: invoice?.customerName || '',
    customerTaxId: invoice?.customerTaxId || '',
    customerAddress: invoice?.customerAddress || '',
    customerCity: invoice?.customerCity || '',
    customerPostalCode: invoice?.customerPostalCode || '',
    customerEmail: invoice?.customerEmail || '',
    paymentMethod: invoice?.paymentMethod || 'transfer',
    status: invoice?.status || 'pending',
    notes: invoice?.notes || '',
    items: invoice?.items || [
      { description: '', quantity: 1, unitPrice: 0, vatRate: VAT_RATES.GENERAL, irpfRate: 0 }
    ]
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    totalVAT: 0,
    totalIRPF: 0,
    total: 0
  });

  useEffect(() => {
    const subtotal = calculateInvoiceSubtotal(formData.items);
    const totalVAT = calculateInvoiceTotalVAT(formData.items);
    const totalIRPF = calculateInvoiceTotalIRPF(formData.items);
    const total = calculateInvoiceTotal(formData.items);

    setTotals({ subtotal, totalVAT, totalIRPF, total });
  }, [formData.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (!customerId) return;

    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name,
        customerTaxId: customer.taxId,
        customerAddress: customer.address,
        customerCity: customer.city,
        customerPostalCode: customer.postalCode,
        customerEmail: customer.email
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : parseFloat(value) || 0
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, vatRate: VAT_RATES.GENERAL, irpfRate: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const invoiceData = {
      ...formData,
      subtotal: totals.subtotal,
      totalVAT: totals.totalVAT,
      totalIRPF: totals.totalIRPF,
      total: totals.total
    };

    if (invoice) {
      updateIssuedInvoice(invoice.id, invoiceData);
    } else {
      addIssuedInvoice(invoiceData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {invoice ? 'Editar Factura' : 'Nueva Factura'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Invoice Details */}
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

            {/* Customer Selection */}
            {customers.length > 0 && (
              <div className="form-group">
                <label className="form-label">Seleccionar Cliente</label>
                <select
                  className="form-control"
                  onChange={handleCustomerSelect}
                >
                  <option value="">-- Nuevo cliente --</option>
                  {customers
                    .filter(c => c.companyId === currentCompany?.id)
                    .map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.taxId}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Customer Details */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre del Cliente *</label>
                <input
                  type="text"
                  name="customerName"
                  className="form-control"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIF/CIF Cliente *</label>
                <input
                  type="text"
                  name="customerTaxId"
                  className="form-control"
                  value={formData.customerTaxId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  name="customerAddress"
                  className="form-control"
                  value={formData.customerAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CP</label>
                <input
                  type="text"
                  name="customerPostalCode"
                  className="form-control"
                  value={formData.customerPostalCode}
                  onChange={handleChange}
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input
                  type="text"
                  name="customerCity"
                  className="form-control"
                  value={formData.customerCity}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Items */}
            <div className="mb-3">
              <div className="flex-between mb-2">
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Conceptos</h3>
                <button type="button" className="btn btn-sm btn-primary" onClick={addItem}>
                  ➕ Añadir línea
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{ width: '100px' }}>Cantidad</th>
                    <th style={{ width: '120px' }}>Precio Unit.</th>
                    <th style={{ width: '100px' }}>IVA %</th>
                    <th style={{ width: '100px' }}>IRPF %</th>
                    <th style={{ width: '120px' }}>Total</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Descripción del servicio/producto"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(index, 'vatRate', e.target.value)}
                        >
                          <option value={VAT_RATES.GENERAL}>21%</option>
                          <option value={VAT_RATES.REDUCED}>10%</option>
                          <option value={VAT_RATES.SUPER_REDUCED}>4%</option>
                          <option value={VAT_RATES.EXEMPT}>0%</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={item.irpfRate}
                          onChange={(e) => handleItemChange(index, 'irpfRate', e.target.value)}
                        >
                          <option value="0">0%</option>
                          <option value={IRPF_RATES.PROFESSIONAL}>15%</option>
                          <option value={IRPF_RATES.RENTAL}>19%</option>
                        </select>
                      </td>
                      <td>
                        <strong>
                          {(item.quantity * item.unitPrice).toFixed(2)} €
                        </strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{
              background: 'var(--background)',
              padding: '16px',
              borderRadius: '4px',
              maxWidth: '400px',
              marginLeft: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Base Imponible:</span>
                <strong>{totals.subtotal.toFixed(2)} €</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>IVA:</span>
                <strong>{totals.totalVAT.toFixed(2)} €</strong>
              </div>
              {totals.totalIRPF > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--error-color)' }}>
                  <span>IRPF (retención):</span>
                  <strong>-{totals.totalIRPF.toFixed(2)} €</strong>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '2px solid var(--border-color)',
                fontSize: '18px'
              }}>
                <span><strong>Total:</strong></span>
                <strong style={{ color: 'var(--primary-color)' }}>{totals.total.toFixed(2)} €</strong>
              </div>
            </div>

            {/* Payment and Status */}
            <div className="form-row mt-3">
              <div className="form-group">
                <label className="form-label">Método de Pago</label>
                <select
                  name="paymentMethod"
                  className="form-control"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="transfer">Transferencia</option>
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="check">Cheque</option>
                </select>
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
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales para la factura..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
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
}
