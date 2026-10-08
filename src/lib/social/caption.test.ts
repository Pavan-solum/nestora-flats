import { describe, expect, it } from "vitest";
import { listingCaption } from "./caption";
import { networksToPublish, publishFailureMessage } from "./types";

describe("social posts", () => {
  it("builds a caption from the listing", () => {
    const caption = listingCaption({
      title: "Mars Mount",
      price: 13500000,
      area: "JP Nagar",
      city: "Bengaluru",
      amenities: ["Gym", "Pool"],
    });
    expect(caption).toContain("Mars Mount");
    expect(caption).toContain("JP Nagar, Bengaluru");
    expect(caption).toContain("Gym, Pool");
    expect(caption).toContain("Enquire with Nestora.");
  });

  it("turns a Meta refusal into a short message", () => {
    expect(publishFailureMessage("(#200) The permission(s) pages_manage_posts are not available.")).toContain(
      "pages_manage_posts",
    );
    expect(publishFailureMessage("(#200) Unpublished posts must be posted to a page as the page itself.")).toContain(
      "published as the Page",
    );
    expect(publishFailureMessage("")).toContain("draft is still here");
  });

  it("does not publish a network that already succeeded", () => {
    expect(
      networksToPublish(
        ["facebook", "instagram"],
        [{ network: "facebook", ok: true, remoteId: "1" }],
      ),
    ).toEqual(["instagram"]);
  });
});
