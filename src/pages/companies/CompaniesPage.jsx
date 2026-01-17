import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import CompanyForm from '../../components/companies/CompanyForm';
import { formatDate, validateNIFCIF } from '../../utils/helpers';

export default function CompaniesPage() {
  const { companies, deleteCompany, setCurrentCompany } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDelete = (company) => {
    if (window.confirm(`¿Estás seguro de eliminar la empresa ${company.name}?`)) {
      deleteCompany(company.id);
    }
  };

  const handleSetCurrent = (company) => {
    setCurrentCompany(company);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  return (
    <div className="page-content">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Empresas</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nueva Empresa
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <div className="empty-state-text">No hay empresas registradas</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear primera empresa
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIF/CIF</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Creada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                    {company.tradeName && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {company.tradeName}
                      </div>
                    )}
                  </td>
                  <td>{company.taxId}</td>
                  <td>
                    {company.address && (
                      <>
                        {company.address}<br />
                        {company.postalCode} {company.city}
                      </>
                    )}
                  </td>
                  <td>{company.phone}</td>
                  <td>{company.email}</td>
                  <td>{formatDate(company.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSetCurrent(company)}
                        title="Seleccionar empresa"
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(company)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(company)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <CompanyForm
          company={editingCompany}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
