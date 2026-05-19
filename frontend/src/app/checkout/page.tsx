"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [whatsappNumber, setWhatsappNumber] = useState("+50688111178");
  const [sinpeNumber, setSinpeNumber] = useState("88111178");

  // Verificar sesión y cargar config
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
    }

    // Cargar config global
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`)
      .then(res => res.json())
      .then((data: any[]) => {
        const wa = data.find(c => c.key === 'social_whatsapp')?.value;
        const sinpe = data.find(c => c.key === 'sinpe_number')?.value;
        
        if (wa) {
          // Extraer número de link wa.me o usar valor directo si es número
          const match = wa.match(/wa\.me\/(\d+)/);
          if (match) setWhatsappNumber("+" + match[1]);
          else if (wa.includes('+')) setWhatsappNumber(wa);
        }
        if (sinpe) setSinpeNumber(sinpe);
      })
      .catch(console.error);
  }, []);

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");

      const payload = {
        total_amount: cartTotal,
        payment_method: paymentMethod,
        sale_type: "Online",
        items: cartItems.map(item => ({
          description: item.name,
          price: item.price,
          quantity: item.quantity,
          reference_type: "Producto",
          reference_id: item.id
        }))
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al procesar la compra");
      }

      setSuccess(true);
      clearCart();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
        <div className="bg-white/5 border border-green-500/30 p-8 rounded-2xl w-full max-w-md text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Pedido Recibido</h2>

          {paymentMethod === "SINPE" ? (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
              <p className="text-white/80 text-sm mb-4">
                Has seleccionado pago por SINPE. Tu pedido está en estado <strong className="text-orange-400">Pendiente</strong>.
              </p>
              <p className="text-white text-sm font-bold">
                Por favor transfiere al SINPE Móvil <strong>{sinpeNumber}</strong> y contáctanos a nuestro WhatsApp para enviar el comprobante de pago y liberar tus cartas:
              </p>
              <a
                href={`https://wa.me/${whatsappNumber.replace('+', '')}?text=Hola, acabo de realizar un pedido en Card Club. Adjunto mi comprobante de SINPE.`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-colors"
              >
                Enviar Comprobante
              </a>
            </div>
          ) : (
            <p className="text-white/60 mb-6">
              Tu pedido ha sido procesado exitosamente. Podrás recoger tus cartas en la tienda.
            </p>
          )}

          <Button variant="outline" onClick={() => window.location.href = "/tienda"}>
            Volver a la Tienda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-blue py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-8">
          Finalizar <span className="text-brand-yellow">Compra</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Resumen del Pedido</h2>

              {cartItems.length === 0 ? (
                <p className="text-white/40">No hay productos en el carrito.</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <img src={item.image_url || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-16 object-cover rounded bg-black/40" />
                        <div>
                          <p className="text-white font-bold text-sm">{item.name}</p>
                          <p className="text-white/40 text-xs">Cant: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-brand-yellow font-mono">{formatCRC(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Método de Pago</h2>

              <div className="space-y-3 mb-8">
                {["Tarjeta", "SINPE", "Efectivo"].map((method) => (
                  <label key={method} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-brand-yellow w-4 h-4"
                    />
                    <span className="font-bold uppercase tracking-wider text-sm">{method}</span>
                  </label>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-bold uppercase tracking-widest">Total</span>
                  <span className="text-brand-yellow font-black text-2xl">{formatCRC(cartTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 text-red-200 p-3 rounded text-sm mb-4 border border-red-500/30 text-center">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full py-4 text-lg"
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? "Procesando..." : "Confirmar Compra"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
