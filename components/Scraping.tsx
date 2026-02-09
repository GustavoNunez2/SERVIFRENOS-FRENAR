import React, { useState } from 'react';
import { db } from '../db';
import { Product, BrandConfig } from '../types';
import { Globe, Sparkles, Loader2, Plus } from 'lucide-react';
import { extractProductsFromText } from '../geminiService';

interface ScrapingProps {
  onComplete: () => void;
  config: BrandConfig;
}

const Scraping: React.FC<ScrapingProps> = ({ onComplete, config }) => {
  const [rawText, setRawText] = useState('');
  const [extractedProducts, setExtractedProducts] = useState<Partial<Product>[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const results = await extractProductsFromText(rawText);
      setExtractedProducts(results);
    } catch (e) {
      alert('Error en el análisis. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  const addToInventory = async (p: Partial<Product>) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      code: p.code || `WEB-${Math.floor(Math.random() * 10000)}`,
      name: p.name || 'Producto Nuevo',
      price: Number(p.price) || 0,
      cost: 0,
      stock: 0,
      category: p.category || 'General',
      source: 'external'
    };
    await db.saveProduct(newProduct);
    setExtractedProducts(prev => prev.filter(item => item !== p));
    onComplete();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Sparkles className="text-indigo-600" /> AI Scraper
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border">
          <textarea
            className="w-full h-64 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Pega el HTML o texto de la web del proveedor..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button
            onClick={handleExtract}
            disabled={loading || !rawText}
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Extraer Productos con IA'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border overflow-y-auto max-h-[400px]">
          <h2 className="font-bold mb-4 text-gray-500 uppercase text-xs tracking-wider">Productos Detectados</h2>
          {extractedProducts.map((p, i) => (
            <div key={i} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
              <div>
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-indigo-600 font-bold text-xs">{config.currency}{p.price}</p>
              </div>
              <button onClick={() => addToInventory(p)} className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Plus size={18} />
              </button>
            </div>
          ))}
          {extractedProducts.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400 text-sm">Sin datos para mostrar</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scraping;