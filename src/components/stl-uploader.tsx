'use client';

import { useState } from 'react';
import Link from 'next/link';

export function STLUploader() {
  const [fileName, setFileName] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [quality, setQuality] = useState<string>('média');
  const [material, setMaterial] = useState<string>('PLA');
  const [color, setColor] = useState<string>('Branco');
  const [showForm, setShowForm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setShowForm(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fileDesc = fileName ? `Arquivo: ${fileName}` : '';
    const message = `Oi MDH 3D! Quero enviar um arquivo para impressão 3D.\n\nProjeto: ${projectName}\nQuantidade: ${quantity}\nQualidade: ${quality}\nMaterial: ${material}\nCor: ${color}\n${fileDesc}\n\nPodes analisar a viabilidade e me enviar um orçamento?`;
    
    window.open(
      `https://wa.me/5521920137249?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="glass-panel p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white mb-4">📤 Envie seu Arquivo STL</h2>
          <p className="text-white/70 text-lg">
            Deixe-nos analisar sua peça e fornecer um orçamento personalizado
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <label className="block">
            <div className="border-2 border-dashed border-cyan-glow/40 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-glow/70 hover:bg-cyan-glow/5 transition-all">
              <input
                type="file"
                accept=".stl,.obj,.3mf,.gcode"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {fileName ? `✓ ${fileName}` : 'Clique ou arraste seu arquivo'}
              </h3>
              <p className="text-white/60">
                Formatos aceitos: .STL, .OBJ, .3MF, .GCODE
              </p>
            </div>
          </label>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeInUp">
            {/* Project Name */}
            <div>
              <label className="block text-white/80 font-semibold mb-2">Nome do Projeto *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Suporte para Headset"
                className="field-base"
                required
              />
            </div>

            {/* Grid Layout for Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-white/80 font-semibold mb-2">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="field-base"
                />
              </div>

              {/* Quality */}
              <div>
                <label className="block text-white/80 font-semibold mb-2">Qualidade</label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)} className="field-base">
                  <option value="baixa">Baixa (Mais rápido e barato)</option>
                  <option value="média">Média (Recomendado)</option>
                  <option value="alta">Alta (Melhor detalhamento)</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-white/80 font-semibold mb-2">Material</label>
                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="field-base">
                  <option value="PLA">PLA (Padrão e Econômico)</option>
                  <option value="PETG">PETG (Resistente)</option>
                  <option value="Resina">Resina (Ultra detalhe)</option>
                  <option value="ABS">ABS (Industrial)</option>
                  <option value="Nylon">Nylon (Flexível)</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-white/80 font-semibold mb-2">Cor</label>
                <select value={color} onChange={(e) => setColor(e.target.value)} className="field-base">
                  <option value="Branco">Branco</option>
                  <option value="Preto">Preto</option>
                  <option value="Cinza">Cinza</option>
                  <option value="Azul">Azul</option>
                  <option value="Vermelho">Vermelho</option>
                  <option value="Verde">Verde</option>
                  <option value="Amarelo">Amarelo</option>
                  <option value="Rosa">Rosa</option>
                  <option value="Personalizada">Personalizada (Consultar)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 btn-whatsapp font-bold py-4 uppercase tracking-wider"
              >
                ✓ Enviar via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFileName('');
                  setProjectName('');
                }}
                className="btn-secondary font-bold py-4 px-6 uppercase tracking-wider"
              >
                Cancelar
              </button>
            </div>

            {/* Info */}
            <div className="bg-cyan-glow/10 border border-cyan-glow/30 rounded-lg p-4 text-sm text-white/80">
              💡 <strong>Dica:</strong> Você pode enviar o arquivo em anexo pelo WhatsApp depois. Aqui você só nos passa os detalhes do seu projeto para análise.
            </div>
          </form>
        )}

        {/* Not Submitted Yet */}
        {!showForm && !fileName && (
          <div className="text-center">
            <p className="text-white/60 mb-6">
              ⬆️ Comece enviando seu arquivo STL, OBJ ou 3MF
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            Icon: '⚡',
            title: 'Análise Rápida',
            desc: 'Respondemos em até 2 horas',
          },
          {
            Icon: '💰',
            title: 'Orçamento Justo',
            desc: 'Preço transparente e sem surpresas',
          },
          {
            Icon: '🚚',
            title: 'Entrega Garantida',
            desc: 'Prazos respeitados com qualidade',
          },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">{item.Icon}</div>
            <h3 className="text-white font-bold mb-2">{item.title}</h3>
            <p className="text-white/60 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
