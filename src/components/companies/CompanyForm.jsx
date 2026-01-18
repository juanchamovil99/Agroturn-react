import { useState, useEffect } from 'react';
import { validateNIF, validateIBAN } from '../../utils/formatters';
import './CompanyForm.css';

const CompanyForm = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    nif: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'España',
    email: '',
    phone: '',
    iban: '',
    invoicePrefix: 'F',
    invoiceSequence: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.nif.trim()) {
      newErrors.nif = 'El NIF es obligatorio';
    } else if (!validateNIF(formData.nif)) {
      newErrors.nif = 'El NIF no es válido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'El código postal es obligatorio';
    }

    if (formData.iban && !validateIBAN(formData.iban)) {
      newErrors.iban = 'El IBAN no es válido (debe ser español: ES + 22 dígitos)';
    }

    if (!formData.invoicePrefix.trim()) {
      newErrors.invoicePrefix = 'El prefijo de factura es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{company ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-section">
            <h3>Información Básica</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Nombre de la Empresa <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="nif">
                  NIF/CIF <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nif"
                  name="nif"
                  value={formData.nif}
                  onChange={handleChange}
                  placeholder="B12345678"
                  className={errors.nif ? 'error' : ''}
                />
                {errors.nif && <span className="error-message">{errors.nif}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Dirección <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle, número, piso, puerta"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">
                  Ciudad <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="province">Provincia</label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">
                  Código Postal <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="28001"
                  className={errors.postalCode ? 'error' : ''}
                />
                {errors.postalCode && (
                  <span className="error-message">{errors.postalCode}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contacto</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contacto@empresa.es"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+34 900 000 000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Información Bancaria</h3>

            <div className="form-group">
              <label htmlFor="iban">IBAN</label>
              <input
                type="text"
                id="iban"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                placeholder="ES12 1234 5678 9012 3456 7890"
                className={errors.iban ? 'error' : ''}
              />
              {errors.iban && <span className="error-message">{errors.iban}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Configuración de Facturación</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="invoicePrefix">
                  Prefijo de Factura <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="invoicePrefix"
                  name="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={handleChange}
                  placeholder="F"
                  maxLength={3}
                  className={errors.invoicePrefix ? 'error' : ''}
                />
                {errors.invoicePrefix && (
                  <span className="error-message">{errors.invoicePrefix}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="invoiceSequence">Número de Inicio</label>
                <input
                  type="number"
                  id="invoiceSequence"
                  name="invoiceSequence"
                  value={formData.invoiceSequence}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {company ? 'Actualizar' : 'Crear'} Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
