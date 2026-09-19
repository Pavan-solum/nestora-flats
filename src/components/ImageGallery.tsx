"use client";

import Image from "next/image";
import { useState } from "react";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow)] sm:aspect-[16/10] sm:rounded-[1.4rem]">
        <Image
          src={current}
          alt={`${title} photo ${active + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 900px) 100vw, 60vw"
          priority
        />
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`relative aspect-[4/3] w-[28%] min-w-[5.5rem] shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-auto sm:min-w-0 ${
              active === index ? "border-sage" : "border-transparent opacity-80 hover:opacity-100"
            }`}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}
