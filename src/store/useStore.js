import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Companies
      companies: [],
      selectedCompany: null,

      // Invoices
      issuedInvoices: [],
      receivedInvoices: [],

      // Banking
      bankTransactions: [],

      // Accounting
      accountingEntries: [],
      chartOfAccounts: [],

      // Actions - Companies
      addCompany: (company) =>
        set((state) => ({
          companies: [...state.companies, { ...company, id: Date.now().toString() }],
        })),

      updateCompany: (id, updatedCompany) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id ? { ...c, ...updatedCompany } : c
          ),
        })),

      deleteCompany: (id) =>
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
        })),

      setSelectedCompany: (company) => set({ selectedCompany: company }),

      // Actions - Issued Invoices
      addIssuedInvoice: (invoice) =>
        set((state) => ({
          issuedInvoices: [...state.issuedInvoices, invoice],
        })),

      updateIssuedInvoice: (id, updatedInvoice) =>
        set((state) => ({
          issuedInvoices: state.issuedInvoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
          ),
        })),

      deleteIssuedInvoice: (id) =>
        set((state) => ({
          issuedInvoices: state.issuedInvoices.filter((inv) => inv.id !== id),
        })),

      // Actions - Received Invoices
      addReceivedInvoice: (invoice) =>
        set((state) => ({
          receivedInvoices: [...state.receivedInvoices, invoice],
        })),

      updateReceivedInvoice: (id, updatedInvoice) =>
        set((state) => ({
          receivedInvoices: state.receivedInvoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
          ),
        })),

      deleteReceivedInvoice: (id) =>
        set((state) => ({
          receivedInvoices: state.receivedInvoices.filter((inv) => inv.id !== id),
        })),

      // Actions - Banking
      addBankTransaction: (transaction) =>
        set((state) => ({
          bankTransactions: [...state.bankTransactions, transaction],
        })),

      addBankTransactions: (transactions) =>
        set((state) => ({
          bankTransactions: [...state.bankTransactions, ...transactions],
        })),

      // Actions - Accounting
      addAccountingEntry: (entry) =>
        set((state) => ({
          accountingEntries: [...state.accountingEntries, entry],
        })),

      setChartOfAccounts: (accounts) => set({ chartOfAccounts: accounts }),

      // Getters
      getCompanyById: (id) => {
        const state = get();
        return state.companies.find((c) => c.id === id);
      },

      getIssuedInvoicesByCompany: (companyId) => {
        const state = get();
        return state.issuedInvoices.filter((inv) => inv.companyId === companyId);
      },

      getReceivedInvoicesByCompany: (companyId) => {
        const state = get();
        return state.receivedInvoices.filter((inv) => inv.companyId === companyId);
      },
    }),
    {
      name: 'accounting-storage',
    }
  )
);

export default useStore;
