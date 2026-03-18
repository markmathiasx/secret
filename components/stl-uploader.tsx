'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Zap, Send } from 'lucide-react';

interface FormData {
  projectName: string;
  quantity: number;
  quality: string;
  material: string;
  color: string;
  notes: string;
}

export function STLUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    quantity: 1,
    quality: 'média',
    material: 'PLA',
    color: 'Branco',
    notes: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = useMemo(() => ['.stl', '.obj', '.3mf', '.step', '.iges'], []);
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxFileSize) {
      return `Arquivo muito grande. Máximo: ${maxFileSize / (1024 * 1024)}MB`;
    }
    return null;
  }, [acceptedTypes, maxFileSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const error = validateFile(droppedFile);
      if (error) {
        alert(error);
        return;
      }
      setFile(droppedFile);
      setShowForm(true);
    }
  }, [validateFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        alert(error);
        return;
      }
      setFile(selectedFile);
      setShowForm(true);
    }
  };

  const removeFile = () => {
    setFile(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Prepare WhatsApp message
    const message = `🚀 *ORÇAMENTO MDH 3D*\n\n📁 *Arquivo:* ${file.name}\n📏 *Tamanho:* ${(file.size / (1024 * 1024)).toFixed(2)} MB\n\n📋 *Detalhes do Projeto:*\n🏷️ *Nome:* ${formData.projectName}\n🔢 *Quantidade:* ${formData.quantity}\n🎯 *Qualidade:* ${formData.quality}\n🧱 *Material:* ${formData.material}\n🎨 *Cor:* ${formData.color}\n${formData.notes ? `📝 *Observações:* ${formData.notes}\n` : ''}\n💰 *Solicito análise de viabilidade e orçamento personalizado.*\n\n⚡ *Peço retorno assim que possível em horário comercial.*`;

    // Complete upload
    setTimeout(() => {
      setUploadProgress(100);
      setTimeout(() => {
        window.open(
          `https://wa.me/5521920137249?text=${encodeURIComponent(message)}`,
          '_blank'
        );
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }, 2000);
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-chip mb-4">
            <Zap className="w-4 h-4 text-cyan-glow" />
            <span>Upload Seguro</span>
          </div>
          <h2 className="section-title mb-4">
            📤 Envie seu Arquivo
            <span className="block bg-gradient-to-r from-cyan-glow to-violet-400 bg-clip-text text-transparent">
              3D
            </span>
          </h2>
          <p className="section-copy max-w-2xl mx-auto">
            Faça upload do seu arquivo STL, OBJ ou 3MF e envie o briefing técnico do projeto para orçamento personalizado.
          </p>
        </div>

        {/* Upload Area */}
        {!showForm && (
          <div className="mb-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragOver
                  ? 'border-cyan-glow bg-cyan-glow/10 scale-105'
                  : 'border-cyan-glow/40 hover:border-cyan-glow/70 hover:bg-cyan-glow/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-glow/20 to-cyan-glow/10 ${isDragOver ? 'animate-cyber-pulse' : ''}`}>
                  <Upload className="w-8 h-8 text-cyan-glow" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isDragOver ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo'}
                  </h3>
                  <p className="text-white/60 mb-4">
                    ou clique para selecionar
                  </p>
                  <p className="text-sm text-white/50">
                    Suportamos: STL, OBJ, 3MF, STEP, IGES • Máx. 50MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Preview */}
        {file && (
          <div className="mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-glow/20 rounded-xl flex items-center justify-center">
                    <File className="w-6 h-6 text-cyan-glow" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{file.name}</h4>
                    <p className="text-sm text-white/60">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Arquivo 3D'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  className="field-base"
                  placeholder="Ex: Suporte para câmera"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="field-base"
                />
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Qualidade de Impressão
                </label>
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value }))}
                  className="field-base"
                >
                  <option value="baixa">Baixa (0.3mm - Rápido)</option>
                  <option value="média">Média (0.2mm - Equilibrado)</option>
                  <option value="alta">Alta (0.1mm - Detalhado)</option>
                  <option value="ultra">Ultra (0.05mm - Premium)</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Material
                </label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  className="field-base"
                >
                  <option value="PLA">PLA Premium</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="TPU">TPU (Flexível)</option>
                  <option value="Nylon">Nylon</option>
                  <option value="Resina">Resina Fotopolímero</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Cor
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="field-base"
                >
                  <option value="Branco">Branco</option>
                  <option value="Preto">Preto</option>
                  <option value="Cinza">Cinza</option>
                  <option value="Azul">Azul</option>
                  <option value="Vermelho">Vermelho</option>
                  <option value="Verde">Verde</option>
                  <option value="Amarelo">Amarelo</option>
                  <option value="Transparente">Transparente</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="field-base resize-none"
                  rows={3}
                  placeholder="Descreva detalhes específicos, requisitos especiais ou dúvidas..."
                />
              </div>
            </div>

            {/* Progress Bar (when uploading) */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Enviando arquivo...</span>
                  <span className="text-cyan-glow">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-cyan-glow to-violet-400 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
                disabled={isUploading}
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="btn-whatsapp flex-1 group"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Enviar para WhatsApp
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Info Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Análise Gratuita</h4>
              <p className="text-sm text-white/60">Verificamos viabilidade técnica</p>
            </div>
            <div className="flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-cyan-glow mb-2" />
              <h4 className="font-semibold text-white mb-1">Resposta Rápida</h4>
              <p className="text-sm text-white/60">Retorno em horário comercial</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Produção Local</h4>
              <p className="text-sm text-white/60">Impresso no Rio de Janeiro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
