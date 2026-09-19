import type { Metadata } from "next";
import { getFirstShopId, getProducts } from "@/lib/printify";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all Meridian products",
};

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  let products = null;
  let error = false;

  try {
    const shopId = await getFirstShopId();
    products = await getProducts(shopId, page, 20);
  } catch {
    error = true;
  }

  // Products are already filtered by the API to show only published ones (visible: true)
  const visibleProducts = products?.data ?? [];

  return (
    <div>
      {/* Hero banner */}
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{
          minHeight: "34vh",
          background: "linear-gradient(180deg, #000 0%, var(--bg-alt) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "5rem 1.5rem 4rem",
        }}
      >
        <span className="label block mb-4" style={{ letterSpacing: "0.3em" }}>Collection 2026</span>
        <h1
          className="font-serif font-light"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)", color: "var(--text)", lineHeight: 1 }}
        >
          All products
        </h1>
        {products && (
          <p className="label mt-4" style={{ fontSize: "0.6rem" }}>
            {products.total} items
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {error && (
          <div className="text-center py-24">
            <p className="label">Unable to load products. Please try again later.</p>
          </div>
        )}

        {!error && visibleProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="label">No products available yet.</p>
          </div>
        )}

        {visibleProducts.length > 0 && (
          <div 
            className="gap-px" 
            style={{ 
              background: "var(--border)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gridAutoRows: "auto",
            }}
          >
            {visibleProducts.map((product) => (
              <div key={product.id} style={{ background: "var(--bg)" }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {products && products.last_page > 1 && (
          <div className="flex items-center justify-center gap-6 mt-16">
            {page > 1 && (
              <a href={`/products?page=${page - 1}`} className="btn-ghost" style={{ height: "2.75rem" }}>
                ← Previous
              </a>
            )}
            <span className="label" style={{ fontSize: "0.65rem" }}>
              {page} / {products.last_page}
            </span>
            {page < products.last_page && (
              <a href={`/products?page=${page + 1}`} className="btn-ghost" style={{ height: "2.75rem" }}>
                Next →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
