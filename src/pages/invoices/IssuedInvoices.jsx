import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import InvoicePreview from '../../components/invoices/InvoicePreview';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateAccountingEntry } from '../../services/accountingAI';
import { generateSmartAccountingEntry, isAIConfigured } from '../../services/smartAccountingAI';
import './IssuedInvoices.css';

const IssuedInvoices = () => {
  const {
    selectedCompany,
    issuedInvoices,
    addIssuedInvoice,
    updateIssuedInvoice,
    deleteIssuedInvoice,
    addAccountingEntry,
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const companyInvoices = useMemo(() => {
    if (!selectedCompany) return [];

    let filtered = issuedInvoices.filter(
      (inv) => inv.companyId === selectedCompany.id
    );

    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.number?.toLowerCase().includes(term) ||
          inv.client?.name?.toLowerCase().includes(term) ||
          inv.client?.nif?.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCompany, issuedInvoices, filterStatus, searchTerm]);

  const totals = useMemo(() => {
    return companyInvoices.reduce(
      (acc, inv) => {
        acc.total += inv.total || 0;
        if (inv.status === 'paid') {
          acc.paid += inv.total || 0;
        } else {
          acc.pending += inv.total || 0;
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [companyInvoices]);

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDeleteInvoice = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      deleteIssuedInvoice(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handlePreview = (invoice) => {
    setPreviewInvoice(invoice);
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { label: 'Borrador', className: 'status-draft' },
      sent: { label: 'Enviada', className: 'status-sent' },
      paid: { label: 'Pagada', className: 'status-paid' },
      pending: { label: 'Pendiente', className: 'status-pending' },
      overdue: { label: 'Vencida', className: 'status-overdue' },
    };
    const badge = badges[status] || badges.draft;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  if (!selectedCompany) {
    return (
      <div className="invoices-page">
        <div className="alert alert-info">
          <h3>Selecciona una empresa</h3>
          <p>Debes seleccionar una empresa antes de gestionar facturas</p>
          <Link to="/companies" className="btn btn-primary">
            Ir a Empresas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Facturas Emitidas</h1>
          <p className="subtitle">{selectedCompany.name}</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddInvoice}>
          ➕ Nueva Factura
        </button>
      </div>

      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          company={selectedCompany}
          type="issued"
          onClose={handleCloseForm}
          onSave={async (invoice) => {
            const fullInvoice = {
              ...invoice,
              companyId: selectedCompany.id,
              createdAt: new Date().toISOString(),
            };

            if (editingInvoice) {
              updateIssuedInvoice(editingInvoice.id, invoice);
            } else {
              addIssuedInvoice(fullInvoice);

              // Generate accounting entry automatically for new invoices
              const useSmartAI = isAIConfigured();
              let entry, suggestion;

              try {
                if (useSmartAI) {
                  // Use smart AI with Google Gemini
                  const result = await generateSmartAccountingEntry(fullInvoice, 'income');
                  entry = result.entry;
                  suggestion = result.suggestion;
                } else {
                  // Use basic rule-based AI
                  const result = generateAccountingEntry(fullInvoice, 'income');
                  entry = result.entry;
                  suggestion = result.suggestion;
                }

                entry.companyId = selectedCompany.id;
                addAccountingEntry(entry);

                // Show notification about accounting
                setTimeout(() => {
                  let message = `✅ Factura Creada\n\n` +
                    `🤖 Contabilización ${useSmartAI ? 'Inteligente' : 'Automática'}:\n` +
                    `Categoría: ${suggestion.categoryName || suggestion.category}\n` +
                    `Debe (${suggestion.debitAccount}): ${suggestion.debitAccountName}\n` +
                    `Haber (${suggestion.creditAccount}): ${suggestion.creditAccountName}\n`;

                  if (suggestion.isAsset) {
                    message += `\n🏭 ACTIVO DETECTADO:\n` +
                      `Tipo: ${suggestion.assetType}\n` +
                      `Amortización: ${suggestion.depreciationYears} años\n` +
                      `Anual: ${formatCurrency(suggestion.depreciationAnnual || 0)}\n`;
                  }

                  if (suggestion.explanation) {
                    message += `\n💡 ${suggestion.explanation}`;
                  }

                  if (suggestion.usingFallback) {
                    message += `\n\n⚠️ Usando IA básica. Configura Google Gemini en Ajustes para IA inteligente.`;
                  }

                  message += `\n\nEl asiento contable se ha generado automáticamente.`;
                  alert(message);
                }, 300);
              } catch (error) {
                console.error('Error generating accounting:', error);
                alert(`⚠️ Error al generar contabilidad: ${error.message}\n\nLa factura se ha creado pero sin asiento contable.`);
              }
            }
            handleCloseForm();
          }}
        />
      )}

      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          company={selectedCompany}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Facturado</h3>
          <p className="summary-value">{formatCurrency(totals.total)}</p>
          <span className="summary-label">{companyInvoices.length} facturas</span>
        </div>
        <div className="summary-card">
          <h3>Cobrado</h3>
          <p className="summary-value green">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="summary-card">
          <h3>Pendiente</h3>
          <p className="summary-value orange">{formatCurrency(totals.pending)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por número, cliente, NIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviadas</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidas</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {companyInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No hay facturas emitidas</h2>
          <p>Crea tu primera factura para empezar a facturar</p>
          <button className="btn btn-primary" onClick={handleAddInvoice}>
            Crear primera factura
          </button>
        </div>
      ) : (
        <div className="invoices-table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Base</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companyInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-number">{invoice.number}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td>
                    <div className="client-info">
                      <div className="client-name">{invoice.client?.name}</div>
                      <div className="client-nif">{invoice.client?.nif}</div>
                    </div>
                  </td>
                  <td>{formatCurrency(invoice.subtotal || 0)}</td>
                  <td>{formatCurrency(invoice.vat || 0)}</td>
                  <td className="total-cell">{formatCurrency(invoice.total || 0)}</td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handlePreview(invoice)}
                        title="Ver"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditInvoice(invoice)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        title="Eliminar"
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
    </div>
  );
};

export default IssuedInvoices;
