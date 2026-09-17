"use client";

import Link from "next/link";
import type { PrintifyProduct } from "@/lib/types";

interface ProductCardProps {
  product: PrintifyProduct;
  priority?: boolean;
}

export default function ProductCard({ product, priority: _priority }: ProductCardProps) {
  const defaultImage = product.images.find((img) => img.is_default) ?? product.images[0];

  const enabledVariants = product.variants.filter((v) => v.is_enabled);
  const minPrice = enabledVariants.length
    ? Math.min(...enabledVariants.map((v) => v.price))
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block relative overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Image container — square */}
      <div className="aspect-square overflow-hidden relative">
        {defaultImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaultImage.src}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--surface-2)" }}
          >
            <span className="label">No image</span>
          </div>
        )}

        {/* Dark overlay on hover — CSS only, no JS handlers */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <span
            className="btn-gold"
            style={{ height: "2.5rem", fontSize: "0.6rem", letterSpacing: "0.2em", padding: "0 1.5rem" }}
          >
            View product
          </span>
        </div>
      </div>

      {/* Info strip */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p
          className="line-clamp-1 text-[var(--text)] transition-colors group-hover:text-[var(--gold)]"
          style={{ fontSize: "0.85rem", fontWeight: 400, letterSpacing: "0.03em" }}
        >
          {product.title}
        </p>

        {minPrice > 0 && (
          <p className="mt-1.5" style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
            From{" "}
            <span style={{ color: "var(--gold)", fontWeight: 600 }}>
              €{(minPrice / 100).toFixed(2)}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
