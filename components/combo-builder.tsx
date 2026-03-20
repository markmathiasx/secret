'use client';

import { useState, useMemo } from 'react';
import { catalog, type Product } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';
import { SafeProductImage } from '@/components/safe-product-image';
import { getProductImageCandidates } from '@/lib/product-images';
import { whatsappNumber } from '@/lib/constants';
import { isProductVisualVerified } from '@/lib/product-visuals';

const comboProfiles = [
  {
    id: 'presentes',
    label: 'Presentes criativos',
    description: 'Miniaturas, lembranças e itens com bom apelo para presente e datas especiais.',
    matcher: (product: Product) =>
      /(presente|criativo|lembran|chibi|colecion|miniatura|geek)/i.test(
        [product.category, product.subcategory, product.theme, product.name, ...product.tags].join(' ')
      ),
  },
  {
    id: 'setup',
    label: 'Setup e utilidades',
    description: 'Suportes, organizadores e soluções impressas para uso diário e bancada.',
    matcher: (product: Product) =>
      /(utilidade|setup|suporte|organizador|controle|headphone|bancada|banheiro)/i.test(
        [product.category, product.subcategory, product.theme, product.name, ...product.tags].join(' ')
      ),
  },
  {
    id: 'geek',
    label: 'Coleção geek',
    description: 'Peças com presença visual para bancada, estante e presente de fã.',
    matcher: (product: Product) =>
      /(geek|anime|game|colecion|miniatura|chibi|articulado)/i.test(
        [product.category, product.subcategory, product.theme, product.name, ...product.tags].join(' ')
      ),
  },
  {
    id: 'brindes',
    label: 'Brindes e lembranças',
    description: 'Chaveiros, medalhas, nomes e peças em lote para eventos, marcas e grupos.',
    matcher: (product: Product) =>
      /(chaveiro|medalha|nome 3d|lembran|institucional|brinde)/i.test(
        [product.category, product.subcategory, product.theme, product.name, ...product.tags].join(' ')
      ),
  },
] as const;

export function ComboBuilder() {
  const [selectedProfile, setSelectedProfile] = useState<(typeof comboProfiles)[number]['id']>('presentes');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const activeProfile = comboProfiles.find((profile) => profile.id === selectedProfile) || comboProfiles[0];
  const profileProducts = useMemo(() => {
    return catalog
      .filter(activeProfile.matcher)
      .sort((a, b) => Number(isProductVisualVerified(b)) - Number(isProductVisualVerified(a)) || Number(b.featured) - Number(a.featured) || a.pricePix - b.pricePix)
      .slice(0, 12);
  }, [activeProfile]);

  const summary = useMemo(() => {
    const total = selectedProducts.reduce((sum, product) => sum + product.pricePix, 0);
    const discount = selectedProducts.length >= 3 ? 0.1 : selectedProducts.length >= 2 ? 0.05 : 0;
    const finalPrice = total * (1 - discount);
    return {
      total,
      discount,
      finalPrice,
      savings: total - finalPrice,
    };
  }, [selectedProducts]);

  const toggleProduct = (product: Product) => {
    setSelectedProducts(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const whatsappHref = useMemo(() => {
    const lines = [
      `Oi! Quero montar um pedido da linha ${activeProfile.label}.`,
      '',
      ...selectedProducts.map((product, index) => `${index + 1}. ${product.name} — ${formatCurrency(product.pricePix)}`),
      '',
      `Total estimado: ${formatCurrency(summary.total)}`,
      `Desconto sugerido: ${summary.discount > 0 ? `${Math.round(summary.discount * 100)}%` : 'sem desconto'}`,
      `Total com desconto: ${formatCurrency(summary.finalPrice)}`,
    ];

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [activeProfile.label, selectedProducts, summary.discount, summary.finalPrice, summary.total]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Monte um pedido com mais ticket e menos atrito.</h2>
        <p className="text-white/70 mb-6">
          Em vez de navegar item por item, o cliente pode agrupar peças por intenção de compra. Dois itens já abrem conversa de desconto e três ou mais ajudam a fechar com mais valor.
        </p>

        <div className="mb-6">
          <label className="text-sm text-white/70 mb-2 block">Tipo de pedido</label>
          <select
            value={selectedProfile}
            onChange={(e) => {
              setSelectedProfile(e.target.value as (typeof comboProfiles)[number]['id']);
              setSelectedProducts([]);
            }}
            className="field-base"
          >
            {comboProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm leading-7 text-white/60">{activeProfile.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Seleção sugerida</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileProducts.map(product => (
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
                <div className="mb-2 flex flex-wrap gap-2">
                  {isProductVisualVerified(product) ? (
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                      Foto real
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                      Prévia do modelo
                    </span>
                  )}
                </div>
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
            <h3 className="text-lg font-semibold text-white mb-4">Resumo do pedido</h3>
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
                <span className="text-white">Subtotal</span>
                <span className="text-white">{formatCurrency(summary.total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-white/65">
                <span>Desconto sugerido</span>
                <span>{summary.discount > 0 ? `${Math.round(summary.discount * 100)}%` : '0%'}</span>
              </div>
              <div className="mt-2 flex justify-between text-lg font-bold">
                <span className="text-white">Total para fechar</span>
                <span className="text-cyan-300">{formatCurrency(summary.finalPrice)}</span>
              </div>
            </div>
            {summary.savings > 0 ? (
              <p className="mt-3 text-sm text-emerald-200">Economia sugerida: {formatCurrency(summary.savings)}</p>
            ) : null}
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full justify-center">
              Fechar este pedido no WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
