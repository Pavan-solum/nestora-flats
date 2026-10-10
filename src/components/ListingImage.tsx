"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { DEFAULT_IMAGES } from "@/lib/seed";

const FALLBACK = DEFAULT_IMAGES[0];

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
      onError={(event) => {
        if (resolved !== FALLBACK) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
