import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFirstShopId, getProduct } from "@/lib/printify";
import ProductInteractive from "@/components/ProductInteractive";

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

  return (
    <div>
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
        <ProductInteractive product={product} />
      </div>
    </div>
  );
}
