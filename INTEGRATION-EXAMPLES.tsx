/**
 * Example: Complete Checkout Page Implementation
 * app/checkout/page.tsx
 */

'use client';

import React, { useState } from 'react';
import { PasswordRecoveryForm, CheckoutPIXForm, ProductValidationStatus } from '@/components/security-forms';

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<'cart' | 'address' | 'payment' | 'confirmation'>('cart');
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  // Example cart data
  const [cart] = useState([
    { id: '1', title: 'Product 1', price: 99.90, quantity: 1 },
    { id: '2', title: 'Product 2', price: 149.90, quantity: 1 }
  ]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : subtotal >= 200 ? 15 : subtotal >= 100 ? 25 : 35;
  const tax = (subtotal + shipping) * 0.07;
  const total = subtotal + shipping + tax;

  const checkoutSession = {
    id: `checkout_${Date.now()}`,
    items: cart,
    subtotal,
    shipping,
    tax,
    total,
    status: 'ACTIVE'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout Seguro</h1>
          <p className="text-gray-600">PIX e Cartão de Crédito | Encriptado e Seguro</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between mb-8">
            {['Carrinho', 'Endereço', 'Pagamento', 'Confirmação'].map((step, idx) => (
              <div
                key={idx}
                className={`text-center flex-1 ${
                  idx <= ['cart', 'address', 'payment', 'confirmation'].indexOf(currentStep)
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    idx <= ['cart', 'address', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                <p className="text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {currentStep === 'cart' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Seu Carrinho</h2>

                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center pb-4 border-b">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-gray-600">Qtd: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-lg">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentStep('address')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Continuar para Entrega
                  </button>
                </div>
              )}

              {currentStep === 'address' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Endereço de Entrega</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Rua"
                        className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Número"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Complemento"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Bairro"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Cidade"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Estado (ex: RJ)"
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="CEP"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep('cart')}
                      className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Ir para Pagamento
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Escolha o Método de Pagamento</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 border-2 border-blue-600 rounded-lg text-center hover:bg-blue-50">
                      <div className="text-2xl mb-2">💳</div>
                      <p className="font-semibold">PIX</p>
                      <p className="text-sm text-gray-600">Instantâneo • Zero taxas</p>
                    </button>

                    <button className="p-6 border-2 border-gray-300 rounded-lg text-center hover:bg-gray-50">
                      <div className="text-2xl mb-2">🏦</div>
                      <p className="font-semibold">Cartão</p>
                      <p className="text-sm text-gray-600">Crédito ou Débito</p>
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">🔒 Segurança</h3>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>✓ PCI-DSS Level 1 Compliance</li>
                      <li>✓ Tokens de cartão (nunca armazenamos números)</li>
                      <li>✓ Encriptação SSL/TLS</li>
                      <li>✓ Proteção contra fraude</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep('address')}
                      className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => setCurrentStep('confirmation')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 'confirmation' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-green-600">Pedido Confirmado!</h2>
                    <p className="text-gray-600 mt-2">Obrigado por sua compra</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Número do Pedido:</span>
                      <span className="font-semibold">#MDH-202601151234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-blue-600">Aguardando Pagamento</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Método:</span>
                      <span className="font-semibold">PIX</span>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Voltar para Home
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Password Recovery */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="font-bold text-lg mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span>R$ {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impostos</span>
                  <span>R$ {tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg py-4">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded text-sm text-green-900">
                ✓ 30 dias para devolver
                <br/>
                ✓ Frete grátis acima de R$ 500
              </div>
            </div>

            {/* Password Recovery Section */}
            {showPasswordRecovery && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => setShowPasswordRecovery(false)}
                  className="w-full text-left text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                  ← Voltar
                </button>
                <PasswordRecoveryForm />
              </div>
            )}

            {!showPasswordRecovery && (
              <button
                onClick={() => setShowPasswordRecovery(true)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-3 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Esqueceu a Senha?
              </button>
            )}

            {/* Trust Badges */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-bold mb-3 text-sm">Segurança Garantida</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🔒 HTTPS Encriptado</p>
                <p>🏛️ PCI-DSS Level 1</p>
                <p>✓ Certificado SSL</p>
                <p>🛡️ Proteção contra fraude</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example: Product Page with Validation Status
// ============================================================================

export function ProductPageExample() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Nome do Produto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Product Image, Description, etc */}
        </div>

        <div>
          {/* Show validation status */}
          <ProductValidationStatus productId="product-123" />

          {/* Add to cart, etc */}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example: Admin Page - Catalog Validation
// ============================================================================

export function AdminCatalogValidationPage() {
  const [validating, setValidating] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const handleValidateAll = async () => {
    setValidating(true);
    try {
      const response = await fetch('/api/catalog/validate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: ['product-1', 'product-2', 'product-3'] // Get from DB
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Validação de Catálogo</h1>

      <button
        onClick={handleValidateAll}
        disabled={validating}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 mb-8"
      >
        {validating ? 'Validando...' : 'Validar Todo Catálogo'}
      </button>

      {result && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-900 font-bold">{result.validCount}</p>
            <p className="text-sm text-green-700">Válidos</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-900 font-bold">{result.invalidCount}</p>
            <p className="text-sm text-red-700">Inválidos</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-900 font-bold">{result.warningCount}</p>
            <p className="text-sm text-yellow-700">Avisos</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900 font-bold">{result.totalProducts}</p>
            <p className="text-sm text-blue-700">Total</p>
          </div>
        </div>
      )}

      {result?.reports && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Produto</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {result.reports.map((report: any) => (
              <tr key={report.productId} className="hover:bg-gray-50">
                <td className="border p-3">{report.productId}</td>
                <td className="border p-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    report.status === 'VALID' ? 'bg-green-100 text-green-900' :
                    report.status === 'INVALID' ? 'bg-red-100 text-red-900' :
                    'bg-yellow-100 text-yellow-900'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="border p-3">
                  <details>
                    <summary className="cursor-pointer text-blue-600">Ver detalhes</summary>
                    <div className="mt-2 pl-4">
                      {report.checks.map((check: any, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {check.status === 'PASS' ? '✓' : '✗'} {check.name}
                        </p>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
