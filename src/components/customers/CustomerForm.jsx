import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { validateNIFCIF } from '../../utils/helpers';

export default function CustomerForm({ onClose }) {
  const { addCustomer } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCustomer(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nuevo Cliente</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIF/CIF *</label>
                <input
                  type="text"
                  name="taxId"
                  className="form-control"
                  value={formData.taxId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Código Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  className="form-control"
                  value={formData.postalCode}
                  onChange={handleChange}
                  maxLength="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
