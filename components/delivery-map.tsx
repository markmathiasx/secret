import { MapPin } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const mapQuery = "Rio de Janeiro RJ";

export function DeliveryMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (!apiKey) {
    return (
      <div className="rounded-[32px] border border-amber-300/20 bg-amber-300/10 p-6 text-amber-50">
        <p className="text-xs uppercase tracking-[0.2em]">Mapa opcional</p>
        <h3 className="mt-2 text-xl font-bold">Mapa indisponível no momento</h3>
        <p className="mt-3 text-sm leading-7 text-amber-50/85">
          A visualização de mapa depende da chave do Google Maps. O cálculo de frete e o catálogo continuam funcionando normalmente.
        </p>
        <a href={whatsappHref} className="mt-4 inline-flex rounded-full border border-emerald-300/40 bg-emerald-300/20 px-4 py-2 text-sm font-semibold text-emerald-50">
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm text-white/70">
        <MapPin className="h-4 w-4 text-cyan-200" />
        Referência de cobertura local (RJ)
      </div>
      <iframe
        title="Mapa de cobertura de entrega no Rio de Janeiro"
        src={src}
        loading="lazy"
        className="h-[320px] w-full"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
