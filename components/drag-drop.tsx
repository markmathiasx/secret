"use client";

import { useState, useRef, useCallback, ReactNode, DragEvent } from 'react';
import { Upload, X, File, Image as ImageIcon, Video, FileText } from 'lucide-react';
import Image from 'next/image';

interface FileWithPreview extends File {
  preview?: string;
}

interface DragDropProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  showPreview?: boolean;
  previewType?: 'grid' | 'list';
}

export function DragDrop({
  onFilesSelected,
  accept = '*',
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  disabled = false,
  children,
  showPreview = true,
  previewType = 'grid',
}: DragDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check file type
      if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
        newErrors.push(`${file.name}: Tipo de arquivo não permitido`);
        continue;
      }

      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`${file.name}: Arquivo muito grande (máx. ${formatBytes(maxSize)})`);
        continue;
      }

      validFiles.push(file);
    }

    // Check max files limit
    if (files.length + validFiles.length > maxFiles) {
      newErrors.push(`Máximo de ${maxFiles} arquivos permitido`);
      return [];
    }

    setErrors(newErrors);
    return validFiles;
  }, [accept, maxSize, maxFiles, files.length]);

  const processFiles = useCallback((fileList: FileList) => {
    const validFiles = validateFiles(fileList);
    if (validFiles.length > 0) {
      const filesWithPreview = validFiles.map(file => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        return fileWithPreview;
      });

      setFiles(prev => [...prev, ...filesWithPreview]);
      onFilesSelected(validFiles);
    }
  }, [validateFiles, onFilesSelected]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const { files: droppedFiles } = e.dataTransfer;
    if (droppedFiles) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles } = e.target;
    if (selectedFiles) {
      processFiles(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const removedFile = newFiles.splice(index, 1)[0];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setErrors([]);
  }, [files]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (file.type.includes('pdf') || file.type.includes('text')) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver
            ? 'border-cyan-glow bg-cyan-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {children || (
          <div className="space-y-4">
            <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-cyan-glow' : 'text-gray-400'}`} />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragOver ? 'Solte os arquivos aqui' : 'Arraste e solte arquivos aqui'}
              </p>
              <p className="text-sm text-gray-500">
                ou <span className="text-cyan-glow hover:text-cyan-400">clique para selecionar</span>
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {accept !== '*' && `Tipos aceitos: ${accept}`}
              {maxSize && ` • Máx. ${formatBytes(maxSize)} por arquivo`}
              {maxFiles > 1 && ` • Até ${maxFiles} arquivos`}
            </div>
          </div>
        )}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
              <X className="h-4 w-4" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File preview */}
      {showPreview && files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Arquivos selecionados ({files.length})</h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Limpar todos
            </button>
          </div>

          <div className={`
            ${previewType === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2'
            }
          `}>
            {files.map((file, index) => (
              <div
                key={index}
                className={`
                  relative border border-gray-200 rounded-lg p-3
                  ${previewType === 'grid' ? 'flex flex-col items-center space-y-2' : 'flex items-center space-x-3'}
                `}
              >
                {/* Preview */}
                {file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.name}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-400">
                    {getFileIcon(file)}
                  </div>
                )}

                {/* File info */}
                <div className={`${previewType === 'grid' ? 'text-center' : 'flex-1 min-w-0'}`}>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label={`Remover ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized drag drop for images
interface ImageDragDropProps extends Omit<DragDropProps, 'accept' | 'onFilesSelected'> {
  onImagesSelected: (images: File[]) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function ImageDragDrop({
  onImagesSelected,
  maxWidth,
  maxHeight,
  quality = 0.8,
  ...props
}: ImageDragDropProps) {
  const processImages = useCallback(async (files: File[]) => {
    const processedImages: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      let processedFile = file;

      // Resize if needed
      if (maxWidth || maxHeight) {
        try {
          processedFile = await resizeImage(file, maxWidth, maxHeight, quality);
        } catch (error) {
          console.error('Error resizing image:', error);
        }
      }

      processedImages.push(processedFile);
    }

    onImagesSelected(processedImages);
  }, [onImagesSelected, maxWidth, maxHeight, quality]);

  return (
    <DragDrop
      {...props}
      accept="image/*"
      onFilesSelected={processImages}
    />
  );
}

// Utility function to resize images
async function resizeImage(
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = document.createElement('img');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = Object.assign(blob, {
              name: file.name,
              lastModified: Date.now(),
            }) as File;
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}