import { describe, expect, it } from "vitest";
import { bucketObjectPath } from "./map";

describe("bucketObjectPath", () => {
  it("reads a flat-images object path and ignores other urls", () => {
    expect(
      bucketObjectPath(
        "https://example.supabase.co/storage/v1/object/public/flat-images/listings/photo.jpg",
      ),
    ).toBe("listings/photo.jpg");
    expect(bucketObjectPath("https://images.unsplash.com/photo-1")).toBeNull();
    expect(
      bucketObjectPath(
        "https://example.supabase.co/storage/v1/object/public/flat-images/meta/extras.json",
      ),
    ).toBeNull();
  });
});
