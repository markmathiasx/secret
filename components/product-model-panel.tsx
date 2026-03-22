import type { Product } from "@/lib/catalog";
import { Product3MFViewer } from "@/components/product-3mf-viewer";
import { getProductModel3mf, getProductModelPreview } from "@/lib/product-models";

export function ProductModelPanel({ product }: { product: Product }) {
  const modelUrl = getProductModel3mf(product);
  const modelPreview = getProductModelPreview(product);

  if (!modelUrl) return null;

  return (
    <div className="space-y-3" data-model-panel={product.id}>
      <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/68">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Arquivo técnico disponível</p>
        <p className="mt-2">
          Este item já tem projeto 3MF anexado no site. O cliente consegue ver a peça posicionada na bandeja real do
          fatiamento, trocar entre placas quando existir mais de uma e baixar o arquivo técnico quando o fluxo comercial
          pedir essa validação.
        </p>
      </div>
      <Product3MFViewer modelUrl={modelUrl} productName={product.name} preview={modelPreview} />
    </div>
  );
}
