"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button-simple';
import { Progress } from '@/components/ui/progress';
import { Gift, Package, Truck, Plus, Sparkles } from 'lucide-react';
import { getComplementaryProducts, getNextPurchaseRecommendations, RecommendationResult } from '@/lib/ai-recommender';

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 150;

// Types
interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Smart Upsell in Cart
export function CartUpsell() {
  const { items, getTotalPrice } = useCart();
  const total = getTotalPrice();
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  
  return (
    <div className="space-y-4">
      {/* Free Shipping Progress */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
        <CardContent className="p-4">
          {missingForFreeShipping > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">
                  Falta {formatCurrency(missingForFreeShipping)} para frete grátis!
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-white/60 mt-2">
                Adicione mais itens e economize no frete
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400">
              <Gift className="w-5 h-5" />
              <span className="font-medium">Parabéns! Você ganhou frete grátis 🎉</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bundle Builder */}
      {items.length >= 2 && <BundleBuilder items={items} />}
    </div>
  );
}

// Bundle Builder Component
function BundleBuilder({ items }: { items: CartItem[] }) {
  const [bundleDiscount, setBundleDiscount] = useState(0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  useEffect(() => {
    // Calculate bundle discount
    if (totalItems >= 5) setBundleDiscount(0.15);
    else if (totalItems >= 3) setBundleDiscount(0.10);
    else if (totalItems >= 2) setBundleDiscount(0.05);
    else setBundleDiscount(0);
  }, [totalItems]);
  
  if (bundleDiscount === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-white font-medium">Monte seu kit</p>
              <p className="text-sm text-white/60">
                Adicione mais {3 - totalItems} item(s) e ganhe 10% de desconto
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const discountPercent = Math.round(bundleDiscount * 100);
  
  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-white font-medium">Desconto por volume ativo! 🎉</p>
              <p className="text-sm text-white/60">
                {discountPercent}% OFF no seu kit de {totalItems} itens
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-purple-400">-{discountPercent}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Product Page Upsell
export function ProductUpsell({ productId }: { productId: string }) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  
  useEffect(() => {
    getComplementaryProducts(productId, 3)
      .then(setRecommendations)
      .finally(() => setLoading(false));
  }, [productId]);
  
  if (loading || recommendations.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-cyan-400" />
        Combina com este produto
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.product.id} className="bg-white/5 border-white/10 group hover:border-cyan-500/50 transition-colors">
            <CardContent className="p-4">
              <Link href={`/loja/${rec.product.category}/${rec.product.slug}`}>
                <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-white/5">
                  {rec.product.image && (
                    <Image
                      src={rec.product.image}
                      alt={rec.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
              </Link>
              
              <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                {rec.product.name}
              </h4>
              
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">
                  {formatCurrency(rec.product.price)}
                </span>
                <Button
                  size="sm"
                  onClick={() => addItem({
                    id: rec.product.id,
                    slug: rec.product.slug,
                    name: rec.product.name,
                    price: rec.product.price,
                    image: rec.product.image,
                  })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {rec.reason && (
                <p className="text-xs text-white/50 mt-2">{rec.reason}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Post-Purchase Upsell (shown on success page)
export function PostPurchaseUpsell({ orderItems }: { orderItems: string[] }) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  
  useEffect(() => {
    getNextPurchaseRecommendations(orderItems, 3)
      .then(setRecommendations)
      .finally(() => setLoading(false));
  }, [orderItems]);
  
  if (loading || recommendations.length === 0) return null;
  
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
      <h3 className="text-lg font-semibold text-white mb-2">
        🎯 Próxima compra recomendada
      </h3>
      <p className="text-white/60 mb-4">
        Quem comprou seus itens também adquiriu:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.product.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <Link href={`/loja/${rec.product.category}/${rec.product.slug}`}>
                <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-white/5">
                  {rec.product.image && (
                    <Image
                      src={rec.product.image}
                      alt={rec.product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </Link>
              
              <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                {rec.product.name}
              </h4>
              
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">
                  {formatCurrency(rec.product.price)}
                </span>
                <Button
                  size="sm"
                  onClick={() => addItem({
                    id: rec.product.id,
                    slug: rec.product.slug,
                    name: rec.product.name,
                    price: rec.product.price,
                    image: rec.product.image,
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <p className="text-xs text-white/40 mt-4 text-center">
        Use o código PRIMEIRA10 para 10% OFF na próxima compra (válido por 7 dias)
      </p>
    </div>
  );
}

// Installment Calculator
export function InstallmentCalculator({ price }: { price: number }) {
  const [installments, setInstallments] = useState(1);
  const maxInstallments = 12;
  const minValuePerInstallment = 20;
  const maxAllowed = Math.min(maxInstallments, Math.floor(price / minValuePerInstallment));
  
  const installmentValue = price / installments;
  const interestRate = installments <= 6 ? 0 : (installments - 6) * 0.0199; // 1.99% ao mês após 6x
  const totalWithInterest = price * (1 + interestRate);
  const installmentWithInterest = totalWithInterest / installments;
  
  return (
    <div className="space-y-3">
      <p className="text-white/80 text-sm">Parcelamento</p>
      
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: maxAllowed }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setInstallments(n)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              installments === n
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {n}x
          </button>
        ))}
      </div>
      
      <div className="text-white">
        <span className="text-2xl font-bold">
          {formatCurrency(installments <= 6 ? installmentValue : installmentWithInterest)}
        </span>
        <span className="text-white/60 ml-2">
          {installments <= 6 ? 'sem juros' : 'com juros'}
        </span>
      </div>
      
      {installments > 6 && (
        <p className="text-xs text-amber-400">
          Total: {formatCurrency(totalWithInterest)} (juros de {Math.round(interestRate * 100)}%)
        </p>
      )}
    </div>
  );
}

