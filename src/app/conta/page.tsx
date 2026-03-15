import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomerAccountPage } from "@/components/customer-account-page";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { listAddressesForCustomerAccount, listOrdersForCustomerAccount } from "@/lib/order-service";

<<<<<<< ours
export const metadata: Metadata = {
  title: "Conta",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccountPage() {
  const session = await getCurrentCustomerSession();
=======
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { featuredCatalog, getProductUrl } from "@/lib/catalog";

type Item = { id: string; product_id?: string; status?: string; created_at?: string };

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) {
        setReady(true);
        return;
      }
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) {
        setReady(true);
        return;
      }

      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || null;
      setName(displayName);
      setEmail(user.email || null);
      await supabaseBrowser.from("profiles").upsert({ id: user.id, email: user.email, full_name: displayName }, { onConflict: "id" });

      const [{ data: favoriteRows }, { data: quoteRows }] = await Promise.all([
        supabaseBrowser.from("favorites").select("id, product_id, created_at").order("created_at", { ascending: false }).limit(12),
        supabaseBrowser.from("quote_requests").select("id, status, created_at").order("created_at", { ascending: false }).limit(8)
      ]);

      setFavorites((favoriteRows as Item[]) || []);
      setQuotes((quoteRows as Item[]) || []);
      setReady(true);
    }
    load();
  }, []);
>>>>>>> theirs

  if (!session) {
    redirect("/login?next=%2Fconta");
  }

<<<<<<< ours
  let orders: Awaited<ReturnType<typeof listOrdersForCustomerAccount>> = [];
  let addresses: Awaited<ReturnType<typeof listAddressesForCustomerAccount>> = [];

  try {
    [orders, addresses] = await Promise.all([
      listOrdersForCustomerAccount({
        customerId: session.account.customerId,
        email: session.account.email,
        limit: 12
      }),
      listAddressesForCustomerAccount({
        customerId: session.account.customerId,
        email: session.account.email,
        limit: 6
      })
    ]);
  } catch {
    orders = [];
    addresses = [];
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  return (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    <CustomerAccountPage
      customerName={session.account.fullName}
      email={session.account.email}
      customerProfile={
        session.customer
          ? {
              fullName: session.customer.fullName,
              whatsapp: session.customer.whatsapp,
              contactPreference: session.customer.contactPreference,
              notes: session.customer.notes || null
            }
          : null
      }
      addresses={addresses}
      orders={orders}
    />
=======
  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  return (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-black text-white">Olá, {name || "cliente"}</h1>
      <p className="mt-2 text-white/65">{email}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div id="favoritos" className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Favoritos salvos</h2>
          <p className="mt-1 text-sm text-white/60">{favorites.length} item(ns) salvo(s)</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {favorites.length ? favorites.map((item) => <li key={item.id}>• {item.product_id}</li>) : <li>Nenhum favorito salvo ainda. Explore o catálogo e marque suas peças preferidas.</li>}
          </ul>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Orçamentos e pedidos</h2>
          <p className="mt-1 text-sm text-white/60">{quotes.length} solicitação(ões) recente(s)</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {quotes.length ? quotes.map((item) => <li key={item.id}>• {item.status || "recebido"}</li>) : <li>Você ainda não enviou orçamento. Clique em “Pedir orçamento” em qualquer produto.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">Recomendações para você</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredCatalog.slice(0, 3).map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35">
              <p className="text-cyan-100">{item.category}</p>
              <p className="mt-1 font-semibold text-white">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">Perfil e retenção</h3>
        <p className="mt-2 text-sm text-white/65">Endereços salvos e histórico completo serão exibidos automaticamente conforme novos pedidos forem registrados.</p>
        <button onClick={signOut} className="mt-5 rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm font-semibold text-white">Sair</button>
      </div>
    </section>
>>>>>>> theirs
  );
}
