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

  return (
    <div className="py-10 lg:pr-12 space-y-2">
      {/* Main image */}
      <div
        className="overflow-hidden"
        style={{ aspectRatio: "1/1", background: "var(--surface)" }}
      >
        {activeSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeSrc}
            alt={title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-1">
          {images.slice(0, 10).map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              onClick={() => setActiveSrc(img.src)}
              className="overflow-hidden focus-visible:ring-1 focus-visible:ring-[var(--gold)] focus:outline-none"
              style={{
                aspectRatio: "1/1",
                background: "var(--surface)",
                border: activeSrc === img.src
                  ? "1px solid var(--gold)"
                  : "1px solid transparent",
                transition: "border-color 0.2s",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={`${title} — view ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-200 hover:opacity-100"
                style={{ opacity: activeSrc === img.src ? 1 : 0.5 }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
