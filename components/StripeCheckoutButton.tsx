"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { CartItem, OrderAddress } from "@/lib/types";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Props {
  items: CartItem[];
  total: number;
  shippingAddress: OrderAddress;
  onSuccess: (paymentIntentId: string) => void;
  onError: (err: unknown) => void;
}

function CheckoutForm({ items, total, shippingAddress, onSuccess, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? "Payment failed");
        return;
      }

      // Create PaymentIntent server-side
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

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          payment_method_data: {
            billing_details: {
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
              email: shippingAddress.email,
            },
          },
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message ?? "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        // Create Printify order
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      onError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: {
            billingDetails: {
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
              email: shippingAddress.email,
            },
          },
        }}
      />

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-[#C9A84C] hover:bg-[#E0BE6C] disabled:bg-[#555] text-black text-sm font-semibold tracking-widest uppercase py-4 rounded transition-colors"
      >
        {loading ? "Processing..." : `Pay €${(total / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

export default function StripeCheckoutButton(props: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: props.total,
        items: props.items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: props.shippingAddress,
      }),
    })
      .then((r) => r.json())
      .then((d) => setClientSecret(d.clientSecret))
      .catch(props.onError);
  }, [props.total]); // re-fetch if total changes

  if (!clientSecret) {
    return <div className="h-12 bg-[#1A1A1A] rounded animate-pulse" />;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#C9A84C",
            colorBackground: "#111111",
            colorText: "#ffffff",
            colorDanger: "#fa755a",
            borderRadius: "4px",
          },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
