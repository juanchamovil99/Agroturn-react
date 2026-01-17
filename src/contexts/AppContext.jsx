import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [issuedInvoices, setIssuedInvoices] = useState([]);
  const [receivedInvoices, setReceivedInvoices] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [accountingEntries, setAccountingEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedCompanies = localStorage.getItem('companies');
        const storedCurrentCompany = localStorage.getItem('currentCompany');
        const storedIssuedInvoices = localStorage.getItem('issuedInvoices');
        const storedReceivedInvoices = localStorage.getItem('receivedInvoices');
        const storedBankTransactions = localStorage.getItem('bankTransactions');
        const storedAccountingEntries = localStorage.getItem('accountingEntries');
        const storedCustomers = localStorage.getItem('customers');
        const storedSuppliers = localStorage.getItem('suppliers');

        if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
        if (storedCurrentCompany) setCurrentCompany(JSON.parse(storedCurrentCompany));
        if (storedIssuedInvoices) setIssuedInvoices(JSON.parse(storedIssuedInvoices));
        if (storedReceivedInvoices) setReceivedInvoices(JSON.parse(storedReceivedInvoices));
        if (storedBankTransactions) setBankTransactions(JSON.parse(storedBankTransactions));
        if (storedAccountingEntries) setAccountingEntries(JSON.parse(storedAccountingEntries));
        if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
        if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('currentCompany', JSON.stringify(currentCompany));
    }
  }, [currentCompany]);

  useEffect(() => {
    localStorage.setItem('issuedInvoices', JSON.stringify(issuedInvoices));
  }, [issuedInvoices]);

  useEffect(() => {
    localStorage.setItem('receivedInvoices', JSON.stringify(receivedInvoices));
  }, [receivedInvoices]);

  useEffect(() => {
    localStorage.setItem('bankTransactions', JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem('accountingEntries', JSON.stringify(accountingEntries));
  }, [accountingEntries]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Company methods
  const addCompany = (company) => {
    const newCompany = {
      ...company,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setCompanies([...companies, newCompany]);
    if (!currentCompany) {
      setCurrentCompany(newCompany);
    }
    return newCompany;
  };

  const updateCompany = (id, updates) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates } : c));
    if (currentCompany?.id === id) {
      setCurrentCompany({ ...currentCompany, ...updates });
    }
  };

  const deleteCompany = (id) => {
    setCompanies(companies.filter(c => c.id !== id));
    if (currentCompany?.id === id) {
      setCurrentCompany(companies.find(c => c.id !== id) || null);
    }
  };

  // Invoice methods
  const addIssuedInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      companyId: currentCompany.id,
      createdAt: new Date().toISOString()
    };
    setIssuedInvoices([...issuedInvoices, newInvoice]);
    return newInvoice;
  };

  const updateIssuedInvoice = (id, updates) => {
    setIssuedInvoices(issuedInvoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  const deleteIssuedInvoice = (id) => {
    setIssuedInvoices(issuedInvoices.filter(inv => inv.id !== id));
  };

  const addReceivedInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: Date.now().toString(),
      companyId: currentCompany.id,
      createdAt: new Date().toISOString()
    };
    setReceivedInvoices([...receivedInvoices, newInvoice]);
    return newInvoice;
  };

  const updateReceivedInvoice = (id, updates) => {
    setReceivedInvoices(receivedInvoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  const deleteReceivedInvoice = (id) => {
    setReceivedInvoices(receivedInvoices.filter(inv => inv.id !== id));
  };

  // Customer/Supplier methods
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
      companyId: currentCompany.id,
      createdAt: new Date().toISOString()
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };

  const addSupplier = (supplier) => {
    const newSupplier = {
      ...supplier,
      id: Date.now().toString(),
      companyId: currentCompany.id,
      createdAt: new Date().toISOString()
    };
    setSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  };

  // Bank transaction methods
  const addBankTransactions = (transactions) => {
    const newTransactions = transactions.map(t => ({
      ...t,
      id: t.id || Date.now().toString() + Math.random(),
      companyId: currentCompany.id,
      importedAt: new Date().toISOString()
    }));
    setBankTransactions([...bankTransactions, ...newTransactions]);
    return newTransactions;
  };

  // Accounting entry methods
  const addAccountingEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      companyId: currentCompany.id,
      createdAt: new Date().toISOString()
    };
    setAccountingEntries([...accountingEntries, newEntry]);
    return newEntry;
  };

  const value = {
    // State
    companies,
    currentCompany,
    issuedInvoices,
    receivedInvoices,
    bankTransactions,
    accountingEntries,
    customers,
    suppliers,
    // Methods
    setCurrentCompany,
    addCompany,
    updateCompany,
    deleteCompany,
    addIssuedInvoice,
    updateIssuedInvoice,
    deleteIssuedInvoice,
    addReceivedInvoice,
    updateReceivedInvoice,
    deleteReceivedInvoice,
    addCustomer,
    addSupplier,
    addBankTransactions,
    addAccountingEntry
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
