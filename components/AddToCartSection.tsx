"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import type { PrintifyProduct, PrintifyVariant } from "@/lib/types";

interface AddToCartProps {
  product: PrintifyProduct;
}

export default function AddToCartSection({ product }: AddToCartProps) {
  const { addItem } = useCart();
  const enabledVariants = product.variants.filter((v) => v.is_enabled);
  const defaultVariant = enabledVariants.find((v) => v.is_default) ?? enabledVariants[0];
  const [selected, setSelected] = useState<PrintifyVariant | undefined>(defaultVariant);
  const [added, setAdded] = useState(false);

  const defaultImage = product.images.find((img) => img.is_default) ?? product.images[0];
  const sizeOpt  = product.options.find((o) => o.type?.toLowerCase().includes("size"));
  const colorOpt = product.options.find((o) => o.type?.toLowerCase().includes("color"));

  function handleAdd() {
    if (!selected) return;
    addItem({
      productId: product.id,
      variantId: selected.id,
      title: product.title,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      image: defaultImage?.src ?? "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="space-y-8">
      {/* Price */}
      <div>
        <p
          className="font-serif font-light"
          style={{ fontSize: "2.2rem", color: "var(--gold)", lineHeight: 1 }}
        >
          {selected ? `€${(selected.price / 100).toFixed(2)}` : "—"}
        </p>
        {enabledVariants.length > 1 && (
          <p className="label mt-1.5" style={{ fontSize: "0.6rem" }}>
            Free shipping on orders over €50
          </p>
        )}
      </div>

      {/* Color selector */}
      {colorOpt && enabledVariants.length > 1 && (
        <div>
          <p className="label mb-3" style={{ letterSpacing: "0.25em" }}>
            Colour — <span style={{ color: "var(--text)" }}>{
              colorOpt.values.find((v) => selected?.options.includes(v.id))?.title ?? "—"
            }</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOpt.values.map((val) => {
              const matches = enabledVariants.filter((v) => v.options.includes(val.id));
              if (!matches.length) return null;
              const isSelected = matches.some((v) => v.id === selected?.id);
              return (
                <button
                  key={val.id}
                  onClick={() => setSelected(matches[0])}
                  className="transition-all"
                  style={{
                    padding: "0.4rem 1rem",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-2)",
                    color: isSelected ? "var(--text)" : "var(--text-2)",
                    background: isSelected ? "rgba(212,168,83,0.08)" : "transparent",
                  }}
                >
                  {val.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizeOpt && enabledVariants.length > 1 && (
        <div>
          <p className="label mb-3" style={{ letterSpacing: "0.25em" }}>
            Size — <span style={{ color: "var(--text)" }}>{
              sizeOpt.values.find((v) => selected?.options.includes(v.id))?.title ?? "—"
            }</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizeOpt.values.map((val) => {
              const matches = enabledVariants.filter((v) => v.options.includes(val.id));
              if (!matches.length) return null;
              const isSelected = matches.some((v) => v.id === selected?.id);
              return (
                <button
                  key={val.id}
                  onClick={() => setSelected(matches[0])}
                  className="transition-all"
                  style={{
                    minWidth: "3rem", height: "2.75rem",
                    fontSize: "0.7rem", letterSpacing: "0.08em",
                    border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-2)",
                    color: isSelected ? "var(--text)" : "var(--text-2)",
                    background: isSelected ? "rgba(212,168,83,0.08)" : "transparent",
                  }}
                >
                  {val.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generic dropdown */}
      {!colorOpt && !sizeOpt && enabledVariants.length > 1 && (
        <div>
          <p className="label mb-3" style={{ letterSpacing: "0.25em" }}>Variant</p>
          <select
            value={selected?.id ?? ""}
            onChange={(e) => setSelected(enabledVariants.find((v) => v.id === Number(e.target.value)))}
            className="w-full focus:outline-none"
            style={{
              background: "var(--surface)", border: "1px solid var(--border-2)",
              color: "var(--text)", fontSize: "0.8rem",
              padding: "0.75rem 1rem",
            }}
          >
            {enabledVariants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} — €{(v.price / 100).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Add to cart CTA */}
      <button
        onClick={handleAdd}
        disabled={!selected}
        className="w-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          height: "3.5rem",
          background: added ? "#1a3a1a" : "var(--gold)",
          color: added ? "#5aba5a" : "#000",
          fontSize: "0.65rem", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          border: added ? "1px solid #2d5a2d" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {added ? "Added to your selection ✓" : "Add to selection"}
      </button>

      {/* Trust signals */}
      <div
        className="grid grid-cols-3 gap-4"
        style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}
      >
        {[
          ["Free shipping", "Orders over €50"],
          ["Made to order", "Printed for you"],
          ["Easy returns", "30-day policy"],
        ].map(([title, sub]) => (
          <div key={title} className="text-center">
            <p style={{ fontSize: "0.65rem", color: "var(--text)", letterSpacing: "0.05em", fontWeight: 500 }}>
              {title}
            </p>
            <p style={{ fontSize: "0.6rem", color: "var(--text-3)", marginTop: 2 }}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
