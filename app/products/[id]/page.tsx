import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFirstShopId, getProduct } from "@/lib/printify";
import AddToCartSection from "@/components/AddToCartSection";

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
  const defaultImage = images.find((img) => img.is_default) ?? images[0];

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="px-6 py-4 max-w-6xl mx-auto"
        style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--text-3)" }}
      >
        <a href="/" className="hover:text-[var(--text)] transition-colors">Home</a>
        <span className="mx-2" style={{ color: "var(--border-2)" }}>/</span>
        <a href="/products" className="hover:text-[var(--text)] transition-colors">Shop</a>
        <span className="mx-2" style={{ color: "var(--border-2)" }}>/</span>
        <span style={{ color: "var(--text-2)" }}>{product.title}</span>
      </nav>

      <div
        className="max-w-6xl mx-auto px-6 pb-24"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[var(--border)]">
          {/* ── Images column ────────────────────── */}
          <div className="py-10 lg:pr-12 space-y-3">
            {/* Main image */}
            <div
              className="overflow-hidden"
              style={{ aspectRatio: "1/1", background: "var(--surface)" }}
            >
              {defaultImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={defaultImage.src}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-1">
                {images.slice(0, 8).map((img, i) => (
                  <div
                    key={i}
                    className="overflow-hidden"
                    style={{ aspectRatio: "1/1", background: "var(--surface)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={`${product.title} view ${i + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      style={{ opacity: 0.65, transition: "opacity 0.2s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "1")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.65")}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info column ──────────────── */}
          <div className="py-10 lg:pl-12">
            {/* Title */}
            <h1
              className="font-serif font-light leading-tight mb-8"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--text)" }}
            >
              {product.title}
            </h1>

            <AddToCartSection product={product} />

            {/* Description */}
            {product.description && (
              <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="label mb-4" style={{ letterSpacing: "0.25em" }}>Description</p>
                <div
                  style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.85 }}
                  className="[&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="label"
                    style={{
                      padding: "0.3rem 0.75rem",
                      border: "1px solid var(--border-2)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.12em",
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
