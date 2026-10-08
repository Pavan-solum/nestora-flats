import { describe, expect, it } from "vitest";
import { firstFieldError, validateEnquiry, validateFlatInput } from "./validation";

const flat = {
  title: "Mars Mount",
  price: 13500000,
  city: "Bengaluru",
  area: "JP Nagar",
};

describe("validateFlatInput", () => {
  it("accepts a listing with a positive price", () => {
    expect(firstFieldError(validateFlatInput(flat))).toBeNull();
  });

  it("requires title, city, area, and a price above zero", () => {
    const errors = validateFlatInput({ title: "  ", price: 0, city: "", area: "" });
    expect(errors.title).toBe("Title is required.");
    expect(errors.price).toBe("Starting price must be greater than 0.");
    expect(errors.city).toBe("City is required.");
    expect(errors.area).toBe("Area is required.");
  });

  it("rejects a negative bedroom count and allows a blank one", () => {
    expect(validateFlatInput({ ...flat, bedrooms: -1 }).bedrooms).toMatch(/0 or greater/);
    expect(validateFlatInput({ ...flat, bedrooms: null }).bedrooms).toBeUndefined();
  });
});

describe("validateEnquiry", () => {
  it("accepts a buy enquiry", () => {
    expect(
      firstFieldError(
        validateEnquiry({
          intent: "buy",
          name: "Ada",
          email: "ada@example.com",
          phone: "+91 98765 43210",
          message: "I want to visit Mars Mount.",
        }),
      ),
    ).toBeNull();
  });

  it("rejects a short phone, a bad email, and a missing message", () => {
    const errors = validateEnquiry({
      intent: "rent",
      name: "",
      email: "not-an-email",
      phone: "123",
      message: " ",
    });
    expect(errors.name).toBe("Name is required.");
    expect(errors.email).toBe("Enter a valid email.");
    expect(errors.phone).toMatch(/8 digits/);
    expect(errors.message).toBe("Message is required.");
    expect(errors.intent).toBe("Intent must be buy or sell.");
  });
});
