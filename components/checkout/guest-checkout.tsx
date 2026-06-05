"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CreditCard, MapPin, Phone, User, Mail, ShoppingBag, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button-simple";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { whatsappNumber } from "@/lib/constants";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";
import { sanitizePlainText, sanitizeEmail } from "@/lib/sanitize";

type CheckoutStep = "cart" | "shipping" | "payment" | "confirmation";

type ShippingData = {
  postalCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
};

type PaymentMethod = "pix" | "card";

export function GuestCheckout() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [isLoading, setIsLoading] = useState(false);
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
  });
  
  const [shippingData, setShippingData] = useState<ShippingData>({
    postalCode: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const subtotalPix = getTotalPrice();
  const subtotalCard = items.reduce((sum, item) => sum + calculateCardPrice(item.price) * item.quantity, 0);
  const shippingPrice = selectedShipping?.price || 0;
  const totalPix = subtotalPix + shippingPrice;
  const totalCard = subtotalCard + shippingPrice;

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && currentStep !== "confirmation") {
      router.push("/catalogo");
    }
  }, [items, currentStep, router]);

  const calculateShipping = async (postalCode: string) => {
    if (!postalCode || postalCode.length !== 8) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shipping/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            weight: item.weight || 100, // grams
            dimensions: item.dimensions || { width: 10, height: 10, depth: 10 },
          })),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setShippingOptions(data.options || []);
        if (data.options?.[0]) {
          setSelectedShipping(data.options[0]);
        }
        
        // Auto-fill address from shipping API
        if (data.address) {
          setShippingData(prev => ({
            ...prev,
            address: data.address.street,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
          }));
        }
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCustomerData = (): boolean => {
    const sanitizedData = {
      name: sanitizePlainText(customerData.name, 100),
      email: sanitizeEmail(customerData.email),
      phone: sanitizePlainText(customerData.phone, 20),
    };
    
    setCustomerData(sanitizedData);
    
    return Boolean(
      sanitizedData.name.trim().length >= 3 &&
      sanitizedData.email.includes("@") &&
      sanitizedData.phone.replace(/\D/g, "").length >= 10
    );
  };

  const validateShippingData = (): boolean => {
    return Boolean(
      shippingData.postalCode.length === 8 &&
      shippingData.address.trim().length >= 5 &&
      shippingData.number.trim() &&
      shippingData.neighborhood.trim() &&
      shippingData.city.trim() &&
      shippingData.state.trim().length === 2
    );
  };

  const handleNextStep = async () => {
    if (currentStep === "cart") {
      if (!validateCustomerData()) {
        alert("Por favor, preencha seus dados corretamente.");
        return;
      }
      setCurrentStep("shipping");
    } else if (currentStep === "shipping") {
      if (!validateShippingData()) {
        alert("Por favor, preencha o endereço de entrega.");
        return;
      }
      if (!selectedShipping) {
        alert("Selecione uma opção de frete.");
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      await processPayment();
    }
  };

  const processPayment = async () => {
    setIsLoading(true);
    try {
      const orderPayload = {
        customer: customerData,
        shipping: shippingData,
        items: items.map(item => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          options: item.options || {},
        })),
        shippingOption: selectedShipping,
        paymentMethod,
        total: {
          subtotalPix,
          subtotalCard,
          shipping: selectedShipping.price,
          totalPix,
          totalCard,
        },
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderData(order);
        setCurrentStep("confirmation");
        clearCart();
        
        // Store order in localStorage for recovery
        localStorage.setItem("lastOrder", JSON.stringify(order));
      } else {
        throw new Error("Erro ao processar pedido");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Ocorreu um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "cart":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-cyan-100 mb-4" />
              <h2 className="text-2xl font-bold text-white">Seu Carrinho</h2>
              <p className="text-white/60 mt-2">Revise seus itens antes de finalizar</p>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="bg-white/[0.05] border-white/10">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-white/60">Qtd: {item.quantity}</p>
                        <p className="text-sm text-white/60">Cartão + R$ 1: {formatCurrency(calculateCardPrice(item.price) * item.quantity)}</p>
                        <p className="text-lg font-bold text-cyan-100 mt-1">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white/80">Nome completo</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="João Silva"
                  className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                  style={{ minHeight: '48px' }}
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white/80">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="joao@exemplo.com"
                  className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                  style={{ minHeight: '48px' }}
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-white/80">WhatsApp</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={`+${whatsappNumber}`}
                  className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-cyan-100 mb-4" />
              <h2 className="text-2xl font-bold text-white">Endereço de Entrega</h2>
              <p className="text-white/60 mt-2">Onde você quer receber seu pedido?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="postalCode" className="text-white/80">CEP</Label>
                <Input
                  id="postalCode"
                  value={shippingData.postalCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setShippingData(prev => ({ ...prev, postalCode: value }));
                    if (value.length === 8) {
                      calculateShipping(value);
                    }
                  }}
                  placeholder="00000-000"
                  className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address" className="text-white/80">Rua</Label>
                  <Input
                    id="address"
                    value={shippingData.address}
                    onChange={(e) => setShippingData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua das Flores"
                    className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <div>
                  <Label htmlFor="number" className="text-white/80">Número</Label>
                  <Input
                    id="number"
                    value={shippingData.number}
                    onChange={(e) => setShippingData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="123"
                    className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="complement" className="text-white/80">Complemento (opcional)</Label>
                <Input
                  id="complement"
                  value={shippingData.complement}
                  onChange={(e) => setShippingData(prev => ({ ...prev, complement: e.target.value }))}
                  placeholder="Apto 101"
                  className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                  style={{ minHeight: '48px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood" className="text-white/80">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={shippingData.neighborhood}
                    onChange={(e) => setShippingData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Centro"
                    className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-white/80">Cidade</Label>
                  <Input
                    id="city"
                    value={shippingData.city}
                    onChange={(e) => setShippingData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Rio de Janeiro"
                    className="bg-white/[0.1] border-white/20 text-white placeholder-white/40"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="state" className="text-white/80">Estado</Label>
                <select
                  value={shippingData.state}
                  onChange={(e) => setShippingData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full h-12 rounded-md border border-white/20 bg-white/[0.1] px-3 text-white"
                  style={{ minHeight: '48px' }}
                >
                  <option value="">Selecione</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="SP">São Paulo</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="BA">Bahia</option>
                  <option value="RS">Rio Grande do Sul</option>
                </select>
              </div>

              {shippingOptions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-white/80">Opções de Frete</Label>
                  {shippingOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-colors ${
                        selectedShipping?.id === option.id
                          ? "bg-cyan-300/20 border-cyan-300"
                          : "bg-white/[0.05] border-white/10"
                      }`}
                      onClick={() => setSelectedShipping(option)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-white">{option.name}</p>
                            <p className="text-sm text-white/60">{option.estimatedDays} dias úteis</p>
                          </div>
                          <p className="font-bold text-cyan-100">
                            {formatCurrency(option.price)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-cyan-100 mb-4" />
              <h2 className="text-2xl font-bold text-white">Forma de Pagamento</h2>
              <p className="text-white/60 mt-2">Escolha como prefere pagar</p>
            </div>

            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-colors ${
                  paymentMethod === "pix"
                    ? "bg-cyan-300/20 border-cyan-300"
                    : "bg-white/[0.05] border-white/10"
                }`}
                onClick={() => setPaymentMethod("pix")}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">PIX</p>
                      <p className="text-sm text-white/60">Pagamento instantâneo com valor principal do catálogo</p>
                    </div>
                    <p className="font-bold text-cyan-100">
                      {formatCurrency(totalPix)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-colors ${
                  paymentMethod === "card"
                    ? "bg-cyan-300/20 border-cyan-300"
                    : "bg-white/[0.05] border-white/10"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">Cartão de Crédito</p>
                      <p className="text-sm text-white/60">Cada produto fica R$ 1,00 acima do Pix</p>
                    </div>
                    <p className="font-bold text-cyan-100">
                      {formatCurrency(totalCard)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white/[0.05] border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">{formatCurrency(paymentMethod === "pix" ? subtotalPix : subtotalCard)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Frete</span>
                  <span className="text-white">{formatCurrency(selectedShipping?.price || 0)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Pix</span>
                  <span>{formatCurrency(totalPix)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Cartão</span>
                  <span>{formatCurrency(totalCard)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span className="text-cyan-100">
                    {formatCurrency(paymentMethod === "pix" ? totalPix : totalCard)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "confirmation":
        return (
          <div className="space-y-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500">
              <ShieldCheck className="h-8 w-8 text-green-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white">Pedido Confirmado!</h2>
              <p className="text-white/60 mt-2">
                Seu pedido #{orderData?.orderNumber} foi recebido com sucesso
              </p>
            </div>

            <div className="bg-white/[0.05] border border-white/10 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-white mb-3">Próximos Passos</h3>
              <div className="space-y-3 text-sm text-white/80">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-cyan-100 flex-shrink-0 mt-0.5" />
                  <p>Seu pedido será produzido em até 24-48h</p>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-cyan-100 flex-shrink-0 mt-0.5" />
                  <p>Receberá atualizações por WhatsApp e e-mail</p>
                </div>
                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-cyan-100 flex-shrink-0 mt-0.5" />
                  <p>Entraremos em contato para validar detalhes</p>
                </div>
              </div>
            </div>

            {paymentMethod === "pix" && orderData?.pixCode && (
              <div className="bg-white/[0.05] border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">PIX</h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600 mb-1">Copie o código PIX:</p>
                    <p className="font-mono text-sm break-all">{orderData.pixCode}</p>
                  </div>
                  <div className="bg-white p-3 rounded flex justify-center">
                    <div className="w-32 h-32 bg-gray-200" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/catalogo")}
                className="w-full btn-primary"
                style={{ minHeight: '48px' }}
              >
                Continuar Comprando
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push(`/conta/pedidos/${orderData?.id}`)}
                className="w-full border-white/20 text-white hover:bg-white/10"
                style={{ minHeight: '48px' }}
              >
                Acompanhar Pedido
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#08111b] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {["cart", "shipping", "payment", "confirmation"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-2 w-8 rounded-full transition-colors ${
                    currentStep === step || (currentStep === "confirmation" && step === "payment")
                      ? "bg-cyan-400"
                      : index < ["cart", "shipping", "payment", "confirmation"].indexOf(currentStep)
                      ? "bg-cyan-400/50"
                      : "bg-white/20"
                  }`}
                />
                {index < 3 && (
                  <div
                    className={`h-0.5 w-8 transition-colors ${
                      index < ["cart", "shipping", "payment", "confirmation"].indexOf(currentStep)
                        ? "bg-cyan-400/50"
                        : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/60">
            <span>Carrinho</span>
            <span>Entrega</span>
            <span>Pagamento</span>
            <span>Confirmação</span>
          </div>
        </div>

        <Card className="bg-white/[0.05] border-white/10">
          <CardContent className="p-6">
            {renderStepContent()}
            
            {currentStep !== "confirmation" && (
              <div className="mt-8 flex gap-4">
                {currentStep !== "cart" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentStep === "shipping") setCurrentStep("cart");
                      else if (currentStep === "payment") setCurrentStep("shipping");
                    }}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    style={{ minHeight: '48px' }}
                  >
                    Voltar
                  </Button>
                )}
                
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="flex-1 btn-primary"
                  style={{ minHeight: '48px' }}
                >
                  {isLoading ? "Processando..." : currentStep === "payment" ? "Finalizar Pedido" : "Avançar"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
