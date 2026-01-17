import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import SupplierForm from '../../components/suppliers/SupplierForm';
import { formatDate } from '../../utils/helpers';

export default function SuppliersPage() {
  const { suppliers, currentCompany } = useApp();
  const [showForm, setShowForm] = useState(false);

  const companySuppliers = suppliers.filter(s => s.companyId === currentCompany?.id);

  if (!currentCompany) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-text">Selecciona una empresa primero</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Proveedores</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nuevo Proveedor
        </button>
      </div>

      {companySuppliers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-text">No hay proveedores registrados</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Añadir primer proveedor
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIF/CIF</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {companySuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td><strong>{supplier.name}</strong></td>
                  <td>{supplier.taxId}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.city}</td>
                  <td>{formatDate(supplier.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <SupplierForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
