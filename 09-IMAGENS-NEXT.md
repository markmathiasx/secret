# Imagens com next/image

## O que migrar primeiro
- Home hero
- Cards do catálogo
- Galeria do produto

## Regras
- Sempre definir largura e altura quando possível
- Escrever alt útil
- Priorizar imagem above the fold apenas quando necessário
- Manter consistência de fundo e corte

## Exemplo
```tsx
import Image from 'next/image'

<Image
  src="/produtos/luminaria-led.jpg"
  alt="Luminária LED personalizada sobre uma mesa"
  width={800}
  height={800}
/>
```
