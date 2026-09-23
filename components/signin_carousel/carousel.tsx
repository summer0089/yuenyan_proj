"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CarouselItem } from "@/utils/types/carousel_item";

interface CarouselProps {
  items: CarouselItem[];
}

export default function Carousel({ items }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto transition
  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
        No images available
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      {/* Carousel Images with cross-fade animation */}
      <div className="absolute inset-0 w-full h-full">
        {items.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${idx === activeIndex
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-105 z-0"
              }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="50vw"
              priority={idx === 0}
              className="object-cover select-none"
            />
            {/* Subtle dark overlays for premium reading contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/1 to-transparent z-20" />
          </div>
        ))}
      </div>

      {/* Captions Section */}
      <div className="absolute bottom-20 left-0 right-0 z-30 px-10 text-center text-white">
        {items.map((img, idx) => (
          <div
            key={idx}
            className={`transition-all duration-700 ease-in-out transform ${idx === activeIndex
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none absolute left-0 right-0"
              }`}
          >
            <h2 className="text-2xl font-bold tracking-wide sm:text-3xl lg:text-4xl mb-1.5 drop-shadow-lg text-white">
              {img.title}
            </h2>
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-3 drop-shadow-md">
              {img.location}
            </p>
            <p className="text-sm text-slate-200/90 max-w-md mx-auto leading-relaxed drop-shadow-md font-light">
              {img.description}
            </p>
          </div>
        ))}
      </div>

      {/* Capsule Indicators Section below captions */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center items-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ease-in-out cursor-pointer ${idx === activeIndex
              ? "bg-white w-8"
              : "bg-white/30 hover:bg-white/60 w-2.5"
              }`}
            aria-label={`ไปที่ภาพที่ ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
