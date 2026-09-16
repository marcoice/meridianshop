"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <p
          className="font-serif font-light"
          style={{ fontSize: "5rem", color: "var(--border-2)", lineHeight: 1, marginBottom: "1.5rem" }}
        >
          ∅
        </p>
        <h1
          className="font-serif font-light mb-3"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "var(--text)" }}
        >
          Your selection is empty
        </h1>
        <p className="label mb-10" style={{ letterSpacing: "0.18em" }}>
          Discover our collection and add your favourites.
        </p>
        <Link href="/products" className="btn-gold">
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div
        className="text-center py-16 px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="label block mb-3" style={{ letterSpacing: "0.3em" }}>Review</span>
        <h1
          className="font-serif font-light"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", color: "var(--text)", lineHeight: 1 }}
        >
          Your selection
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Items list */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-6 py-8"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {/* Image */}
              <div
                className="flex-shrink-0 overflow-hidden"
                style={{ width: 100, height: 100, background: "var(--surface)" }}
              >
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p style={{ fontSize: "0.95rem", color: "var(--text)", fontWeight: 500 }}>
                      {item.title}
                    </p>
                    <p className="label mt-1" style={{ fontSize: "0.6rem" }}>
                      {item.variantTitle}
                    </p>
                  </div>
                  <p
                    style={{ fontSize: "1rem", fontWeight: 600, color: "var(--gold)", whiteSpace: "nowrap" }}
                  >
                    €{((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  {/* Qty */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="hover:text-[var(--text)] transition-colors flex items-center justify-center"
                      style={{ width: 28, height: 28, border: "1px solid var(--border-2)", color: "var(--text-3)" }}
                    >
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: "0.85rem", width: 24, textAlign: "center", color: "var(--text)" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="hover:text-[var(--text)] transition-colors flex items-center justify-center"
                      style={{ width: 28, height: 28, border: "1px solid var(--border-2)", color: "var(--text-3)" }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                    €{(item.price / 100).toFixed(2)} each
                  </span>

                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="ml-auto hover:text-red-400 transition-colors"
                    style={{ color: "var(--text-3)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 pt-10">
          <div>
            <button
              onClick={clearCart}
              className="label hover:text-[var(--text)] transition-colors"
              style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--text-3)" }}
            >
              Remove all items
            </button>
          </div>

          <div className="text-right">
            <p className="label mb-1" style={{ letterSpacing: "0.2em" }}>Subtotal</p>
            <p
              className="font-serif font-light"
              style={{ fontSize: "2.5rem", color: "var(--text)", lineHeight: 1 }}
            >
              €{(total() / 100).toFixed(2)}
            </p>
            <p className="label mt-2 mb-6" style={{ fontSize: "0.6rem" }}>
              Shipping & taxes calculated at checkout
            </p>
            <Link href="/checkout" className="btn-gold" style={{ width: "260px" }}>
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
