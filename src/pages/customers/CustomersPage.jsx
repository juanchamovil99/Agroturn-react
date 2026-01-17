import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import CustomerForm from '../../components/customers/CustomerForm';
import { formatDate } from '../../utils/helpers';

export default function CustomersPage() {
  const { customers, currentCompany } = useApp();
  const [showForm, setShowForm] = useState(false);

  const companyCustomers = customers.filter(c => c.companyId === currentCompany?.id);

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
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Clientes</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {companyCustomers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-text">No hay clientes registrados</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Añadir primer cliente
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
              {companyCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.taxId}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.city}</td>
                  <td>{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
