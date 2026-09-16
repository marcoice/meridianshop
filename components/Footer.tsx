import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      {/* Top bar with brand */}
      <div
        className="text-center py-14 px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <p
          className="font-serif font-light tracking-[0.4em] uppercase"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", color: "var(--text)" }}
        >
          MERIDIAN
        </p>
        <p
          className="font-display font-light italic mt-2"
          style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)", color: "var(--gold)" }}
        >
          Crafted for distinction.
        </p>
      </div>

      {/* Links grid */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="label mb-5" style={{ letterSpacing: "0.25em" }}>
            Shop
          </p>
          <ul className="space-y-3">
            {[
              { href: "/products", label: "All products" },
              { href: "/products?category=new", label: "New arrivals" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{ fontSize: "0.8rem", color: "var(--text-3)" }}
                  className="hover:text-[var(--text)] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label mb-5" style={{ letterSpacing: "0.25em" }}>
            Info
          </p>
          <ul className="space-y-3">
            {[
              { href: "/shipping", label: "Shipping & returns" },
              { href: "/privacy", label: "Privacy policy" },
              { href: "/terms", label: "Terms of service" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{ fontSize: "0.8rem", color: "var(--text-3)" }}
                  className="hover:text-[var(--text)] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label mb-5" style={{ letterSpacing: "0.25em" }}>
            Service
          </p>
          <ul className="space-y-3">
            {[
              { href: "/cart", label: "Shopping cart" },
              { href: "/checkout", label: "Checkout" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{ fontSize: "0.8rem", color: "var(--text-3)" }}
                  className="hover:text-[var(--text)] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label mb-5" style={{ letterSpacing: "0.25em" }}>
            Brand
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.8, maxWidth: "20ch" }}>
            Premium print on demand.
            <br />
            Shipped worldwide.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.1em" }}>
          © {new Date().getFullYear()} Meridian. All rights reserved.
        </p>
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.1em" }}>
          Powered by Printify
        </p>
      </div>
    </footer>
  );
}
