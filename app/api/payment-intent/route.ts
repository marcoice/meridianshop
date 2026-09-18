import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { OrderAddress } from "@/lib/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-08-26.dahlia" as any,
});

interface PaymentIntentRequest {
  amount: number; // in cents
  items: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
  }>;
  shippingAddress: OrderAddress;
}

function validatePaymentIntentRequest(
  body: unknown
): body is PaymentIntentRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;

  if (typeof b.amount !== "number" || b.amount <= 0) return false;
  if (!Array.isArray(b.items) || b.items.length === 0) return false;
  if (!b.shippingAddress || typeof b.shippingAddress !== "object") return false;

  const addr = b.shippingAddress as Record<string, unknown>;
  const required = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "country",
    "address1",
    "city",
    "zip",
  ];
  for (const field of required) {
    if (!addr[field] || typeof addr[field] !== "string") return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email as string)) return false;

  return true;
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!validatePaymentIntentRequest(body)) {
      return NextResponse.json(
        { error: "Invalid payment intent request" },
        { status: 422 }
      );
    }

    const { amount, shippingAddress } = body;

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      description: "Meridian Shop order",
      metadata: {
        customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        customer_email: shippingAddress.email,
        shipping_address: JSON.stringify(shippingAddress),
      },
      billing_details: {
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        email: shippingAddress.email,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (err) {
    console.error("[/api/payment-intent]", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
