"use client";

import { useEffect, useState } from "react";
import type { PrintifyImage } from "@/lib/types";

interface Props {
  images: PrintifyImage[];
  title: string;
}

export default function ProductImageGallery({ images, title }: Props) {
  const [activeSrc, setActiveSrc] = useState("");

  useEffect(() => {
    const defaultImg = images.find((img) => img.is_default) ?? images[0];
    setActiveSrc(defaultImg?.src ?? "");
  }, [images]);

  const safeImages = images.length > 0 ? images : [];

  return (
    <div className="py-10 lg:pr-12 space-y-3">
      <div
        className="overflow-hidden rounded-[2px] border border-[var(--border)]"
        style={{
          aspectRatio: "1/1",
          background: "linear-gradient(180deg, #f7f4ef 0%, #f0eee8 100%)",
          boxShadow: "inset 0 0 0 1px rgba(20,20,20,0.02)",
        }}
      >
        {activeSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeSrc}
            alt={title}
            className="w-full h-full transition-opacity duration-300"
            style={{ objectFit: "contain", padding: "2rem", background: "transparent" }}
          />
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.slice(0, 10).map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              onClick={() => setActiveSrc(img.src)}
              className="overflow-hidden rounded-[2px] focus-visible:ring-1 focus-visible:ring-[var(--gold)] focus:outline-none"
              style={{
                aspectRatio: "1/1",
                background: "linear-gradient(180deg, #f7f4ef 0%, #f0eee8 100%)",
                border: activeSrc === img.src
                  ? "1px solid var(--gold)"
                  : "1px solid var(--border)",
                transition: "border-color 0.2s, transform 0.2s ease",
                transform: activeSrc === img.src ? "translateY(-1px)" : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={`${title} — view ${i + 1}`}
                loading="lazy"
                className="w-full h-full transition-opacity duration-200 hover:opacity-100"
                style={{
                  objectFit: "contain",
                  opacity: activeSrc === img.src ? 1 : 0.6,
                  padding: "0.35rem",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
