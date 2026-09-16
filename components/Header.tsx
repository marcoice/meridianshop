"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/products?category=new", label: "New arrivals" },
];

export default function Header() {
  const { toggleCart, itemCount } = useCart();
  const count = itemCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-30 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(0,0,0,0.96)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--border)"
            : "1px solid transparent",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-6 flex items-center justify-between"
          style={{ height: scrolled ? "60px" : "80px", transition: "height 0.5s cubic-bezier(0.16,1,0.3,1)" }}
        >
          {/* Left nav — desktop */}
          <nav className="hidden md:flex items-center gap-10 flex-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="label hover:text-[var(--text)] transition-colors"
                style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Logo — centered */}
          <Link
            href="/"
            className="font-serif font-light tracking-[0.3em] uppercase text-[var(--text)] hover:text-[var(--gold)] transition-colors text-center flex-1 md:text-center"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.3rem)" }}
          >
            MERIDIAN
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            <button
              onClick={toggleCart}
              className="relative label hover:text-[var(--text)] transition-colors flex items-center gap-2"
              aria-label="Open cart"
              style={{ color: "var(--text-2)" }}
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {count > 0 && (
                <>
                  <span className="hidden sm:inline" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
                    {count}
                  </span>
                  <span
                    className="sm:hidden absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-bold text-black rounded-full"
                    style={{ width: 15, height: 15, background: "var(--gold)" }}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                </>
              )}
            </button>

            {/* Mobile menu */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              style={{ color: "var(--text-2)" }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu overlay ─────────────────────────── */}
      <div
        className="fixed inset-0 z-20 flex flex-col md:hidden transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.98)",
          backdropFilter: "blur(12px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-10 px-8">
          <Link
            href="/"
            className="font-serif font-light tracking-[0.35em] uppercase text-[var(--text)]"
            style={{ fontSize: "2.5rem" }}
            onClick={() => setMenuOpen(false)}
          >
            MERIDIAN
          </Link>
          <div
            style={{ width: 40, height: 1, background: "var(--gold)" }}
          />
          {[...NAV, { href: "/cart", label: "Cart" }].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="label hover:text-[var(--text)] transition-colors"
              style={{ fontSize: "0.75rem", letterSpacing: "0.25em", color: "var(--text-2)" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
