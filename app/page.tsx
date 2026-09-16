import Link from "next/link";
import { getFirstShopId, getProducts } from "@/lib/printify";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

async function getFeaturedProducts() {
  try {
    const shopId = await getFirstShopId();
    const res = await getProducts(shopId, 1, 6);
    return res.data.filter((p) => p.visible).slice(0, 6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#000]">

        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "70vw", height: "60vh",
              background: "radial-gradient(ellipse at center, rgba(212,168,83,0.07) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center text-center">

          {/* Season label */}
          <div className="anim-fade-up anim-d1 flex items-center gap-4 mb-12">
            <span style={{ width: 40, height: 1, background: "var(--gold)", display: "block" }} />
            <span className="label tracking-[0.35em]">Collection 2026</span>
            <span style={{ width: 40, height: 1, background: "var(--gold)", display: "block" }} />
          </div>

          {/* Main headline — Cormorant Garamond display serif */}
          <h1
            className="anim-fade-up anim-d2 font-serif font-light leading-[0.9] tracking-[-0.01em] text-[#F5F2EE]"
            style={{ fontSize: "clamp(4.5rem, 14vw, 13rem)" }}
          >
            MERIDIAN
          </h1>

          {/* Italic subtitle */}
          <p
            className="anim-fade-up anim-d3 font-display font-light text-[var(--gold)] leading-tight mt-4"
            style={{ fontSize: "clamp(1.4rem, 3.5vw, 3rem)", fontStyle: "italic" }}
          >
            Crafted for distinction.
          </p>

          {/* Descriptor */}
          <p className="anim-fade-up anim-d4 label mt-8 max-w-xs leading-relaxed" style={{ letterSpacing: "0.18em" }}>
            Premium print on demand — produced only for you
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-d5 flex flex-col sm:flex-row items-center gap-4 mt-12">
            <Link href="/products" className="btn-gold min-w-[200px]">
              Shop the collection
            </Link>
            <Link href="/products" className="btn-ghost min-w-[180px]">
              Explore all
            </Link>
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 anim-fade-in anim-d5">
          <span className="label" style={{ letterSpacing: "0.3em", fontSize: "0.55rem" }}>
            SCROLL
          </span>
          <div
            style={{
              width: 1, height: 48,
              background: "linear-gradient(to bottom, var(--gold), transparent)",
            }}
          />
        </div>
      </section>

      {/* ── BAND: 3 pillars ──────────────────────────────────── */}
      <section
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#232321]">
          {[
            { num: "01", title: "Made to order", body: "Each piece printed exclusively for you — zero stock, zero waste." },
            { num: "02", title: "Ships worldwide", body: "Fast international delivery to 100+ countries with tracking." },
            { num: "03", title: "Premium materials", body: "State-of-the-art printing on carefully selected substrates." },
          ].map(({ num, title, body }) => (
            <div key={num} className="flex items-start gap-6 px-6 py-6 md:py-8">
              <span
                className="font-serif font-light leading-none flex-shrink-0"
                style={{ fontSize: "2.5rem", color: "var(--gold-dim)", marginTop: -4 }}
              >
                {num}
              </span>
              <div>
                <p className="text-[var(--text)] text-sm font-semibold tracking-wide mb-1">{title}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.65 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-28">
          {/* Section header */}
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="label block mb-3">New arrivals</span>
              <h2
                className="font-serif font-light leading-none text-[var(--text)]"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                The Collection
              </h2>
            </div>
            <Link
              href="/products"
              className="label hidden md:block hover:text-[var(--text)] transition-colors"
              style={{ color: "var(--text-2)" }}
            >
              View all →
            </Link>
          </div>

          {/* Editorial grid: first 2 items large, rest smaller */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--border)]">
            {featured.map((product, i) => (
              <div
                key={product.id}
                className={`bg-[#000] ${
                  i < 2 && featured.length > 3
                    ? "col-span-1 md:col-span-1"
                    : ""
                }`}
              >
                <ProductCard product={product} priority={i < 2} />
              </div>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/products" className="btn-ghost">
              View all products
            </Link>
          </div>
        </section>
      )}

      {/* ── EDITORIAL BANNER ─────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-32 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0A0907 0%, #000 50%, #0D0B08 100%)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Gold line top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
        />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p
            className="font-display font-light leading-tight text-[var(--text)]"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", fontStyle: "italic" }}
          >
            &ldquo;Every item tells a story.
            <br />
            Yours begins here.&rdquo;
          </p>
          <div
            className="mx-auto mt-8 mb-10"
            style={{ width: 40, height: 1, background: "var(--gold)" }}
          />
          <Link href="/products" className="btn-gold">
            Discover the collection
          </Link>
        </div>

        {/* Gold line bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
        />
      </section>
    </>
  );
}
