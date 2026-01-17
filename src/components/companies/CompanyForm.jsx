import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { validateNIFCIF } from '../../utils/helpers';

export default function CompanyForm({ company, onClose }) {
  const { addCompany, updateCompany } = useApp();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: company?.name || '',
    tradeName: company?.tradeName || '',
    taxId: company?.taxId || '',
    address: company?.address || '',
    postalCode: company?.postalCode || '',
    city: company?.city || '',
    province: company?.province || '',
    country: company?.country || 'España',
    phone: company?.phone || '',
    email: company?.email || '',
    website: company?.website || '',
    iban: company?.iban || '',
    bankName: company?.bankName || '',
    registryData: company?.registryData || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'El NIF/CIF es obligatorio';
    } else if (!validateNIFCIF(formData.taxId)) {
      newErrors.taxId = 'NIF/CIF no válido';
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Email no válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (company) {
      updateCompany(company.id, formData);
    } else {
      addCompany(formData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {company ? 'Editar Empresa' : 'Nueva Empresa'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Razón Social *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Nombre Comercial</label>
                <input
                  type="text"
                  name="tradeName"
                  className="form-control"
                  value={formData.tradeName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">NIF/CIF *</label>
                <input
                  type="text"
                  name="taxId"
                  className="form-control"
                  value={formData.taxId}
                  onChange={handleChange}
                  maxLength="9"
                />
                {errors.taxId && <div className="form-error">{errors.taxId}</div>}
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
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
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

              <div className="form-group">
                <label className="form-label">Provincia</label>
                <input
                  type="text"
                  name="province"
                  className="form-control"
                  value={formData.province}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">IBAN</label>
                <input
                  type="text"
                  name="iban"
                  className="form-control"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banco</label>
                <input
                  type="text"
                  name="bankName"
                  className="form-control"
                  value={formData.bankName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Datos Registrales</label>
              <textarea
                name="registryData"
                className="form-control"
                value={formData.registryData}
                onChange={handleChange}
                placeholder="Registro Mercantil, tomo, folio, hoja..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {company ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
