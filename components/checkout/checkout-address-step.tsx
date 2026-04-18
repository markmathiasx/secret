"use client";

import { PURPOSE_OPTIONS, type AddressBookItem, type CheckoutAddress, type PurchasePurpose } from "@/lib/checkout-client";
import { formatCep } from "@/lib/shipping";

export function CheckoutAddressStep({
  sortedCatalog,
  productId,
  quantity,
  purchasePurpose,
  customerName,
  email,
  phone,
  addressMode,
  savedAddresses,
  selectedAddressId,
  saveAddress,
  address,
  sessionLoggedIn,
  quantityPresets,
  onProductIdChange,
  onQuantityChange,
  onPurchasePurposeChange,
  onCustomerNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressModeChange,
  onSelectedAddressIdChange,
  onSaveAddressChange,
  onAddressChange,
  onContinue,
  onClearDraft,
}: {
  sortedCatalog: Array<{ id: string; name: string }>;
  productId: string;
  quantity: number;
  purchasePurpose: PurchasePurpose;
  customerName: string;
  email: string;
  phone: string;
  addressMode: "saved" | "new";
  savedAddresses: AddressBookItem[];
  selectedAddressId: string;
  saveAddress: boolean;
  address: CheckoutAddress;
  sessionLoggedIn: boolean;
  quantityPresets: number[];
  onProductIdChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onPurchasePurposeChange: (value: PurchasePurpose) => void;
  onCustomerNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressModeChange: (value: "saved" | "new") => void;
  onSelectedAddressIdChange: (value: string) => void;
  onSaveAddressChange: (value: boolean) => void;
  onAddressChange: <K extends keyof CheckoutAddress>(field: K, value: CheckoutAddress[K]) => void;
  onContinue: () => void;
  onClearDraft: () => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      {!sessionLoggedIn && (
        <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-100">✓ Compre sem criar conta</p>
          <p className="mt-1 text-sm text-emerald-100/75">
            Preencha seus dados abaixo e finalize normalmente — não é preciso se cadastrar.
            Se preferir, <a href="/login" className="underline hover:text-white transition">entre na sua conta</a> para agilizar próximas compras.
          </p>
        </div>
      )}
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Produto e contexto</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-white/70">Produto</span>
            <select value={productId} onChange={(event) => onProductIdChange(event.target.value)} className="field-base">
              {sortedCatalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">Quantidade</span>
            <input
              type="number"
              min={1}
              max={20}
              value={quantity}
              onChange={(event) => onQuantityChange(Number(event.target.value || 1))}
              className="field-base"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quantityPresets.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onQuantityChange(value)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                quantity === value
                  ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                  : "border-white/10 bg-white/5 text-white/75"
              }`}
            >
              {value} unidade{value > 1 ? "s" : ""}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <span className="mb-2 block text-sm text-white/70">Objetivo da compra</span>
          <div className="flex flex-wrap gap-2">
            {PURPOSE_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPurchasePurposeChange(item)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  purchasePurpose === item
                    ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                    : "border-white/10 bg-white/5 text-white/75"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Contato</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm text-white/70">Nome completo</span>
            <input value={customerName} onChange={(event) => onCustomerNameChange(event.target.value)} className="field-base" autoComplete="name" />
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">Email</span>
            <input type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} className="field-base" autoComplete="email" />
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">WhatsApp</span>
            <input value={phone} onChange={(event) => onPhoneChange(event.target.value)} className="field-base" autoComplete="tel" />
          </label>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Endereço</p>
            <p className="mt-1 text-sm text-white/68">Você pode usar um endereço salvo ou preencher um novo agora.</p>
          </div>
          {savedAddresses.length ? (
            <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => onAddressModeChange("saved")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${addressMode === "saved" ? "bg-white text-slate-950" : "text-white/70"}`}
              >
                Endereço salvo
              </button>
              <button
                type="button"
                onClick={() => onAddressModeChange("new")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${addressMode === "new" ? "bg-white text-slate-950" : "text-white/70"}`}
              >
                Novo endereço
              </button>
            </div>
          ) : null}
        </div>

        {addressMode === "saved" && savedAddresses.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {savedAddresses.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectedAddressIdChange(item.id)}
                className={`rounded-[22px] border p-4 text-left transition ${
                  selectedAddressId === item.id ? "border-cyan-300/35 bg-cyan-300/12" : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <p className="font-semibold text-white">{item.label}</p>
                <p className="mt-2 text-sm text-white/68">{item.recipientName}</p>
                <p className="mt-1 text-sm text-white/55">{item.line1}</p>
                <p className="text-sm text-white/55">
                  {item.neighborhood} • {item.city} - {item.state}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-100/70">CEP {formatCep(item.zipCode)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-white/70">Apelido do endereço</span>
              <input value={address.label} onChange={(event) => onAddressChange("label", event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Destinatário</span>
              <input value={address.recipientName} onChange={(event) => onAddressChange("recipientName", event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">CEP</span>
              <input value={formatCep(address.zipCode)} onChange={(event) => onAddressChange("zipCode", event.target.value)} className="field-base" inputMode="numeric" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Telefone do endereço</span>
              <input value={address.phone} onChange={(event) => onAddressChange("phone", event.target.value)} className="field-base" inputMode="tel" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm text-white/70">Rua e número</span>
              <input value={address.line1} onChange={(event) => onAddressChange("line1", event.target.value)} className="field-base" />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm text-white/70">Complemento</span>
              <input value={address.line2} onChange={(event) => onAddressChange("line2", event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Bairro</span>
              <input value={address.neighborhood} onChange={(event) => onAddressChange("neighborhood", event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Cidade</span>
              <input value={address.city} onChange={(event) => onAddressChange("city", event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Estado</span>
              <input value={address.state} onChange={(event) => onAddressChange("state", event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">País</span>
              <input value={address.country} onChange={(event) => onAddressChange("country", event.target.value)} className="field-base" />
            </label>
          </div>
        )}

        {sessionLoggedIn ? (
          <label className="mt-4 flex items-center gap-3 text-sm text-white/72">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(event) => onSaveAddressChange(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/20"
            />
            Salvar esse endereço na minha conta para os próximos pedidos
          </label>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onContinue} className="btn-primary">
          Continuar para envio
        </button>
        <button type="button" onClick={onClearDraft} className="btn-secondary">
          Limpar rascunho
        </button>
      </div>
    </div>
  );
}
