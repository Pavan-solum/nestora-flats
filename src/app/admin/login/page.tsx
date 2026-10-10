"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { BusyButton } from "@/components/BusyButton";
import { PasswordField } from "@/components/PasswordField";

export default function AdminLoginPage() {
  const { isAdmin, sessionChecked, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (sessionChecked && isAdmin) router.replace("/admin");
  }, [sessionChecked, isAdmin, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (signingIn) return;
    setSigningIn(true);
    setError("");
    try {
      const message = await login(email.trim(), password);
      if (message) {
        setError(message);
        return;
      }
      router.push("/admin");
    } finally {
      setSigningIn(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div className="container-shell section-space !pt-10">
        <p className="text-ink-soft">Loading admin…</p>
      </div>
    );
  }

  return (
    <div className="container-shell section-space !pt-10">
      <div className="mx-auto max-w-md surface p-6 md:p-8">
        <h1 className="font-display text-4xl">Admin login</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Sign in with the staff email from Supabase to manage flats and enquiry leads.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              aria-invalid={error ? true : undefined}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordField
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <BusyButton type="submit" pending={signingIn} pendingLabel="Signing in…" className="btn btn-primary w-full">
            Sign in
          </BusyButton>
        </form>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-sage">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
