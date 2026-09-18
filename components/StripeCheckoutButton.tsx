"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import type { CartItem, OrderAddress } from "@/lib/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeCheckoutButtonProps {
  items: CartItem[];
  total: number; // in cents
  shippingAddress: OrderAddress;
  onSuccess: (paymentIntentId: string) => void;
  onError: (err: unknown) => void;
}

function StripePaymentForm({
  items,
  total,
  shippingAddress,
  onSuccess,
  onError,
}: StripeCheckoutButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "card" | "apple" | "google" | "payment-request"
  >("card");

  const totalEur = (total / 100).toFixed(2);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "IT",
      currency: "eur",
      total: {
        label: "Meridian Shop Order",
        amount: total,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, total]);

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Create Payment Intent
      const res = await fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items: items.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress,
        }),
      });

      if (!res.ok) throw new Error("Failed to create payment intent");
      const { clientSecret } = await res.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
              email: shippingAddress.email,
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        // Create Printify order after successful payment
        try {
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              line_items: items.map((item) => ({
                product_id: item.productId,
                variant_id: item.variantId,
                quantity: item.quantity,
              })),
              shipping_method: 1,
              address_to: shippingAddress,
            }),
          });

          if (!orderRes.ok) throw new Error("Order creation failed");
          onSuccess(paymentIntent.id);
        } catch (err) {
          onError(err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRequest = async (e: any) => {
    const { complete } = e;

    try {
      // Create Payment Intent
      const res = await fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          items: items.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            ...shippingAddress,
            first_name: e.payerName?.split(" ")[0] || shippingAddress.first_name,
            last_name: e.payerName?.split(" ").slice(1).join(" ") || shippingAddress.last_name,
            email: e.payerEmail || shippingAddress.email,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to create payment intent");
      const { clientSecret } = await res.json();

      if (!stripe) throw new Error("Stripe not loaded");
      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(clientSecret);

      if (stripeError) {
        complete("fail");
        setError(stripeError.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        complete("success");
        // Create Printify order
        try {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              line_items: items.map((item) => ({
                product_id: item.productId,
                variant_id: item.variantId,
                quantity: item.quantity,
              })),
              shipping_method: 1,
              address_to: shippingAddress,
            }),
          });
          onSuccess(paymentIntent.id);
        } catch (err) {
          onError(err);
        }
      } else {
        complete("fail");
        setError("Payment declined");
      }
    } catch (err) {
      complete("fail");
      setError(err instanceof Error ? err.message : "Payment failed");
      onError(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2A2A2A]">
        {paymentRequest && (
          <button
            onClick={() => setActiveTab("payment-request")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "payment-request"
                ? "text-[#C9A84C] border-b-2 border-[#C9A84C]"
                : "text-[#888] hover:text-white"
            }`}
          >
            Apple Pay / Google Pay
          </button>
        )}
        <button
          onClick={() => setActiveTab("card")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "card"
              ? "text-[#C9A84C] border-b-2 border-[#C9A84C]"
              : "text-[#888] hover:text-white"
          }`}
        >
          Card
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded px-4 py-3">
          {error}
        </div>
      )}

      {/* Apple Pay / Google Pay */}
      {activeTab === "payment-request" && paymentRequest && (
        <PaymentRequestButtonElement
          options={{ paymentRequest }}
          onReady={() => {}}
          onChange={() => {}}
          onLoadingChange={() => {}}
        />
      )}

      {/* Card Payment */}
      {activeTab === "card" && (
        <form onSubmit={handleCardPayment} className="space-y-4">
          <div className="bg-[#111] border border-[#2A2A2A] rounded px-4 py-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#ffffff",
                    "::placeholder": {
                      color: "#555",
                    },
                  },
                  invalid: {
                    color: "#fa755a",
                  },
                },
                hidePostalCode: false,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full bg-[#C9A84C] hover:bg-[#E0BE6C] disabled:bg-[#555] text-black text-sm font-semibold tracking-widest uppercase py-4 rounded transition-colors"
          >
            {loading ? "Processing..." : `Pay €${totalEur}`}
          </button>
        </form>
      )}
    </div>
  );
}

export default function StripeCheckoutButton(props: StripeCheckoutButtonProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
}
