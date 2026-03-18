'use client';

import { useState, useMemo } from 'react';
import { catalog, type Product } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';
import { CatalogGrid } from '@/components/catalog-grid';
import { SafeProductImage } from '@/components/safe-product-image';
import { getProductImageCandidates } from '@/lib/product-images';

interface Combo {
  id: string;
  name: string;
  theme: string;
  products: Product[];
  discount: number; // percentage
}

const comboThemes = ['oceano', 'dragões', 'floresta', 'espacial', 'medieval'];

export function ComboBuilder() {
  const [selectedTheme, setSelectedTheme] = useState('oceano');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const themeProducts = useMemo(() => {
    return catalog.filter(product =>
      product.theme.toLowerCase().includes(selectedTheme.toLowerCase()) ||
      product.collection.toLowerCase().includes(selectedTheme.toLowerCase())
    );
  }, [selectedTheme]);

  const comboPrice = useMemo(() => {
    const total = selectedProducts.reduce((sum, product) => sum + product.pricePix, 0);
    const discount = selectedProducts.length >= 3 ? 0.1 : 0; // 10% off for 3+ items
    return total * (1 - discount);
  }, [selectedProducts]);

  const toggleProduct = (product: Product) => {
    setSelectedProducts(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Monte seu Kit Temático</h2>
        <p className="text-white/70 mb-6">
          Selecione produtos de um tema para criar seu combo personalizado.
          Kits com 3+ itens ganham 10% de desconto!
        </p>

        <div className="mb-6">
          <label className="text-sm text-white/70 mb-2 block">Tema do Kit</label>
          <select
            value={selectedTheme}
            onChange={(e) => {
              setSelectedTheme(e.target.value);
              setSelectedProducts([]);
            }}
            className="field-base"
          >
            {comboThemes.map(theme => (
              <option key={theme} value={theme}>
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Produtos do Tema &quot;{selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}&quot;
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themeProducts.map(product => (
              <div
                key={product.id}
                className={`rounded-[28px] border p-4 cursor-pointer transition ${
                  selectedProducts.find(p => p.id === product.id)
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/10 bg-white/5 hover:border-cyan-300/30'
                }`}
                onClick={() => toggleProduct(product)}
              >
                <SafeProductImage
                  candidates={getProductImageCandidates(product)}
                  alt={product.name}
                  className="aspect-square w-full object-cover rounded-lg mb-3"
                />
                <h4 className="text-sm font-semibold text-white mb-1">{product.name}</h4>
                <p className="text-xs text-white/55 mb-2">{formatCurrency(product.pricePix)}</p>
                {selectedProducts.find(p => p.id === product.id) && (
                  <div className="text-xs text-cyan-300">✓ Selecionado</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Seu Kit</h3>
            <div className="space-y-2 mb-4">
              {selectedProducts.map(product => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-white/70">{product.name}</span>
                  <span className="text-white">{formatCurrency(product.pricePix)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">
                  Total {selectedProducts.length >= 3 ? '(10% off)' : ''}
                </span>
                <span className="text-cyan-300">{formatCurrency(comboPrice)}</span>
              </div>
            </div>
            <button className="btn-primary w-full mt-4">
              Solicitar Orçamento do Kit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}