/**
 * Product Customizer Component (2026)
 */

'use client';

import { useEffect, useState } from 'react';
import { Palette, Box, Zap } from 'lucide-react';

interface CustomizationOption {
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  finishes?: string[];
  engraving?: boolean;
  painting?: boolean;
}

export function ProductCustomizer({
  productId,
  userId,
  onCustomizationChange
}: {
  productId: string;
  userId?: string;
  onCustomizationChange?: (customization: any) => void;
}) {
  const [customization, setCustomization] = useState<any>({});
  const [options, setOptions] = useState<CustomizationOption | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomizationOptions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/personalization?user_id=${userId}&product_id=${productId}&action=customization`
        );
        const data = await res.json();
        setOptions(data.available_customizations);
        setRecommendations(data.recommended_options);
        setCustomization(data.recommended_options);
      } catch (error) {
        console.error('Failed to fetch customization options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomizationOptions();
  }, [productId, userId]);

  const handleCustomizationChange = (key: string, value: any) => {
    const updated = { ...customization, [key]: value };
    setCustomization(updated);
    onCustomizationChange?.(updated);
  };

  if (loading) {
    return <div className="p-6 bg-gray-50 rounded-lg">Loading customization options...</div>;
  }

  if (!options) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <Palette size={24} />
        Customize Your Product
      </h3>

      {/* Color Selection */}
      {options.colors && options.colors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">Color</label>
          <div className="grid grid-cols-4 gap-3">
            {options.colors.map(color => (
              <button
                key={color}
                onClick={() => handleCustomizationChange('color', color)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  customization.color === color
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg mb-2 mx-auto border border-gray-300"
                  style={{
                    backgroundColor: color.toLowerCase() === 'custom' ? '#f0f0f0' : color
                  }}
                />
                <p className="text-xs font-medium text-center">{color}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material Selection */}
      {options.materials && options.materials.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">Material</label>
          <select
            value={customization.material || ''}
            onChange={e => handleCustomizationChange('material', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select material...</option>
            {options.materials.map(material => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Size Selection */}
      {options.sizes && options.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">Size</label>
          <div className="grid grid-cols-3 gap-3">
            {options.sizes.map(size => (
              <button
                key={size}
                onClick={() => handleCustomizationChange('size', size)}
                className={`p-3 rounded-lg border-2 transition-all font-medium ${
                  customization.size === size
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finish Selection */}
      {options.finishes && options.finishes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">Finish</label>
          <select
            value={customization.finish || ''}
            onChange={e => handleCustomizationChange('finish', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select finish...</option>
            {options.finishes.map(finish => (
              <option key={finish} value={finish}>
                {finish}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Special Options */}
      <div className="space-y-3">
        {options.engraving && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={customization.engraving || false}
              onChange={e => handleCustomizationChange('engraving', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-medium">Add Engraving (+15%)</span>
          </label>
        )}
        {options.painting && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={customization.painting || false}
              onChange={e => handleCustomizationChange('painting', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-medium">Professional Painting (+25%)</span>
          </label>
        )}
      </div>

      {/* Delivery Time */}
      {recommendations?.delivery_time && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
          <Zap className="text-blue-600" />
          <div>
            <p className="font-semibold text-gray-900">Estimated Delivery</p>
            <p className="text-sm text-gray-600">{recommendations.delivery_time}</p>
          </div>
        </div>
      )}

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCustomizer;
