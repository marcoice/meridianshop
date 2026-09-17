import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFirstShopId, getProduct } from "@/lib/printify";
import AddToCartSection from "@/components/AddToCartSection";
import ProductImageGallery from "@/components/ProductImageGallery";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const shopId = await getFirstShopId();
    const product = await getProduct(shopId, id);
    return {
      title: product.title,
      description: product.description?.replace(/<[^>]*>/g, "").slice(0, 160),
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) notFound();

  let product;
  try {
    const shopId = await getFirstShopId();
    product = await getProduct(shopId, id);
  } catch {
    notFound();
  }

  if (!product.visible) notFound();

  const images = product.images.filter((img) => img.src);

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="px-6 py-5 max-w-6xl mx-auto"
        style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: "var(--text-3)" }}
      >
        <a href="/" className="hover:text-[var(--text)] transition-colors">Home</a>
        <span className="mx-2" style={{ color: "var(--border-2)" }}>/</span>
        <a href="/products" className="hover:text-[var(--text)] transition-colors">Shop</a>
        <span className="mx-2" style={{ color: "var(--border-2)" }}>/</span>
        <span style={{ color: "var(--text-2)" }}>{product.title}</span>
      </nav>

      <div
        className="max-w-6xl mx-auto px-6 pb-32"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[var(--border)]">
          {/* ── Images column ────────────────────── */}
          <ProductImageGallery images={images} title={product.title} />

          {/* ── Product info column ──────────────── */}
          <div className="py-10 lg:pl-12">
            {/* Title */}
            <h1
              className="font-serif font-light leading-none mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--text)" }}
            >
              {product.title}
            </h1>

            {/* Subtitle line */}
            <p className="label mb-8" style={{ color: "var(--gold-dim)", letterSpacing: "0.3em" }}>
              Meridian Collection
            </p>

            <AddToCartSection product={product} />

            {/* Description */}
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

            {/* Tags */}
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
      </div>
    </div>
  );
}
