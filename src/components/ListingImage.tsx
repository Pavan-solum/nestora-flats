"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { DEFAULT_IMAGES } from "@/lib/seed";

const FALLBACK = DEFAULT_IMAGES[0];

function optimizedHost(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return false;
    if (url.hostname === "images.unsplash.com") return true;
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(supabase && url.hostname === new URL(supabase).hostname);
  } catch {
    return false;
  }
}

type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  priority?: boolean;
  eager?: boolean;
};

export function ListingImage({
  src,
  alt,
  priority = false,
  eager = false,
  onError,
  ...rest
}: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = !src || failed ? FALLBACK : src;

  const load = priority
    ? { preload: true as const, fetchPriority: "high" as const }
    : eager
      ? { loading: "eager" as const }
      : { loading: "lazy" as const };

  return (
    <Image
      {...rest}
      {...load}
      src={resolved}
      alt={alt}
      unoptimized={!optimizedHost(resolved)}
      onError={(event) => {
        if (resolved !== FALLBACK) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
