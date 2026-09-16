/**
 * Server-side only Printify API client.
 * This module must NEVER be imported in client components.
 * The API token is read exclusively from environment variables.
 */

import type {
  PrintifyProduct,
  PrintifyProductsResponse,
  PrintifyShop,
  CreateOrderPayload,
} from "./types";

const PRINTIFY_BASE_URL = "https://api.printify.com/v1";

function getToken(): string {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) {
    throw new Error("PRINTIFY_API_TOKEN is not configured");
  }
  return token;
}

function buildHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function printifyFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${PRINTIFY_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(),
    next: { revalidate: 60 }, // cache for 60s
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Printify API error [${res.status}]: ${res.statusText} — ${body}`
    );
  }

  return res.json() as Promise<T>;
}

// ── Shops ──────────────────────────────────────────────────────────────────

export async function getShops(): Promise<PrintifyShop[]> {
  return printifyFetch<PrintifyShop[]>("/shops.json");
}

export async function getFirstShopId(): Promise<number> {
  const shops = await getShops();
  if (!shops.length) throw new Error("No Printify shops found");
  return shops[0].id;
}

// ── Products ───────────────────────────────────────────────────────────────

export async function getProducts(
  shopId: number,
  page = 1,
  limit = 20
): Promise<PrintifyProductsResponse> {
  return printifyFetch<PrintifyProductsResponse>(
    `/shops/${shopId}/products.json?page=${page}&limit=${limit}`
  );
}

export async function getProduct(
  shopId: number,
  productId: string
): Promise<PrintifyProduct> {
  return printifyFetch<PrintifyProduct>(
    `/shops/${shopId}/products/${productId}.json`
  );
}

// ── Orders ─────────────────────────────────────────────────────────────────

export async function createOrder(
  shopId: number,
  payload: CreateOrderPayload
) {
  return printifyFetch(`/shops/${shopId}/orders.json`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
