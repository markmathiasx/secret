'use client';

import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';
import { Bookmark, Clock3, Heart, LogOut, MessageCircleMore, Scale, Search, ShieldCheck, Star, Truck, Wallet } from 'lucide-react';
import { featuredCatalog, findProduct, getProductUrl, type Product } from '@/lib/catalog';
import { useAuth } from '@/components/auth-context';
import { useFavorites } from '@/components/favorites-context';
import { useRecentlyViewed } from '@/components/recently-viewed-context';
import { useSavedSearches } from '@/components/saved-searches-context';
import { useCompare } from '@/components/compare-context';
import { ProductShelf } from '@/components/product-shelf';
import { CopyButton } from '@/components/copy-button';
import { formatCurrency } from '@/lib/utils';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const { favoriteIds } = useFavorites();
  const { recentIds } = useRecentlyViewed();
  const { savedSearches, savedSearchCount } = useSavedSearches();
  const { compareIds, compareCount } = useCompare();

  const favoriteProducts = useMemo(
    () => favoriteIds.map((id) => findProduct(id)).filter((item): item is Product => Boolean(item)),
    [favoriteIds]
  );
  const recentProducts = useMemo(
    () => recentIds.map((id) => findProduct(id)).filter((item): item is Product => Boolean(item)),
    [recentIds]
  );
  const compareProducts = useMemo(
    () => compareIds.map((id) => findProduct(id)).filter((item): item is Product => Boolean(item)),
    [compareIds]
  );

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'cliente';
  const totalFavoritePix = favoriteProducts.reduce((total, item) => total + item.pricePix, 0);
  const averageRecentPix = recentProducts.length
    ? recentProducts.reduce((total, item) => total + item.pricePix, 0) / recentProducts.length
    : 0;
  const favoriteRealPhotos = favoriteProducts.filter((item) => item.realPhoto).length;
  const recentReady = recentProducts.filter((item) => item.status === 'Pronta entrega').length;
  const compareHref = compareProducts.length ? `/comparar?ids=${compareProducts.slice(0, 4).map((item) => item.id).join(',')}` : '/comparar';
  const compareBundle = compareProducts.map((item) => `${item.name} (${item.sku})`).join('\n');
  const topFavorite = [...favoriteProducts].sort((a, b) => b.rating - a.rating)[0];
  const newestSearch = savedSearches[0];
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `${whatsappMessage}\n\nQuero suporte pela área da conta.`
  )}`;

  if (loading) {
    return <section className="mx-auto max-w-6xl px-6 py-20 text-slate-600">Carregando sua conta...</section>;
  }

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Área do cliente</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">
          {user ? `Olá, ${displayName}` : 'Sua central de retomada e fechamento'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {user
            ? `Conta conectada com ${user.email}. A página agora funciona como painel comercial da sua jornada na MDH 3D.`
            : 'Mesmo sem login, a conta já serve como painel útil com favoritos, recentes, comparador e buscas salvas no seu próprio navegador.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {!user ? (
            <Link href="/login" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              Entrar agora
            </Link>
          ) : (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          )}
          <Link href="/catalogo" className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            Ir para o catálogo
          </Link>
          {compareProducts.length ? <CopyButton value={compareBundle} label="Copiar itens do comparador" /> : null}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700"
          >
            <MessageCircleMore className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-6">
        <StatCard label="Favoritos" value={String(favoriteProducts.length).padStart(2, '0')} helper="Shortlist pronta para comparar" />
        <StatCard label="Recentes" value={String(recentProducts.length).padStart(2, '0')} helper="Produtos abertos recentemente" />
        <StatCard label="Buscas salvas" value={String(savedSearchCount).padStart(2, '0')} helper="Recortes prontos para reabrir" />
        <StatCard label="Comparador" value={String(compareCount).padStart(2, '0')} helper="Itens separados lado a lado" />
        <StatCard label="Fotos reais favoritas" value={String(favoriteRealPhotos).padStart(2, '0')} helper="Provas visuais fortes na sua conta" />
        <StatCard label="Total favorito no Pix" value={formatCurrency(totalFavoritePix)} helper="Soma dos salvos atuais" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Próximas ações</p>
          <div className="mt-4 grid gap-3">
            {[
              { href: '/favoritos', title: 'Revisar favoritos', copy: 'Transforme salvos em shortlist de fechamento.' },
              { href: '/recentes', title: 'Retomar navegação', copy: 'Volte para itens vistos sem recomeçar a busca.' },
              { href: '/buscas-salvas', title: 'Abrir buscas salvas', copy: 'Reaproveite recortes completos do catálogo.' },
              { href: compareHref, title: 'Comparar lado a lado', copy: 'Feche decisão olhando preço, prazo e prova visual.' },
              { href: '/suporte', title: 'Abrir central de suporte', copy: 'Acesse envio, devolução, garantia e contato.' },
            ].map((item) => (
              <Link key={item.href + item.title} href={item.href} className="rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4 transition hover:-translate-y-0.5">
                <p className="font-black text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resumo da sessão</p>
          <div className="mt-4 grid gap-3">
            <QuickInfo icon={<Wallet className="h-4 w-4" />} label="Preço médio dos recentes" value={formatCurrency(averageRecentPix)} />
            <QuickInfo icon={<Bookmark className="h-4 w-4" />} label="Última busca salva" value={newestSearch?.label || 'Nenhuma ainda'} />
            <QuickInfo icon={<Clock3 className="h-4 w-4" />} label="Último produto visto" value={recentProducts[0]?.name || 'Nenhum ainda'} />
            <QuickInfo icon={<ShieldCheck className="h-4 w-4" />} label="Regra da vitrine" value="Foto real e conceitual separadas" />
            <QuickInfo icon={<Truck className="h-4 w-4" />} label="Recentes prontos" value={`${recentReady}/${recentProducts.length || 0}`} />
            <QuickInfo icon={<Star className="h-4 w-4" />} label="Melhor favorito" value={topFavorite?.name || 'Nenhum ainda'} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <InsightCard
          icon={<Heart className="h-4 w-4" />}
          label="Leitura de conta"
          title={favoriteProducts.length ? 'Conta com shortlist ativa' : 'Conta pronta para começar'}
          description={favoriteProducts.length ? 'Você já tem base suficiente para comparar e fechar.' : 'Basta abrir o catálogo e começar a guardar seus itens mais fortes.'}
        />
        <InsightCard
          icon={<Scale className="h-4 w-4" />}
          label="Comparação"
          title={compareCount ? `${compareCount} item(ns) no comparador` : 'Comparador vazio'}
          description={compareCount ? 'A decisão já pode ser fechada com leitura lado a lado.' : 'Quando houver até 4 itens fortes, o comparador vira sua rota mais curta.'}
        />
        <InsightCard
          icon={<Search className="h-4 w-4" />}
          label="Memória de navegação"
          title={savedSearchCount ? `${savedSearchCount} recorte(s) salvo(s)` : 'Sem recortes salvos'}
          description={savedSearchCount ? 'Você já consegue retomar pesquisas sem refazer filtros.' : 'Salvar recortes reduz bastante o retrabalho comercial.'}
        />
        <InsightCard
          icon={<MessageCircleMore className="h-4 w-4" />}
          label="Atendimento"
          title="Conta conectada ao humano"
          description="Quando o recorte estiver maduro, a melhor saída continua sendo mandar SKU, link ou shortlist direto no WhatsApp."
        />
      </div>

      {favoriteProducts.length ? (
        <div className="mt-6">
          <ProductShelf
            title="Favoritos dentro da conta"
            description="Sua shortlist pessoal continua acessível dentro da conta, pronta para comparar ou compartilhar."
            products={favoriteProducts}
            href="/favoritos"
            hrefLabel="Abrir favoritos"
            variant="favorites"
          />
        </div>
      ) : null}

      {recentProducts.length ? (
        <div className="mt-6">
          <ProductShelf
            title="Retomada rápida da sessão"
            description="Os itens recentes entram na conta como uma fila de retomada para reduzir atrito na jornada."
            products={recentProducts}
            href="/recentes"
            hrefLabel="Abrir recentes"
            variant="recent"
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Buscas salvas</p>
          <div className="mt-4 grid gap-3">
            {savedSearches.length ? (
              savedSearches.slice(0, 4).map((item) => (
                <Link key={item.id} href={item.url} className="rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4 transition hover:-translate-y-0.5">
                  <p className="font-black text-slate-900">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4">
                <p className="font-black text-slate-900">Nenhuma busca salva ainda.</p>
                <p className="mt-2 text-sm text-slate-600">No catálogo, salve um recorte para transformar pesquisa em atalho comercial.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#e8dac7] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recomendados agora</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {featuredCatalog.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={getProductUrl(item)}
                className="rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4 transition hover:-translate-y-0.5"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.category}</p>
                <p className="mt-2 font-black text-slate-900">{item.name}</p>
                <p className="mt-2 text-sm text-slate-600">{formatCurrency(item.pricePix)} no Pix</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <InfoBlock
          title="1. Navegue e guarde"
          description="Use favoritos para shortlist, recentes para retomar o raciocínio e comparador para decidir sem ruído."
        />
        <InfoBlock
          title="2. Salve recortes fortes"
          description="Buscas salvas viram atalhos úteis para orçamento, recorrência e revisão de uma mesma linha ou estilo."
        />
        <InfoBlock
          title="3. Feche com contexto"
          description="Quando falar com o atendimento, mande SKU, link do comparador ou recorte salvo. Isso acelera a conversa e reduz erro."
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        {[
          { href: '/suporte/envio', title: 'Entrega e frete' },
          { href: '/trocas-e-devolucoes', title: 'Trocas e devoluções' },
          { href: '/faq', title: 'FAQ' },
          { href: '/politica-de-privacidade', title: 'Privacidade e LGPD' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-[24px] border border-[#e8dac7] bg-white p-5 transition hover:-translate-y-0.5">
            <p className="text-lg font-black text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm text-slate-600">Acesso rápido para confirmar política, prazo e confiança antes do fechamento.</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function QuickInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InsightCard({ icon, label, title, description }: { icon: ReactNode; label: string; title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function InfoBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
