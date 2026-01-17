import { useApp } from '../../contexts/AppContext';

export default function Header() {
  const { currentCompany, companies, setCurrentCompany } = useApp();

  return (
    <div className="header">
      <div className="flex" style={{ alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600' }}>
          Sistema de Contabilidad
        </h1>
      </div>

      <div className="flex" style={{ alignItems: 'center', gap: '16px' }}>
        {companies.length > 0 && (
          <div>
            <select
              className="form-control"
              value={currentCompany?.id || ''}
              onChange={(e) => {
                const company = companies.find(c => c.id === e.target.value);
                setCurrentCompany(company);
              }}
              style={{ minWidth: '200px' }}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--primary-color)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {currentCompany?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
}
