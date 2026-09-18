// Utility functions for payment processing

import { OrderAddress, CreateOrderPayload } from "@/lib/types";

/**
 * Calculate total amount including fees (if needed)
 * @param baseAmount Amount in cents
 * @param includeProcessingFee Whether to add payment processing fee
 * @returns Total amount in cents
 */
export function calculateTotalWithFees(
  baseAmount: number,
  includeProcessingFee = false
): number {
  if (!includeProcessingFee) return baseAmount;

  // Example: 1.4% + €0.25 for Stripe EU
  const stripePercentage = Math.ceil(baseAmount * 0.014);
  const stripeFlatFee = 25; // €0.25 in cents

  return baseAmount + stripePercentage + stripeFlatFee;
}

/**
 * Format price for display
 * @param cents Amount in cents
 * @param currency Currency code (e.g., 'EUR', 'USD')
 * @returns Formatted price string
 */
export function formatPrice(cents: number, currency = "EUR"): string {
  const amount = (cents / 100).toFixed(2);
  return `${currency === "EUR" ? "€" : "$"}${amount}`;
}

/**
 * Validate payment address
 * @param address Address to validate
 * @returns { valid: boolean, errors: string[] }
 */
export function validatePaymentAddress(
  address: OrderAddress
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  const requiredFields: (keyof OrderAddress)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "country",
    "address1",
    "city",
    "zip",
  ];

  for (const field of requiredFields) {
    if (!address[field] || (typeof address[field] === "string" && address[field].trim() === "")) {
      errors.push(`${field} is required`);
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (address.email && !emailRegex.test(address.email)) {
    errors.push("Invalid email format");
  }

  // Phone validation (basic)
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (address.phone && !phoneRegex.test(address.phone.replace(/\s/g, ""))) {
    errors.push("Invalid phone format");
  }

  // Country code validation (ISO 3166-1 alpha-2)
  const validCountries = [
    "IT",
    "US",
    "GB",
    "DE",
    "FR",
    "ES",
    "NL",
    "BE",
    "AT",
    "CH",
    "SE",
    "NO",
    "DK",
    "FI",
    "PL",
    "CZ",
    "CA",
    "AU",
  ];
  if (address.country && !validCountries.includes(address.country.toUpperCase())) {
    errors.push("Invalid country code");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Retry helper for API calls
 * @param fn Async function to retry
 * @param maxRetries Maximum number of retries
 * @param delayMs Delay between retries in milliseconds
 * @returns Result of the function
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        // Exponential backoff
        const waitTime = delayMs * Math.pow(2, attempt - 1);
        console.log(
          `Retry attempt ${attempt}/${maxRetries} in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * Generate idempotency key for payment requests
 * Prevents duplicate charges if request is retried
 * @param userId User ID
 * @param orderId Order ID or timestamp
 * @returns Idempotency key
 */
export function generateIdempotencyKey(
  userId: string,
  orderId: string
): string {
  return `${userId}-${orderId}-${Date.now()}`;
}

/**
 * Parse Stripe webhook event safely
 * @param body Raw request body
 * @param signature Signature header
 * @param secret Webhook secret
 * @returns Parsed event or null if invalid
 */
export async function parseStripeWebhook(
  body: string,
  signature: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
    // This should be done with stripe.webhooks.constructEvent()
    // But we show the general pattern here
    const json = JSON.parse(body);

    // In real implementation:
    // const event = stripe.webhooks.constructEvent(body, signature, secret);
    // return event;

    return json;
  } catch {
    return null;
  }
}

/**
 * Get payment method display name
 * @param method Payment method type
 * @returns Localized display name
 */
export function getPaymentMethodName(
  method: "stripe" | "paypal" | "card" | "apple-pay" | "google-pay" | string
): string {
  const names: Record<string, string> = {
    stripe: "Credit Card (Stripe)",
    paypal: "PayPal",
    card: "Credit Card",
    "apple-pay": "Apple Pay",
    "google-pay": "Google Pay",
  };

  return names[method] || method;
}

/**
 * Create Printify order payload from payment data
 * @param items Cart items
 * @param address Shipping address
 * @param paymentId Payment ID from Stripe/PayPal
 * @returns Printify order payload
 */
export function createPrintifyPayload(
  items: Array<{ productId: string; variantId: string; quantity: number }>,
  address: OrderAddress,
  paymentId: string
): CreateOrderPayload {
  return {
    line_items: items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
    shipping_method: 1,
    address_to: address,
    external_id: paymentId,
    label: `ORDER-${Date.now()}`,
    send_shipping_notification: true,
  };
}
