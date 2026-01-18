import { useState } from 'react';
import useStore from '../../store/useStore';
import CompanyForm from '../../components/companies/CompanyForm';
import { validateNIF, formatNIF } from '../../utils/formatters';
import './Companies.css';

const Companies = () => {
  const {
    companies,
    selectedCompany,
    addCompany,
    updateCompany,
    deleteCompany,
    setSelectedCompany,
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteCompany = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      deleteCompany(id);
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  return (
    <div className="companies-page">
      <div className="page-header">
        <h1>Empresas</h1>
        <button className="btn btn-primary" onClick={handleAddCompany}>
          ➕ Nueva Empresa
        </button>
      </div>

      {showForm && (
        <CompanyForm
          company={editingCompany}
          onClose={handleCloseForm}
          onSave={(company) => {
            if (editingCompany) {
              updateCompany(editingCompany.id, company);
            } else {
              addCompany(company);
            }
            handleCloseForm();
          }}
        />
      )}

      <div className="companies-grid">
        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h2>No hay empresas registradas</h2>
            <p>Crea tu primera empresa para empezar a gestionar tu contabilidad</p>
            <button className="btn btn-primary" onClick={handleAddCompany}>
              Crear primera empresa
            </button>
          </div>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              className={`company-card ${
                selectedCompany?.id === company.id ? 'selected' : ''
              }`}
            >
              <div className="company-header">
                <h3>{company.name}</h3>
                {selectedCompany?.id === company.id && (
                  <span className="selected-badge">✓ Seleccionada</span>
                )}
              </div>

              <div className="company-details">
                <div className="detail-row">
                  <span className="detail-label">NIF:</span>
                  <span className="detail-value">{formatNIF(company.nif)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dirección:</span>
                  <span className="detail-value">{company.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ciudad:</span>
                  <span className="detail-value">
                    {company.postalCode} {company.city}
                  </span>
                </div>
                {company.email && (
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="detail-row">
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{company.phone}</span>
                  </div>
                )}
              </div>

              <div className="company-actions">
                {selectedCompany?.id !== company.id && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSelectCompany(company)}
                  >
                    Seleccionar
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  onClick={() => handleEditCompany(company)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Companies;
