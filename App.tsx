
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Drug, SaleRecord, User, FieldChange, ModificationLog } from './types';
import { dataService } from './services/dataService';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

// --- Context Setup ---
interface PharmacyContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  drugs: Drug[];
  deletedDrugs: Drug[];
  sales: SaleRecord[];
  addDrug: (d: Drug) => void;
  batchAddDrugs: (d: Drug[]) => void;
  updateDrug: (d: Drug) => void;
  deleteDrug: (id: string) => void;
  batchDeleteDrugs: (ids: string[]) => void;
  restoreDrug: (id: string) => void;
  permanentlyDeleteDrug: (id: string) => void;
  toggleDrugLock: (id: string) => void;
  recordSale: (s: SaleRecord) => void;
  refreshData: () => void;
  updateUser: (u: User) => void;
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) throw new Error("usePharmacy must be used within a PharmacyProvider");
  return context;
};

const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [deletedDrugs, setDeletedDrugs] = useState<Drug[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  // Initialize data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setDrugs(dataService.getDrugs());
    setDeletedDrugs(dataService.getDeletedDrugs());
    setSales(dataService.getSales());
  };

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  const addDrug = (drug: Drug) => {
    const drugWithHistory = { ...drug, history: [] };
    const newDrugs = [...drugs, drugWithHistory];
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);
  };

  const batchAddDrugs = (newDrugsList: Drug[]) => {
    const processedList = newDrugsList.map(d => ({ ...d, history: [] }));
    const newDrugs = [...drugs, ...processedList];
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);
  };

  const updateDrug = (updatedDrug: Drug) => {
    const originalDrug = drugs.find(d => d.id === updatedDrug.id);
    
    if (originalDrug) {
      // Calculate changes
      const changes: FieldChange[] = [];
      const fieldsToCheck: (keyof Drug)[] = ['name', 'code', 'category', 'manufacturer', 'price', 'stock', 'minStockThreshold', 'expiryDate', 'description', 'sideEffects'];
      
      fieldsToCheck.forEach(field => {
        if (originalDrug[field] !== updatedDrug[field]) {
           // Basic comparison (strict equality works for primitives in Drug)
           changes.push({
             field: field as string,
             oldValue: originalDrug[field],
             newValue: updatedDrug[field]
           });
        }
      });

      // If there are changes, record them
      if (changes.length > 0) {
        const modification: ModificationLog = {
          timestamp: new Date().toISOString(),
          changedBy: user?.name || '未知用户',
          changes: changes
        };
        
        updatedDrug.history = [modification, ...(originalDrug.history || [])];
      } else {
        // Preserve history if no changes detected but update called (e.g. strict mode re-renders)
        updatedDrug.history = originalDrug.history;
      }
    }

    const newDrugs = drugs.map(d => d.id === updatedDrug.id ? updatedDrug : d);
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);
  };

  const deleteDrug = (id: string) => {
    const drugToDelete = drugs.find(d => d.id === id);
    if (!drugToDelete) return;

    // Remove from active list
    const newDrugs = drugs.filter(d => d.id !== id);
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);

    // Add to deleted list with metadata
    const deletedDrug: Drug = {
      ...drugToDelete,
      deletedAt: new Date().toISOString(),
      deletedBy: user?.name || '未知用户'
    };
    const newDeletedDrugs = [deletedDrug, ...deletedDrugs];
    setDeletedDrugs(newDeletedDrugs);
    dataService.saveDeletedDrugs(newDeletedDrugs);
  };

  const batchDeleteDrugs = (ids: string[]) => {
    // Identify drugs to delete
    const drugsToDelete = drugs.filter(d => ids.includes(d.id));
    
    // Remove from active list
    const newDrugs = drugs.filter(d => !ids.includes(d.id));
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);

    // Add to deleted list with metadata
    const now = new Date().toISOString();
    const newDeletedItems = drugsToDelete.map(d => ({
      ...d,
      deletedAt: now,
      deletedBy: user?.name || '未知用户'
    }));

    const newDeletedDrugs = [...newDeletedItems, ...deletedDrugs];
    setDeletedDrugs(newDeletedDrugs);
    dataService.saveDeletedDrugs(newDeletedDrugs);
  };

  const restoreDrug = (id: string) => {
    const drugToRestore = deletedDrugs.find(d => d.id === id);
    if (!drugToRestore) return;

    // Remove from deleted list
    const newDeletedDrugs = deletedDrugs.filter(d => d.id !== id);
    setDeletedDrugs(newDeletedDrugs);
    dataService.saveDeletedDrugs(newDeletedDrugs);

    // Add back to active list (cleaning deletion metadata)
    const { deletedAt, deletedBy, ...cleanedDrug } = drugToRestore;
    const newDrugs = [cleanedDrug, ...drugs];
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);
  };

  const permanentlyDeleteDrug = (id: string) => {
    const newDeletedDrugs = deletedDrugs.filter(d => d.id !== id);
    setDeletedDrugs(newDeletedDrugs);
    dataService.saveDeletedDrugs(newDeletedDrugs);
  };

  const toggleDrugLock = (id: string) => {
    const newDrugs = drugs.map(d => 
      d.id === id ? { ...d, isLocked: !d.isLocked } : d
    );
    setDrugs(newDrugs);
    dataService.saveDrugs(newDrugs);
  };

  const recordSale = (sale: SaleRecord) => {
    // 1. Save Sale
    const newSales = dataService.addSale(sale);
    setSales(newSales);
    
    // 2. Update Inventory
    const updatedDrugs = [...drugs];
    sale.items.forEach(item => {
      const drugIndex = updatedDrugs.findIndex(d => d.id === item.drugId);
      if (drugIndex > -1) {
        updatedDrugs[drugIndex] = {
          ...updatedDrugs[drugIndex],
          stock: updatedDrugs[drugIndex].stock - item.quantity
        };
      }
    });
    setDrugs(updatedDrugs);
    dataService.saveDrugs(updatedDrugs);
  };

  const updateUser = (updatedUser: User) => {
    dataService.updateUser(updatedUser);
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  return (
    <PharmacyContext.Provider value={{ 
      user, login, logout, 
      drugs, deletedDrugs, sales, 
      addDrug, batchAddDrugs, updateDrug, 
      deleteDrug, batchDeleteDrugs, restoreDrug, permanentlyDeleteDrug,
      toggleDrugLock, recordSale, refreshData, updateUser 
    }}>
      {children}
    </PharmacyContext.Provider>
  );
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = usePharmacy();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// --- Main App ---
const App: React.FC = () => {
  return (
    <PharmacyProvider>
      <HashRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </HashRouter>
    </PharmacyProvider>
  );
};

export default App;