"use client";

import { useState } from "react";
import type { PrintifyProduct } from "@/lib/types";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartSection from "@/components/AddToCartSection";

interface Props {
  product: PrintifyProduct;
}

export default function ProductInteractive({ product }: Props) {
  const colorOpt = product.options.find((o) => o.type?.toLowerCase().includes("color"));

  const defaultVariant = product.variants.find((v) => v.is_enabled && v.is_default)
    ?? product.variants.find((v) => v.is_enabled);

  const defaultColorId = colorOpt && defaultVariant
    ? colorOpt.values.find((v) => defaultVariant.options.includes(v.id))?.id
    : undefined;

  const [selectedColorId, setSelectedColorId] = useState<number | undefined>(defaultColorId);

  const allImages = product.images.filter((img) => img.src);

  // img.variant_ids are variant IDs; selectedColorId is an option-value ID.
  // Find which variant IDs correspond to the selected color option value.
  const variantsForColor = selectedColorId
    ? product.variants.filter((v) => v.options.includes(selectedColorId))
    : [];

  const variantIdsForColor = new Set(variantsForColor.map((v) => v.id));

  const filteredImages = selectedColorId
    ? allImages.filter((img) => img.variant_ids.some((vid) => variantIdsForColor.has(vid)))
    : allImages;

  const displayImages = filteredImages.length > 0 ? filteredImages : allImages;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[var(--border)]">
      <ProductImageGallery images={displayImages} title={product.title} />

      <div className="py-10 lg:pl-12">
        <h1
          className="font-serif font-light leading-none mb-3"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--text)" }}
        >
          {product.title}
        </h1>

        <AddToCartSection
          product={product}
          selectedColorId={selectedColorId}
          onColorChange={setSelectedColorId}
        />

        {product.description && (
          <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="label mb-5" style={{ letterSpacing: "0.3em", color: "var(--text-3)" }}>
              About this product
            </p>
            <div
              className="product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {product.tags.length > 0 && (
          <div className="mt-8 pt-6 flex flex-wrap gap-1.5" style={{ borderTop: "1px solid var(--border)" }}>
            {product.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "0.25rem 0.65rem",
                  border: "1px solid var(--border)",
                  fontSize: "0.52rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-3)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
