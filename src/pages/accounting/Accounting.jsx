import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { SPANISH_CHART_OF_ACCOUNTS } from '../../config/chartOfAccounts';
import './Accounting.css';

const Accounting = () => {
  const { selectedCompany } = useStore();

  if (!selectedCompany) {
    return (
      <div className="accounting-page">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Debes seleccionar una empresa para gestionar la contabilidad</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  const groupedAccounts = SPANISH_CHART_OF_ACCOUNTS.reduce((acc, account) => {
    const group = account.code[0];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(account);
    return acc;
  }, {});

  const groupNames = {
    '1': 'Financiación Básica',
    '2': 'Activo No Corriente',
    '3': 'Existencias',
    '4': 'Acreedores y Deudores',
    '5': 'Cuentas Financieras',
    '6': 'Compras y Gastos',
    '7': 'Ventas e Ingresos',
  };

  return (
    <div className="accounting-page">
      <div className="page-header">
        <div>
          <h1>Contabilidad</h1>
          <p className="subtitle">{selectedCompany.name}</p>
        </div>
      </div>

      <div className="info-banner">
        <h3>📚 Plan General de Contabilidad Español (PGC)</h3>
        <p>
          Sistema contable siguiendo la normativa española. Las cuentas están organizadas
          según el Plan General de Contabilidad vigente.
        </p>
      </div>

      <div className="accounting-sections">
        <div className="section-card">
          <h3>Asientos Contables</h3>
          <p>Registra y gestiona los asientos contables de tu empresa</p>
          <button className="btn btn-primary">Ver Asientos</button>
        </div>

        <div className="section-card">
          <h3>Plan de Cuentas</h3>
          <p>Consulta y gestiona el cuadro de cuentas contables</p>
          <button className="btn btn-primary">Ver Plan de Cuentas</button>
        </div>

        <div className="section-card">
          <h3>Conciliación Bancaria</h3>
          <p>Concilia tus movimientos bancarios con la contabilidad</p>
          <button className="btn btn-primary">Conciliar</button>
        </div>
      </div>

      <div className="chart-of-accounts">
        <h2>Plan General de Contabilidad</h2>

        {Object.entries(groupedAccounts).map(([group, accounts]) => (
          <div key={group} className="account-group">
            <h3 className="group-header">
              Grupo {group} - {groupNames[group]}
            </h3>
            <div className="accounts-table-container">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cuenta</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.code}>
                      <td className="account-code">{account.code}</td>
                      <td className="account-name">{account.name}</td>
                      <td className="account-category">{account.category}</td>
                      <td>
                        <span
                          className={`type-badge ${
                            account.type === 'debit' ? 'type-debit' : 'type-credit'
                          }`}
                        >
                          {account.type === 'debit' ? 'Debe' : 'Haber'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounting;
