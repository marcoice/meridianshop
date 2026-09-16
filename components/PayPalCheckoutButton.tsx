"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { CartItem, OrderAddress } from "@/lib/types";

interface PayPalCheckoutButtonProps {
  items: CartItem[];
  total: number; // in cents
  shippingAddress: OrderAddress;
  onSuccess: (orderId: string) => void;
  onError: (err: unknown) => void;
}

export default function PayPalCheckoutButton({
  items,
  total,
  shippingAddress,
  onSuccess,
  onError,
}: PayPalCheckoutButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();

  const totalEur = (total / 100).toFixed(2);

  return (
    <div className="w-full">
      {isPending && (
        <div className="h-12 bg-[#1A1A1A] rounded animate-pulse" />
      )}
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", color: "gold" }}
        createOrder={(_, actions) =>
          actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "EUR",
                  value: totalEur,
                },
                description: "Meridian Shop order",
              },
            ],
          })
        }
        onApprove={async (data, actions) => {
          if (!actions.order) return;
          const details = await actions.order.capture();
          const captureId = details.id ?? data.orderID;

          // Create Printify order after successful payment
          try {
            const res = await fetch("/api/orders", {
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

            if (!res.ok) throw new Error("Order creation failed");
            onSuccess(captureId);
          } catch (err) {
            onError(err);
          }
        }}
        onError={onError}
      />
    </div>
  );
}
