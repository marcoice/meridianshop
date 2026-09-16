import { NextResponse } from "next/server";
import { getFirstShopId, createOrder } from "@/lib/printify";
import { CreateOrderPayload } from "@/lib/types";
import crypto from "crypto";

// Input validation
function validateOrderPayload(body: unknown): body is CreateOrderPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.line_items) || b.line_items.length === 0) return false;
  if (!b.address_to || typeof b.address_to !== "object") return false;

  const addr = b.address_to as Record<string, unknown>;
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

  // Basic email validation
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

    if (!validateOrderPayload(body)) {
      return NextResponse.json(
        { error: "Invalid order payload" },
        { status: 422 }
      );
    }

    const shopId = await getFirstShopId();

    // Generate a unique external ID for idempotency
    const payload: CreateOrderPayload = {
      ...body,
      external_id: crypto.randomUUID(),
      label: `MERIDIAN-${Date.now()}`,
      shipping_method: body.shipping_method ?? 1,
      send_shipping_notification: true,
    };

    const order = await createOrder(shopId, payload);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("[/api/orders]", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
