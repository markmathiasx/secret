"use client";

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Truck, TrendingUp, Users } from 'lucide-react';
import { getCachedData, cacheTtl } from '@/lib/cache';

// Types
interface UrgencyData {
  viewers: number;
  stock: number;
  lastPurchase?: {
    productName: string;
    timeAgo: string;
    location: string;
  };
  deliveryEstimate?: {
    date: string;
    cutoffTime: string;
  };
}

// Real-time viewer counter backed by the application API. Do not show simulated demand.
export function RealTimeViewers({ productId }: { productId: string }) {
  const [viewers, setViewers] = useState(0);
  
  useEffect(() => {
    // Subscribe to real-time viewer count
    const fetchViewers = async () => {
      const data = await getCachedData(
        `viewers:${productId}`,
        async () => {
          const res = await fetch(`/api/products/${productId}/viewers`);
          return res.json();
        },
        { memoryTtl: 5000, redisTtl: 10 } // Very short TTL for real-time feel
      );
      setViewers(data.count || 0);
    };
    
    fetchViewers();
    const interval = setInterval(fetchViewers, 10000); // Update every 10s
    
    return () => clearInterval(interval);
  }, [productId]);
  
  if (viewers < 5) return null; // Only show if meaningful
  
  return (
    <div className="flex items-center gap-2 text-amber-400 animate-pulse">
      <Flame className="w-4 h-4" />
      <span className="text-sm font-medium">
        {viewers} visualizações ativas confirmadas
      </span>
    </div>
  );
}

// Real stock counter (only shows if < 5)
export function LowStockIndicator({ stock }: { stock: number }) {
  if (stock >= 5) return null;
  
  const messages: Record<number, string> = {
    1: "Ultima unidade em estoque",
    2: "2 unidades em estoque",
    3: "3 unidades em estoque",
    4: "4 unidades em estoque",
  };
  
  return (
    <div className="flex items-center gap-2 text-red-400">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">{messages[stock]}</span>
    </div>
  );
}

// Smart delivery estimate based on CEP
export function DeliveryEstimate({ 
  productId,
  userPostalCode 
}: { 
  productId: string;
  userPostalCode?: string;
}) {
  const [estimate, setEstimate] = useState<{
    date: string;
    cutoffTime: string;
    hoursRemaining: number;
  } | null>(null);
  
  useEffect(() => {
    if (!userPostalCode) return;
    
    const fetchEstimate = async () => {
      const res = await fetch(`/api/shipping/estimate?productId=${productId}&postalCode=${userPostalCode}`);
      if (res.ok) {
        const data = await res.json();
        setEstimate(data);
      }
    };
    
    fetchEstimate();
  }, [productId, userPostalCode]);
  
  if (!estimate) return null;
  
  const isUrgent = estimate.hoursRemaining < 4;
  
  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-green-400' : 'text-cyan-400'}`}>
      <Truck className="w-4 h-4" />
      <span className="text-sm">
        Entrega estimada: {estimate.date}
        {isUrgent && (
          <span className="font-medium ml-1">
            (confirmar ate {estimate.cutoffTime})
          </span>
        )}
      </span>
    </div>
  );
}

// Recent purchase notification
export function RecentPurchaseTicker() {
  const [purchase, setPurchase] = useState<{
    productName: string;
    location: string;
    timeAgo: string;
  } | null>(null);
  
  useEffect(() => {
    const fetchRecent = async () => {
      const res = await fetch('/api/analytics/recent-purchases');
      if (res.ok) {
        const data = await res.json();
        setPurchase(data[0] || null);
      }
    };
    
    fetchRecent();
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (!purchase) return null;
  
  return (
    <div className="flex items-center gap-2 text-emerald-400 text-sm">
      <TrendingUp className="w-4 h-4" />
      <span>
        Pedido recente confirmado: {purchase.productName} em {purchase.location} ({purchase.timeAgo})
      </span>
    </div>
  );
}

// Best seller badge with real data
export function BestSellerBadge({ 
  productId,
  category 
}: { 
  productId: string;
  category: string;
}) {
  const [rank, setRank] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchRank = async () => {
      const res = await fetch(`/api/products/${productId}/rank?category=${category}`);
      if (res.ok) {
        const data = await res.json();
        setRank(data.rank);
      }
    };
    
    fetchRank();
  }, [productId, category]);
  
  if (!rank || rank > 3) return null;
  
  const badges = ['Destaque confirmado #1', 'Destaque confirmado #2', 'Destaque confirmado #3'];
  
  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 
                    text-amber-400 px-3 py-1 rounded-full text-sm font-medium border border-amber-500/30">
      <Users className="w-4 h-4" />
      {badges[rank - 1]} da semana
    </div>
  );
}

// Combined urgency bar for PDP
export function UrgencyBar({ 
  productId,
  stock,
  category,
  userPostalCode 
}: {
  productId: string;
  stock: number;
  category: string;
  userPostalCode?: string;
}) {
  return (
    <div className="space-y-2 py-3">
      <BestSellerBadge productId={productId} category={category} />
      <RealTimeViewers productId={productId} />
      <LowStockIndicator stock={stock} />
      <DeliveryEstimate productId={productId} userPostalCode={userPostalCode} />
      <RecentPurchaseTicker />
    </div>
  );
}

// Countdown timer for flash sales
export function FlashSaleCountdown({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime]);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return (
    <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg">
      <Clock className="w-5 h-5 animate-pulse" />
      <span className="font-mono font-bold">
        Termina em: {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
}

// Trust indicators
export function TrustIndicators() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Entrega em 24-48h</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>7 dias para troca</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Pagamento seguro</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Produção local RJ</span>
      </div>
    </div>
  );
}
