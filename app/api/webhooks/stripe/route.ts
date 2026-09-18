import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder } from "@/lib/printify";
import { getFirstShopId } from "@/lib/printify";
import type { OrderAddress } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  // Handle payment_intent.succeeded event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      // Extract shipping address from metadata
      const shippingAddress = JSON.parse(
        paymentIntent.metadata?.shipping_address || "{}"
      ) as OrderAddress;

      // Extract line items from metadata
      const lineItems = JSON.parse(
        paymentIntent.metadata?.line_items || "[]"
      );

      if (!shippingAddress || lineItems.length === 0) {
        console.error("Missing order data in payment metadata", paymentIntent);
        return NextResponse.json({ received: true });
      }

      // Create order on Printify
      const shopId = await getFirstShopId();
      await createOrder(shopId, {
        line_items: lineItems,
        shipping_method: 1,
        address_to: shippingAddress,
        external_id: paymentIntent.id,
        label: `STRIPE-${Date.now()}`,
        send_shipping_notification: true,
      });

      console.log(`[Webhook] Order created for payment ${paymentIntent.id}`);
    } catch (err) {
      console.error("[Webhook] Failed to create order:", err);
      // Don't return error to Stripe - just log it
      // Stripe will retry the webhook if we return error
    }
  }

  // Handle payment_intent.payment_failed event
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
    console.log(`Last error: ${paymentIntent.last_payment_error?.message}`);
  }

  return NextResponse.json({ received: true });
}
