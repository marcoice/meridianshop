// TypeScript types for payment processing

export interface PaymentIntentRequest {
  amount: number; // in cents
  items: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
  }>;
  shippingAddress: OrderAddress;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
}

export interface StripeMetadata {
  customer_name: string;
  customer_email: string;
  shipping_address: string; // JSON stringified
}

export type PaymentMethod = "paypal" | "stripe" | "card" | "apple-pay" | "google-pay";

export interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  error?: string;
  timestamp: string;
}
