import React, { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import { Product, View, BrandConfig, Sale, ExternalSource } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import SalesHistory from './components/SalesHistory';
import BulkImport from './components/BulkImport';
import Scraping from './components/Scraping';
import Settings from './components/Settings';
import SourcesManager from './components/SourcesManager';

// Configuración por defecto para asegurar que la UI siempre tenga datos
const DEFAULT_BRAND: BrandConfig = {
  name: 'NovaPOS',
  logo: 'https://picsum.photos/200/200',
  primaryColor: '#6366f1',
  secondaryColor: '#4f46e5',
  currency: '$',
  receiptFooter: '¡Gracias por su compra!',
  searchMode: 'local'
};

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [sources, setSources] = useState<ExternalSource[]>([]);
  const [config, setConfig] = useState<BrandConfig>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(true);

  // Carga de datos desde IndexedDB (db.ts)
  const refreshData = useCallback(async () => {
    try {
      await db.init();
      const [p, s, c, src] = await Promise.all([
        db.getAllProducts(),
        db.getAllSales(),
        db.getConfig(),
        db.getAllExternalSources()
      ]);
      
      setProducts(p || []);
      setSales(s || []);
      setSources(src || []);
      if (c) setConfig(c);
    } catch (error) {
      console.error("Error cargando base de datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Aplicación de colores dinámicos al documento
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
  }, [config]);

  const updateConfig = async (newConfig: BrandConfig) => {
    await db.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const toggleSearchMode = async () => {
    const newMode = config.searchMode === 'local' ? 'global' : 'local';
    const newConfig = { ...config, searchMode: newMode };
    await updateConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2" 
          style={{ borderBottomColor: config.primaryColor }}
        ></div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case View.DASHBOARD:
        return <Dashboard products={products} sales={sales} config={config} />;
      case View.POS:
        return (
          <POS 
            products={products} 
            onSaleComplete={refreshData} 
            config={config} 
            externalSources={sources}
            onToggleSearch={toggleSearchMode}
          />
        );
      case View.INVENTORY:
        return <Inventory products={products} onUpdate={refreshData} config={config} />;
      case View.SALES_HISTORY:
        return <SalesHistory sales={sales} config={config} />;
      case View.IMPORT:
        return <BulkImport onComplete={refreshData} config={config} />;
      case View.SCRAPING:
        return <Scraping onComplete={refreshData} config={config} />;
      case View.SOURCES:
        return <SourcesManager onUpdate={refreshData} config={config} />;
      case View.SETTINGS:
        return <Settings config={config} onSave={updateConfig} />;
      default:
        return <Dashboard products={products} sales={sales} config={config} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar currentView={view} setView={setView} config={config} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;