"use client";

import Link from "next/link";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useState, useEffect } from "react";

export default function CartDrawer() {
  const { isOpen, closeCart, removeItem, updateQuantity, total } = useCart();
  const items = useCart((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Prevent hydration mismatch: server renders 0, client syncs after mount
  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-400"
        style={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
        }}
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="label" style={{ letterSpacing: "0.25em" }}>
              Your selection
            </span>
            {count > 0 && (
              <span
                className="flex items-center justify-center text-[9px] font-bold text-black"
                style={{ width: 18, height: 18, background: "var(--gold)", borderRadius: "50%" }}
              >
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close"
            style={{ color: "var(--text-3)" }}
            className="hover:text-[var(--text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5">
              <div
                className="font-serif font-light"
                style={{ fontSize: "3.5rem", color: "var(--border-2)", lineHeight: 1 }}
              >
                ∅
              </div>
              <p className="label" style={{ letterSpacing: "0.2em" }}>
                Your cart is empty
              </p>
              <Link href="/products" onClick={closeCart} className="btn-ghost mt-2" style={{ height: "2.75rem" }}>
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 pb-6"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  {/* Thumb */}
                  <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{ width: 72, height: 72, background: "var(--surface)" }}
                  >
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="line-clamp-1"
                      style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 500 }}
                    >
                      {item.title}
                    </p>
                    <p className="label mt-0.5" style={{ fontSize: "0.6rem" }}>
                      {item.variantTitle}
                    </p>
                    <p
                      className="mt-1.5 font-semibold"
                      style={{ fontSize: "0.85rem", color: "var(--gold)" }}
                    >
                      €{((item.price * item.quantity) / 100).toFixed(2)}
                    </p>

                    {/* Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="hover:text-[var(--text)] transition-colors flex items-center justify-center"
                        style={{ width: 24, height: 24, border: "1px solid var(--border-2)", color: "var(--text-3)" }}
                        aria-label="Decrease"
                      >
                        <Minus size={10} />
                      </button>
                      <span style={{ fontSize: "0.8rem", width: 20, textAlign: "center", color: "var(--text)" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="hover:text-[var(--text)] transition-colors flex items-center justify-center"
                        style={{ width: 24, height: 24, border: "1px solid var(--border-2)", color: "var(--text-3)" }}
                        aria-label="Increase"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="ml-auto hover:text-red-400 transition-colors"
                        style={{ color: "var(--text-3)" }}
                        aria-label="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-7 pb-8 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="label" style={{ letterSpacing: "0.2em" }}>Subtotal</span>
              <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text)" }}>
                €{(total() / 100).toFixed(2)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-gold w-full"
              style={{ width: "100%" }}
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center mt-3 label hover:text-[var(--text)] transition-colors"
              style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
