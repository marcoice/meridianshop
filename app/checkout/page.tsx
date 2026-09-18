"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import type { OrderAddress } from "@/lib/types";
import dynamic from "next/dynamic";

// Lazy-load payment components — avoids SSR issues
const PayPalCheckoutButton = dynamic(
  () => import("@/components/PayPalCheckoutButton"),
  { ssr: false }
);

const StripeCheckoutButton = dynamic(
  () => import("@/components/StripeCheckoutButton"),
  { ssr: false }
);

const PAYPAL_CONFIGURED =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== "your_paypal_client_id_here";

const STRIPE_CONFIGURED =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== "your_stripe_publishable_key_here";

const EMPTY_ADDRESS: OrderAddress = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "",
  region: "",
  address1: "",
  address2: "",
  city: "",
  zip: "",
};

function Field({
  label,
  name,
  type = "text",
  required = true,
  half = false,
  value,
  onChange,
}: {
  label: string;
  name: keyof OrderAddress;
  type?: string;
  required?: boolean;
  half?: boolean;
  value: string;
  onChange: (name: keyof OrderAddress, value: string) => void;
}) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-xs text-[#888] tracking-widest uppercase mb-1.5">
        {label}
        {required && <span className="text-[#C9A84C] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full bg-[#111] border border-[#2A2A2A] text-white text-sm rounded px-3 py-2.5 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#333]"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState<OrderAddress>(EMPTY_ADDRESS);
  const [step, setStep] = useState<"address" | "payment">("address");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "paypal" | "stripe" | null
  >(STRIPE_CONFIGURED ? "stripe" : PAYPAL_CONFIGURED ? "paypal" : null);

  const cartTotal = total();
  const SHIPPING_THRESHOLD = 5000; // €50.00 in cents
  const SHIPPING_COST = 299;       // €2.99 in cents
  const shipping = cartTotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = cartTotal + shipping;

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <p className="text-[#555] text-sm mb-6">Your cart is empty.</p>
        <a
          href="/products"
          className="bg-[#C9A84C] text-black text-sm font-semibold tracking-widest uppercase px-8 py-3.5 rounded"
        >
          Continue shopping
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-32 text-center">
        <div className="w-12 h-12 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto mb-6">
          <span className="text-green-400 text-xl">✓</span>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Order confirmed!
        </h1>
        <p className="text-[#888] text-sm mb-8">
          Thank you for your purchase. You will receive a confirmation email
          shortly.
        </p>
        <a
          href="/products"
          className="bg-[#C9A84C] text-black text-sm font-semibold tracking-widest uppercase px-8 py-3.5 rounded"
        >
          Continue shopping
        </a>
      </div>
    );
  }

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  function handleFieldChange(name: keyof OrderAddress, value: string) {
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-semibold text-white mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Form */}
        <div className="lg:col-span-3">
          {step === "address" && (
            <form onSubmit={handleAddressSubmit}>
              <h2 className="text-white font-medium mb-6 text-lg">
                Shipping address
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First name" name="first_name" half value={address.first_name} onChange={handleFieldChange} />
                <Field label="Last name" name="last_name" half value={address.last_name} onChange={handleFieldChange} />
                <Field label="Email" name="email" type="email" value={address.email} onChange={handleFieldChange} />
                <Field label="Phone" name="phone" type="tel" value={address.phone} onChange={handleFieldChange} />
                <Field label="Country (ISO code, e.g. IT)" name="country" half value={address.country} onChange={handleFieldChange} />
                <Field
                  label="State / Region"
                  name="region"
                  half
                  required={false}
                  value={address.region ?? ""}
                  onChange={handleFieldChange}
                />
                <Field label="Address" name="address1" value={address.address1} onChange={handleFieldChange} />
                <Field
                  label="Apartment, suite… (optional)"
                  name="address2"
                  required={false}
                  value={address.address2 ?? ""}
                  onChange={handleFieldChange}
                />
                <Field label="City" name="city" half value={address.city} onChange={handleFieldChange} />
                <Field label="ZIP / Postal code" name="zip" half value={address.zip} onChange={handleFieldChange} />
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-[#C9A84C] hover:bg-[#E0BE6C] text-black text-sm font-semibold tracking-widest uppercase py-4 rounded transition-colors"
              >
                Continue to payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep("address")}
                  className="text-[#888] hover:text-white text-xs tracking-widest uppercase transition-colors"
                >
                  ← Back
                </button>
                <h2 className="text-white font-medium text-lg">Payment</h2>
              </div>

              {/* Shipping recap */}
              <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-4 text-sm text-[#888] mb-6 space-y-0.5">
                <p className="text-white font-medium">
                  {address.first_name} {address.last_name}
                </p>
                <p>{address.address1}</p>
                <p>
                  {address.zip} {address.city}, {address.country}
                </p>
                <p>{address.email}</p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              {/* Payment method selector */}
              {(PAYPAL_CONFIGURED || STRIPE_CONFIGURED) && (
                <div className="mb-6 space-y-3">
                  <p className="text-white font-medium text-sm">
                    Select payment method
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {STRIPE_CONFIGURED && (
                      <label className="flex items-center gap-3 p-4 bg-[#111] border border-[#2A2A2A] rounded cursor-pointer hover:border-[#C9A84C] transition-colors">
                        <input
                          type="radio"
                          name="payment-method"
                          value="stripe"
                          checked={paymentMethod === "stripe"}
                          onChange={() => setPaymentMethod("stripe")}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">
                            Card / Apple Pay / Google Pay
                          </p>
                          <p className="text-[#888] text-xs">
                            Secure payment via Stripe
                          </p>
                        </div>
                      </label>
                    )}

                    {PAYPAL_CONFIGURED && (
                      <label className="flex items-center gap-3 p-4 bg-[#111] border border-[#2A2A2A] rounded cursor-pointer hover:border-[#C9A84C] transition-colors">
                        <input
                          type="radio"
                          name="payment-method"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={() => setPaymentMethod("paypal")}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">
                            PayPal
                          </p>
                          <p className="text-[#888] text-xs">
                            Fast and secure payment
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Payment form */}
              {paymentMethod === "stripe" && STRIPE_CONFIGURED ? (
                <StripeCheckoutButton
                  items={items}
                  total={orderTotal}
                  shippingAddress={address}
                  onSuccess={() => {
                    clearCart();
                    setSuccess(true);
                  }}
                  onError={() =>
                    setError(
                      "Payment failed. Please try again or contact support."
                    )
                  }
                />
              ) : paymentMethod === "paypal" && PAYPAL_CONFIGURED ? (
                <PayPalCheckoutButton
                  items={items}
                  total={orderTotal}
                  shippingAddress={address}
                  onSuccess={() => {
                    clearCart();
                    setSuccess(true);
                  }}
                  onError={() =>
                    setError(
                      "Payment failed. Please try again or contact support."
                    )
                  }
                />
              ) : !PAYPAL_CONFIGURED && !STRIPE_CONFIGURED ? (
                <div className="bg-[#111] border border-[#2A2A2A] rounded-lg p-6 text-center">
                  <p className="text-[#555] text-sm mb-2">
                    Payment methods not configured.
                  </p>
                  <p className="text-[#333] text-xs">
                    Configure Stripe or PayPal in your{" "}
                    <code className="text-[#888]">.env.local</code> to enable
                    payments.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-lg p-6 sticky top-24">
            <h3 className="text-white font-medium mb-5">Order summary</h3>

            <ul className="space-y-4 mb-5 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-3"
                >
                  <div className="w-12 h-12 bg-[#1A1A1A] rounded overflow-hidden flex-shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs truncate">{item.title}</p>
                    <p className="text-[#555] text-xs">{item.variantTitle}</p>
                    <p className="text-[#888] text-xs">×{item.quantity}</p>
                  </div>
                  <p className="text-[#C9A84C] text-sm font-medium">
                    €{((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#1A1A1A] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Subtotal</span>
                <span className="text-white">€{(cartTotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-400 text-xs font-medium">Free</span>
                ) : (
                  <span className="text-white">€{(shipping / 100).toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-[#1A1A1A]">
                <span className="text-white">Total</span>
                <span className="text-[#C9A84C]">€{(orderTotal / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
