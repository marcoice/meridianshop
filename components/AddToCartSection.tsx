"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import type { PrintifyProduct, PrintifyVariant } from "@/lib/types";

interface AddToCartProps {
  product: PrintifyProduct;
  selectedColorId?: number;
  onColorChange?: (colorId: number | undefined) => void;
}

export default function AddToCartSection({ product, selectedColorId, onColorChange }: AddToCartProps) {
  const { addItem } = useCart();
  const enabledVariants = product.variants.filter((v) => v.is_enabled);
  const defaultVariant = enabledVariants.find((v) => v.is_default) ?? enabledVariants[0];

  const sizeOpt  = product.options.find((o) => o.type?.toLowerCase().includes("size"));
  const colorOpt = product.options.find((o) => o.type?.toLowerCase().includes("color"));

  const whiteColorId = colorOpt
    ? colorOpt.values.find((value) =>
        ["white", "bianco", "ivory", "cream"].some((word) => value.title.toLowerCase().includes(word))
      )?.id
    : undefined;

  // Track color and size independently
  const [internalSelectedColorId, setInternalSelectedColorId] = useState<number | undefined>(
    selectedColorId !== undefined
      ? selectedColorId
      : (whiteColorId ?? (colorOpt && defaultVariant ? colorOpt.values.find((v) => defaultVariant.options.includes(v.id))?.id : undefined))
  );
  
  const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>(
    sizeOpt && defaultVariant ? sizeOpt.values.find((v) => defaultVariant.options.includes(v.id))?.id : undefined
  );
  const [added, setAdded] = useState(false);

  // Sync internal color state with prop
  useEffect(() => {
    if (selectedColorId !== undefined) {
      setInternalSelectedColorId(selectedColorId);
    }
  }, [selectedColorId]);

  // Find the variant matching current color + size selection
  const selected = enabledVariants.find((v) => {
    const colorMatch = !colorOpt || internalSelectedColorId === undefined || v.options.includes(internalSelectedColorId);
    const sizeMatch  = !sizeOpt  || selectedSizeId  === undefined || v.options.includes(selectedSizeId);
    return colorMatch && sizeMatch;
  });

  const defaultImage = product.images.find((img) => img.is_default) ?? product.images[0];

  function handleColorChange(colorId: number | undefined) {
    setInternalSelectedColorId(colorId);
    onColorChange?.(colorId);
  }

  function handleSizeChange(sizeId: number | undefined) {
    setSelectedSizeId(sizeId);
  }

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

  // Check if a specific color+size combo has an enabled variant
  function isComboAvailable(colorId?: number, sizeId?: number) {
    return enabledVariants.some((v) => {
      const colorMatch = !colorOpt || colorId === undefined || v.options.includes(colorId);
      const sizeMatch  = !sizeOpt  || sizeId  === undefined || v.options.includes(sizeId);
      return colorMatch && sizeMatch;
    });
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
            Colour — <span style={{ color: "var(--text)" }}>{colorOpt.values.find((v) => v.id === internalSelectedColorId)?.title ?? "—"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOpt.values.map((val) => {
              const hasAny = enabledVariants.some((v) => v.options.includes(val.id));
              if (!hasAny) return null;
              const isSelected = internalSelectedColorId === val.id;
              const available = isComboAvailable(val.id, selectedSizeId);
              return (
                <button
                  type="button"
                  key={val.id}
                  onClick={() => handleColorChange(val.id)}
                  className="transition-all"
                  style={{
                    padding: "0.4rem 1rem",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-2)",
                    color: isSelected ? "var(--text)" : !available ? "var(--text-3)" : "var(--text-2)",
                    background: isSelected ? "rgba(212,168,83,0.08)" : "transparent",
                    opacity: !isSelected && !available ? 0.4 : 1,
                    textDecoration: !isSelected && !available ? "line-through" : "none",
                    pointerEvents: "auto",
                    cursor: "pointer",
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
            Size — <span style={{ color: "var(--text)" }}>{sizeOpt.values.find((v) => v.id === selectedSizeId)?.title ?? "—"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizeOpt.values.map((val) => {
              const hasAny = enabledVariants.some((v) => v.options.includes(val.id));
              if (!hasAny) return null;
              const isSelected = selectedSizeId === val.id;
              const available = isComboAvailable(internalSelectedColorId, val.id);
              return (
                <button
                  type="button"
                  key={val.id}
                  onClick={() => handleSizeChange(val.id)}
                  className="transition-all"
                  style={{
                    minWidth: "3rem", height: "2.75rem",
                    fontSize: "0.7rem", letterSpacing: "0.08em",
                    border: isSelected ? "1px solid var(--gold)" : "1px solid var(--border-2)",
                    color: isSelected ? "var(--text)" : !available ? "var(--text-3)" : "var(--text-2)",
                    background: isSelected ? "rgba(212,168,83,0.08)" : "transparent",
                    opacity: !isSelected && !available ? 0.4 : 1,
                    textDecoration: !isSelected && !available ? "line-through" : "none",
                    pointerEvents: "auto",
                    cursor: "pointer",
                  }}
                >
                  {val.title}
                </button>
              );
            })}
          </div>
          {!selected && selectedSizeId && internalSelectedColorId && (
            <p className="mt-2 text-xs" style={{ color: "var(--text-3)" }}>
              This combination is not available
            </p>
          )}
        </div>
      )}

      {/* Generic dropdown */}
      {!colorOpt && !sizeOpt && enabledVariants.length > 1 && (
        <div>
          <p className="label mb-3" style={{ letterSpacing: "0.25em" }}>Variant</p>
          <select
            value={selected?.id ?? ""}
            onChange={(e) => {
              const v = enabledVariants.find((v) => v.id === Number(e.target.value));
              if (v) {
                handleColorChange(undefined);
                handleSizeChange(undefined);
              }
            }}
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
        type="button"
        onClick={handleAdd}
        disabled={!selected}
        className="w-full transition-all disabled:cursor-not-allowed"
        style={{
          height: "3.5rem",
          background: added ? "#1a3a1a" : !selected ? "transparent" : "var(--gold)",
          color: added ? "#5aba5a" : !selected ? "var(--text-3)" : "#000",
          fontSize: "0.65rem", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          border: added ? "1px solid #2d5a2d" : !selected ? "1px solid var(--border-2)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {added ? "Added to your selection \u2713" : !selected ? "Unavailable in this combination" : "Add to selection"}
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
