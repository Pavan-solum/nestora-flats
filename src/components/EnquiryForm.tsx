"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import type { EnquiryIntent } from "@/lib/types";
import { CITY_OPTIONS, getAreasForCity } from "@/lib/locations";

type Props = {
  defaultFlatId?: string;
  defaultIntent?: EnquiryIntent;
};

export function EnquiryForm({
  defaultFlatId = "",
  defaultIntent = "buy",
}: Props) {
  const { flats, submitEnquiry } = useApp();
  const available = useMemo(
    () => flats.filter((f) => f.status !== "sold"),
    [flats],
  );

  const [intent, setIntent] = useState<EnquiryIntent>(defaultIntent);
  const [flatId, setFlatId] = useState(defaultFlatId);
  const [city, setCity] = useState("Bengaluru");
  const [area, setArea] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredVisit, setPreferredVisit] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const areas = getAreasForCity(city);

  useEffect(() => {
    setFlatId(defaultFlatId);
  }, [defaultFlatId]);

  useEffect(() => {
    setIntent(defaultIntent);
  }, [defaultIntent]);

  useEffect(() => {
    if (defaultFlatId) {
      const flat = flats.find((f) => f.id === defaultFlatId);
      if (flat) {
        setCity(flat.city);
        setArea(flat.area);
      }
    }
  }, [defaultFlatId, flats]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError("Please fill in name, email, phone, and message for our agent.");
      return;
    }
    const flat = flats.find((f) => f.id === flatId);
    submitEnquiry({
      intent,
      flatId: intent === "buy" && flatId ? flatId : undefined,
      flatTitle: intent === "buy" ? flat?.title : undefined,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredVisit:
        intent === "buy" && preferredVisit ? preferredVisit : undefined,
      city,
      area: area || undefined,
      message: message.trim(),
    });
    setSent(true);
    setName("");
    setEmail("");
    setPhone("");
    setPreferredVisit("");
    setMessage("");
  };

  if (sent) {
    return (
      <div className="surface p-6 md:p-8">
        <p className="chip chip-sage mb-3">Request received</p>
        <h3 className="font-display text-3xl">A Nestora agent will call you</h3>
        <p className="mt-3 max-w-xl text-ink-soft">
          Thanks — your {intent === "buy" ? "buying" : "selling"} request is
          with our marketing desk. A Nestora agent typically responds within 24
          hours to guide the next steps. Buyers and sellers never deal directly
          here; Nestora coordinates both sides.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-6"
          onClick={() => setSent(false)}
        >
          Contact agent again
        </button>
      </div>
    );
  }

  return (
    <form className="surface space-y-4 p-4 sm:p-6 md:p-8" onSubmit={onSubmit}>
      <div>
        <h3 className="font-display text-2xl sm:text-3xl">Contact a Nestora agent</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Whether you want to buy or sell a flat, share your details and a
          Nestora marketing agent will assist you — we handle introductions,
          visits, and negotiation support.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field md:col-span-2">
          <label>I want to</label>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              className={`chip !justify-center !py-2.5 ${intent === "buy" ? "chip-sage" : ""}`}
              onClick={() => setIntent("buy")}
            >
              Buy a flat
            </button>
            <button
              type="button"
              className={`chip !justify-center !py-2.5 ${intent === "sell" ? "chip-sage" : ""}`}
              onClick={() => setIntent("sell")}
            >
              Sell my flat
            </button>
          </div>
        </div>

        {intent === "buy" && (
          <div className="field md:col-span-2">
            <label htmlFor="flat">Interested listing (optional)</label>
            <select
              id="flat"
              value={flatId}
              onChange={(e) => {
                const id = e.target.value;
                setFlatId(id);
                const flat = flats.find((f) => f.id === id);
                if (flat) {
                  setCity(flat.city);
                  setArea(flat.area);
                }
              }}
            >
              <option value="">Help me find a flat</option>
              {available.map((flat) => (
                <option key={flat.id} value={flat.id}>
                  {flat.title} — {flat.area}, {flat.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="city">City</label>
          <select
            id="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setArea("");
            }}
          >
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="area">Preferred area</label>
          <select
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="">Any / not sure</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 ..."
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>
        {intent === "buy" && (
          <div className="field">
            <label htmlFor="visit">Preferred site visit</label>
            <input
              id="visit"
              type="date"
              value={preferredVisit}
              onChange={(e) => setPreferredVisit(e.target.value)}
            />
          </div>
        )}
        <div className="field md:col-span-2">
          <label htmlFor="message">
            {intent === "buy"
              ? "Tell our agent what you need"
              : "Tell our agent about your flat"}
          </label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              intent === "buy"
                ? "Budget range, BHK, facing preference, timeline..."
                : "BHK, location, expected price, documents readiness..."
            }
          />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" className="btn btn-primary btn-full-mobile w-full sm:w-auto">
        Contact Nestora agent
      </button>
    </form>
  );
}
